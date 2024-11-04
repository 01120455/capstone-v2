"use client";

import React, { useCallback, useContext, useMemo, useRef } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import transactionSchema, {
  Transaction,
  TransactionItem,
  TransactionOnly,
  TransactionTable,
} from "@/schemas/transaction.schema";
import transactionItemSchema, {
  TransactionItemOnly,
} from "@/schemas/transactionitem.schema";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  PlusIcon,
  ViewIcon,
  FilePenIcon,
  FilterIcon,
} from "@/components/icons/Icons";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { userSessionContext } from "@/components/sessionContext-provider";

const ROLES = {
  SALES: "sales",
  INVENTORY: "inventory",
  MANAGER: "manager",
  ADMIN: "admin",
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const ROWS_PER_PAGE = 10;

const useFilters = () => {
  const [filters, setFilters] = useState({
    purordno: "",
    name: "",
    frommilling: "",
    status: "",
    dateRange: { start: "", end: "" },
  });

  const clear = () => {
    setFilters({
      purordno: "",
      name: "",
      frommilling: "",
      status: "",
      dateRange: { start: "", end: "" },
    });
  };

  return {
    filters,
    setFilters,
    clear,
  };
};

const usePurchases = () => {
  const { filters, setFilters, clear } = useFilters();
  const [purchases, setPurchases] = useState<TransactionTable[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchPurchases = useCallback(
    async (page: number) => {
      if (isNaN(page) || page < 1) return;

      try {
        const params = new URLSearchParams({
          limit: ROWS_PER_PAGE.toString(),
          page: page.toString(),
        });

        if (filters.purordno) {
          params.append("documentnumber", filters.purordno);
        }
        if (filters.name) {
          params.append("name", filters.name);
        }
        if (filters.frommilling) {
          params.append("frommilling", filters.frommilling);
        }
        if (filters.status) {
          params.append("status", filters.status);
        }
        if (filters.dateRange.start) {
          params.append("startdate", filters.dateRange.start);
        }
        if (filters.dateRange.end) {
          params.append("enddate", filters.dateRange.end);
        }

        const response = await fetch(
          `/api/purchase/purchasepagination?${params}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setPurchases(data);

        const totalPurchasesResponse = await fetch(`/api/purchase`);
        const totalRowsData = await totalPurchasesResponse.json();
        setTotalPages(Math.ceil(totalRowsData.length / ROWS_PER_PAGE));
      } catch (error) {
        console.error("Error fetching purchases:", error);
      }
    },
    [filters]
  );

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const shouldDebounce = filters.purordno || filters.name;

    if (shouldDebounce) {
      const timer = setTimeout(() => fetchPurchases(currentPage), 2000);
      setDebounceTimeout(timer);
    } else {
      fetchPurchases(currentPage);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [filters.purordno, filters.name, currentPage, fetchPurchases]);

  const refreshPurchases = () => {
    setFilters({
      purordno: "",
      name: "",
      frommilling: "",
      status: "",
      dateRange: { start: "", end: "" },
    });
    fetchPurchases(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    clear();
    fetchPurchases(1);
  };

  return {
    purchases,
    currentPage,
    totalPages,
    handlePageChange,
    filters,
    setFilters,
    refreshPurchases,
    clearFilters,
  };
};

const usePurchaseItems = () => {
  const [purchaseItems, setPurchaseItems] = useState<TransactionItem[]>([]);

  const viewPurchaseItems = async (purchaseId: number) => {
    try {
      const response = await fetch(
        `/api/transactionitem/purchaseitem/${purchaseId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const items = await response.json();
      setPurchaseItems(items);
    } catch (error) {
      console.error("Error fetching purchase items:", error);
    }
  };

  return {
    purchaseItems,
    setPurchaseItems,
    viewPurchaseItems,
  };
};

export default function Component() {
  const user = useContext(userSessionContext);
  const {
    purchases,
    currentPage,
    totalPages,
    handlePageChange,
    filters,
    setFilters,
    refreshPurchases,
    clearFilters,
  } = usePurchases();
  const { purchaseItems, setPurchaseItems, viewPurchaseItems } =
    usePurchaseItems();
  const [showModal, setShowModal] = useState(false);
  const [showModalEditPurchase, setShowModalEditPurchase] = useState(false);
  const [showModalPurchaseItem, setShowModalPurchaseItem] = useState(false);
  const [showTablePurchaseItem, setShowTablePurchaseItem] = useState(false);

  console.log("user session:", user);

  const form = useForm<Transaction>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactionid: 0,
      transactiontype: "purchase",
      status: "pending",
      walkin: false,
      frommilling: false,
      DocumentNumber: {
        documentnumberid: 0,
        documentnumber: "",
      },
      TransactionItem: [
        {
          transactionitemid: 0,
          Item: {
            itemid: 0,
            itemname: "",
            itemtype: "palay",
            sackweight: "bag25kg",
          },
          unitofmeasurement: "",
          stock: 0,
          unitprice: 0,
        },
      ],
    },
  });

  const formPurchaseItemOnly = useForm<TransactionItemOnly>({
    resolver: zodResolver(transactionItemSchema),
    defaultValues: {
      transactionitemid: 0,
      transactionid: 0,
      Item: {
        itemid: 0,
        itemname: "",
        itemtype: "palay",
        sackweight: "bag25kg",
      },
      unitofmeasurement: "",
      stock: 0,
      unitprice: 0,
    },
  });

  const formPurchaseOnly = useForm<TransactionOnly>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactionid: 0,
      transactiontype: "purchase",
      status: "pending",
      walkin: false,
      frommilling: false,
      DocumentNumber: {
        documentnumberid: 0,
        documentnumber: "",
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "TransactionItem",
  });

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

  useEffect(() => {
    console.log(formPurchaseOnly.formState.errors);
  }, [formPurchaseOnly.formState.errors]);

  useEffect(() => {
    console.log(formPurchaseItemOnly.formState.errors);
  }, [formPurchaseItemOnly.formState.errors]);

  const handleAddPurchase = () => {
    setShowModal(true);

    form.reset({
      transactionid: 0,
      transactiontype: "purchase",
      status: "pending",
      walkin: false,
      frommilling: false,
      DocumentNumber: {
        documentnumberid: 0,
        documentnumber: "",
      },
      TransactionItem: [
        {
          transactionitemid: 0,
          Item: {
            itemid: 0,
            itemname: "",
            itemtype: "palay",
            sackweight: "bag25kg",
          },
          unitofmeasurement: "",
          stock: 0,
          unitprice: 0,
        },
      ],
    });
  };

  const handleEditPurchaseItem = (purchaseItem: TransactionItemOnly) => {
    setShowModalPurchaseItem(true);
    console.log("Editing purchase item:", purchaseItem);

    formPurchaseItemOnly.reset({
      transactionitemid: purchaseItem?.transactionitemid,
      transactionid: purchaseItem.transactionid,
      Item: {
        itemid: purchaseItem.Item?.itemid,
        itemname: purchaseItem.Item?.itemname,
        itemtype: purchaseItem.Item?.itemtype,
        sackweight: purchaseItem.Item?.sackweight,
      },
      unitofmeasurement: purchaseItem?.unitofmeasurement,
      stock: purchaseItem?.stock,
      unitprice: purchaseItem?.unitprice,
    });
  };

  const handleAddPurchaseItem = (transactionid: number) => {
    setShowModalPurchaseItem(true);
    console.log("Adding purchase item:", transactionid);

    formPurchaseItemOnly.reset({
      transactionitemid: 0,
      transactionid: transactionid,
      Item: {
        itemid: 0,
        itemname: "",
        itemtype: "palay",
        sackweight: "bag25kg",
      },
      unitofmeasurement: "",
      stock: 0,
      unitprice: 0,
    });
  };

  const handleEdit = (purchase: TransactionOnly) => {
    console.log("Editing purchase:", purchase);
    setShowModalEditPurchase(true);

    formPurchaseOnly.reset({
      transactionid: purchase.transactionid,
      transactiontype: purchase.transactiontype,
      status: purchase.status,
      walkin: purchase.walkin,
      frommilling: purchase.frommilling,
      DocumentNumber: {
        documentnumberid: purchase.DocumentNumber.documentnumberid,
        documentnumber: purchase.DocumentNumber.documentnumber,
      },
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    setShowModalPurchaseItem(false);
    setShowModalEditPurchase(false);

    form.reset({
      transactionid: 0,
      transactiontype: "purchase",
      status: "pending",
      walkin: false,
      frommilling: false,
      DocumentNumber: {
        documentnumberid: 0,
        documentnumber: "",
      },
      TransactionItem: [
        {
          transactionitemid: 0,
          Item: {
            itemid: 0,
            itemname: "",
            itemtype: "palay",
            sackweight: "bag25kg",
          },
          unitofmeasurement: "",
          stock: 0,
          unitprice: 0,
        },
      ],
    });

    formPurchaseItemOnly.reset({
      transactionitemid: 0,
      Item: {
        itemid: 0,
        itemname: "",
        itemtype: "palay",
        sackweight: "bag25kg",
      },
      unitofmeasurement: "",
      stock: 0,
      unitprice: 0,
    });

    formPurchaseOnly.reset({
      transactionid: 0,
      transactiontype: "purchase",
      status: "pending",
      walkin: false,
      frommilling: false,
      DocumentNumber: {
        documentnumberid: 0,
        documentnumber: "",
      },
    });
  };

  const handleViewPurchaseItem = (purchase: TransactionTable) => {
    setPurchaseItems(purchase.TransactionItem);
    setShowTablePurchaseItem(true);
  };

  const closeViewPurchaseItem = () => {
    setShowTablePurchaseItem(false);
  };

  const handleSubmit = async (values: Transaction) => {
    console.log("Form Values:", values);
    const formData = new FormData();

    formData.append("transactiontype", values.transactiontype);
    formData.append("status", values.status);
    formData.append("walkin", values.walkin.toString());
    formData.append("frommilling", values.frommilling.toString());
    formData.append(
      "documentnumber",
      values.DocumentNumber.documentnumber || ""
    );

    values.TransactionItem !== undefined
      ? values.TransactionItem.forEach((item, index) => {
          formData.append(
            `TransactionItem[${index}][item][itemname]`,
            item.Item.itemname
          );
          formData.append(
            `TransactionItem[${index}][item][itemtype]`,
            item.Item.itemtype
          );
          formData.append(
            `TransactionItem[${index}][item][sackweight]`,
            item.Item.sackweight
          );
          formData.append(
            `TransactionItem[${index}][unitofmeasurement]`,
            item.unitofmeasurement
          );
          formData.append(
            `TransactionItem[${index}][stock]`,
            item.stock.toString()
          );
          formData.append(
            `TransactionItem[${index}][unitprice]`,
            item.unitprice.toString()
          );
        })
      : null;

    try {
      let method = "POST";
      let endpoint = "/api/purchase";

      if (values.transactionid) {
        method = "PUT";
        endpoint = `/api/purchase/purchaseedit/${values.transactionid}`;
        formData.append("transactionid", values.transactionid.toString());
      }

      const uploadRes = await fetch(endpoint, {
        method: method,
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadResult = await uploadRes.json();
        if (values.transactionid) {
          toast.success(
            `Purchase Order No. ${""} ${formPurchaseOnly.getValues(
              "DocumentNumber.documentnumber"
            )} ${""} has been updated`,
            {
              description: "You have successfully edited the purchase.",
            }
          );
          console.log("Purchase updated successfully");
        } else {
          toast.success(
            `Purchase Order No. ${""} ${form.getValues(
              "DocumentNumber.documentnumber"
            )} ${""} has been added`,
            {
              description: "You have successfully added the purchase.",
            }
          );
          console.log("Purchase added successfully");
        }

        console.log("Upload Result:", uploadResult);
        setShowModal(false);
        setShowModalEditPurchase(false);
        refreshPurchases();
        form.reset();
      } else {
        console.error("Upload failed", await uploadRes.text());
      }
    } catch (error) {
      console.error("Error adding/updating purchase:", error);
    }
  };

  const handleSubmitEditPurchaseItem = async (values: TransactionItemOnly) => {
    if (!values.transactionid) {
      console.error("Transaction ID is required.");
      return;
    }

    const isUpdate = !!values.transactionitemid;
    const endpoint = isUpdate
      ? `/api/purchaseitem/purchaseitem/${values.transactionitemid}`
      : `/api/purchaseitem/purchaseitem/${values.transactionid}`;

    const formData = new FormData();
    formData.append("Item[itemname]", values.Item.itemname);
    formData.append("Item[itemtype]", values.Item.itemtype);
    formData.append("Item[sackweight]", values.Item.sackweight);
    formData.append("unitofmeasurement", values.unitofmeasurement);
    formData.append("stock", values.stock.toString());
    formData.append("unitprice", values.unitprice.toString());
    formData.append("transactionid", values.transactionid.toString());

    try {
      const uploadRes = await fetch(endpoint, {
        method: isUpdate ? "PUT" : "POST",
        body: formData,
      });

      if (uploadRes.ok) {
        if (values.transactionid && !values.transactionitemid) {
          toast.success(
            `Successfully added Item ${formPurchaseItemOnly.getValues(
              "Item.itemname"
            )} `,
            {
              description:
                "You have successfully added an item to the purchase.",
            }
          );
          console.log("Purchase Item added successfully");
        }

        if (values.transactionitemid) {
          toast.success(
            `Successfully updated Item ${formPurchaseItemOnly.getValues(
              "Item.itemname"
            )} `,
            {
              description:
                "You have successfully updated an item to the purchase.",
            }
          );
          console.log("Purchase item updated successfully");
        }
        console.log("Purchase Item processed successfully");
        setShowModalPurchaseItem(false);
        refreshPurchases();
        formPurchaseItemOnly.reset();
      } else {
        console.error("Operation failed", await uploadRes.text());
      }
    } catch (error) {
      console.error("Error processing purchase item:", error);
    }
  };

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const canAccessButton = (role: String) => {
    if (user?.role === ROLES.ADMIN) return true;
    if (user?.role === ROLES.MANAGER) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.SALES) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.INVENTORY) return role !== ROLES.ADMIN;
    return false;
  };

  console.log("User role:", user?.role);

  const transactionData = {
    transactionid: formPurchaseOnly.getValues("transactionid") || 0,
    transactiontype:
      formPurchaseOnly.getValues("transactiontype") || "purchase",
    status: formPurchaseOnly.getValues("status") || "pending",
    walkin: formPurchaseOnly.getValues("walkin") || false,
    frommilling: formPurchaseOnly.getValues("frommilling") || false,
    DocumentNumber: {
      documentnumberid: formPurchaseOnly.getValues(
        "DocumentNumber.documentnumberid"
      ),
      documentnumber:
        formPurchaseOnly.getValues("DocumentNumber.documentnumber") || "",
    },
  };

  const userActionWithAccess = (
    id: number,
    role: string,
    transactionData: any
  ) => {
    if (!role) {
      return "access denied";
    }

    const canAccessInput = () => {
      if (user?.role === ROLES.ADMIN) return true;
      if (user?.role === ROLES.MANAGER) return role !== ROLES.ADMIN;
      if (user?.role === ROLES.SALES) return role !== ROLES.ADMIN;
      if (user?.role === ROLES.INVENTORY) return role !== ROLES.ADMIN;
      return false;
    };

    if (!canAccessInput()) {
      return "access denied";
    }

    if (id === 0) {
      return "add";
    }

    const parsedData = transactionSchema.safeParse(transactionData);

    console.log("Parsed Data:", parsedData);

    if (parsedData.success) {
      const data = parsedData.data;
      if (data.transactionid === id) {
        return "edit";
      }
    } else {
      console.error("Validation failed:", parsedData.error);
      return "error";
    }
  };

  const transactionId = formPurchaseOnly.getValues("transactionid");

  const action = userActionWithAccess(
    transactionId,
    user?.role || "",
    transactionData
  );
  console.log(action);

  const handlePurchaseOrderChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, purordno: value }));
    handlePageChange(1);
  };

  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, name: value }));
    handlePageChange(1);
  };

  const renderFilters = () => (
    <Popover>
      <PopoverTrigger>
        <FilterIcon className="w-6 h-6" />
      </PopoverTrigger>
      <PopoverContent className="bg-customColors-offWhite rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4">Filters</h2>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Button onClick={clearAllFilters}>Clear Filters</Button>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="document-number">Purchase Order No.</Label>
            <Input
              id="document-number"
              type="text"
              placeholder="Enter Purchase Order No."
              value={filters.purordno}
              onChange={handlePurchaseOrderChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              type="text"
              placeholder="Enter Item name"
              value={filters.name}
              onChange={handleItemNameChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frommilling">From Milling</Label>
            <Select
              value={filters.frommilling}
              onValueChange={handleFromMillingChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </SelectTrigger>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </SelectTrigger>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => {
                const newValue = e.target.value;

                setFilters((prev) => ({
                  ...prev,
                  dateRange: {
                    ...prev.dateRange,
                    start: newValue,
                  },
                }));
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => {
                const newValue = e.target.value;

                setFilters((prev) => ({
                  ...prev,
                  dateRange: {
                    ...prev.dateRange,
                    end: newValue,
                  },
                }));
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value,
    }));
    handlePageChange(1);
  };

  const handleWalkinChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      walkin: value,
    }));
    handlePageChange(1);
  };

  const handleFromMillingChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      frommilling: value,
    }));
    handlePageChange(1);
  };

  const clearAllFilters = () => {
    clearFilters();
    handlePageChange(1);
  };

  const filteredPurchases = useMemo(() => {
    return purchases;
  }, [purchases]);

  const formatStock = (stock: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(stock);
  };

  return (
    <div className="flex min-h-screen w-full bg-customColors-lightPastelGreen">
      <div className="flex-1 overflow-y-auto pl-6 pr-6 w-full">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="grid gap-6 grid-cols-1">
            <div className="flex flex-col gap-6">
              <div className="flex  items-center justify-between mb-6 -mr-6">
                <h1 className="text-2xl font-bold ">
                  Company Purchase Order Management
                </h1>
              </div>
              <div className="flex items-center justify-between">
                <Input
                  type="text"
                  placeholder="Search purchase order no. ..."
                  value={filters.name}
                  onChange={handleItemNameChange}
                  className="w-full md:w-auto"
                />
                <div className="flex flex-row gap-2">
                  <Button onClick={handleAddPurchase}>
                    {isSmallScreen ? (
                      <PlusIcon className="w-6 h-6" />
                    ) : (
                      "Add Product"
                    )}
                  </Button>
                  {renderFilters()}
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="table-container relative ">
                  <ScrollArea>
                    <Table
                      style={{ width: "100%" }}
                      className="min-w-[1000px]  rounded-md border-border w-full h-10 overflow-clip relative bg-customColors-beigePaper"
                      // divClassname="min-h-[200px] overflow-y-scroll max-h-[400px] overflow-y-auto bg-customColors-offWhite rounded-md"
                    >
                      <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                        <TableRow className="bg-customColors-screenLightGreen hover:bg-customColors-screenLightGreen">
                          <TableHead>Purchase Order No.</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>From Milling</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Created by</TableHead>
                          {canAccessButton(ROLES.ADMIN) && (
                            <>
                              <TableHead>Created at</TableHead>
                            </>
                          )}
                          {canAccessButton(ROLES.ADMIN) && (
                            <>
                              <TableHead>Last Modify by</TableHead>
                              <TableHead>Last Modified at</TableHead>
                            </>
                          )}
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <>
                          {filteredPurchases.map((purchase) => (
                            <TableRow key={purchase.transactionid}>
                              <TableCell>
                                {purchase.DocumentNumber.documentnumber}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`px-2 py-1 rounded-full ${
                                    purchase.status === "paid"
                                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                      : purchase.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                      : purchase.status === "cancelled"
                                      ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" // Default case
                                  }`}
                                >
                                  {purchase.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {purchase.frommilling ? "Yes" : "No"}
                              </TableCell>
                              <TableCell>
                                {formatPrice(purchase.totalamount ?? 0)}
                              </TableCell>
                              {canAccessButton(ROLES.ADMIN) && (
                                <>
                                  <TableCell>
                                    {purchase.createdbyuser
                                      ? `${purchase.createdbyuser.firstname} ${purchase.createdbyuser.lastname}`
                                      : "N/A"}
                                  </TableCell>
                                </>
                              )}
                              <TableCell>
                                {purchase.createdat
                                  ? new Date(
                                      purchase.createdat
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "N/A"}
                              </TableCell>
                              {canAccessButton(ROLES.ADMIN) && (
                                <>
                                  <TableCell>
                                    {purchase.lastmodifiedbyuser
                                      ? `${purchase.lastmodifiedbyuser.firstname} ${purchase.lastmodifiedbyuser.lastname}`
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    {purchase.lastmodifiedat
                                      ? new Date(
                                          purchase.lastmodifiedat
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "N/A"}
                                  </TableCell>
                                </>
                              )}
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleViewPurchaseItem(purchase)
                                    }
                                  >
                                    <ViewIcon className="w-4 h-4" />
                                    <span className="sr-only">View</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(purchase)}
                                  >
                                    <FilePenIcon className="w-4 h-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  {/* {canAccessButton(ROLES.ADMIN) && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleDeletePurchase(purchase)
                                        }
                                      >
                                        <TrashIcon className="w-4 h-4" />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    </>
                                  )} */}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </>
                      </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                  <div className="flex items-center justify-center mt-4 mb-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            className="hover:bg-customColors-beigePaper"
                            onClick={() =>
                              handlePageChange(Math.max(1, currentPage - 1))
                            }
                          />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink
                              className="hover:bg-customColors-beigePaper"
                              onClick={() => handlePageChange(index + 1)}
                              isActive={currentPage === index + 1}
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            className="hover:bg-customColors-beigePaper"
                            onClick={() =>
                              handlePageChange(
                                Math.min(totalPages, currentPage + 1)
                              )
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              </div>
              {showTablePurchaseItem && purchaseItems && (
                <Dialog
                  open={showTablePurchaseItem}
                  onOpenChange={closeViewPurchaseItem}
                >
                  <DialogContent className="w-full max-w-full sm:min-w-[600px] md:w-[700px] lg:min-w-[1200px] p-4 bg-customColors-offWhite">
                    <DialogHeader>
                      <DialogTitle className="text-customColors-eveningSeaGreen">
                        Items Purchased
                      </DialogTitle>
                      <div className="flex  items-center justify-between mb-6 mr-12">
                        <DialogDescription>
                          List of items purchased
                        </DialogDescription>
                        <DialogClose onClick={closeViewPurchaseItem} />
                        {canAccessButton(ROLES.ADMIN) && (
                          <>
                            <Button
                              onClick={() => {
                                const transactionid =
                                  purchaseItems[0]?.transactionid;
                                handleAddPurchaseItem(transactionid);
                              }}
                            >
                              {isSmallScreen ? (
                                <PlusIcon className="w-6 h-6" />
                              ) : (
                                "Add Purchased Item"
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </DialogHeader>
                    <div className="overflow-y-auto">
                      <div className="table-container relative ">
                        <ScrollArea>
                          <Table
                            style={{ width: "100%" }}
                            className="min-w-[600px]  rounded-md border-border w-full h-10 overflow-clip relative"
                            divClassname="min-h-[200px] overflow-y-scroll max-h-[400px] overflow-y-auto"
                          >
                            <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                              <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
                                <TableHead>Item Name</TableHead>
                                <TableHead>Item Type</TableHead>
                                <TableHead>Sack Weight</TableHead>
                                <TableHead>Unit of Measurement</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Total Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <>
                                {purchaseItems &&
                                  purchaseItems.map(
                                    (purchaseItem, index: number) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {purchaseItem.Item.itemname}
                                        </TableCell>
                                        <TableCell>
                                          {purchaseItem.Item.itemtype}
                                        </TableCell>
                                        <TableCell>
                                          {purchaseItem.sackweight}
                                        </TableCell>
                                        <TableCell>
                                          {purchaseItem.unitofmeasurement}
                                        </TableCell>
                                        <TableCell>
                                          {formatStock(purchaseItem.stock)}
                                        </TableCell>
                                        <TableCell>
                                          {formatPrice(purchaseItem.unitprice)}
                                        </TableCell>
                                        <TableCell>
                                          {formatPrice(
                                            purchaseItem.totalamount
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                              </>
                            </TableBody>
                          </Table>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {showModal && (
                <Dialog open={showModal} onOpenChange={handleCancel}>
                  <DialogContent className="w-full max-w-full sm:min-w-[600px] md:w-[700px] lg:min-w-[1200px] p-4 bg-customColors-offWhite">
                    <DialogHeader>
                      <DialogTitle className="text-customColors-eveningSeaGreen">
                        {form.getValues("transactionid")
                          ? "Edit Purchase of Product"
                          : "Add New Purchase of Product"}
                      </DialogTitle>
                      <DialogDescription>
                        Fill out the form to{" "}
                        {form.getValues("transactionid")
                          ? "edit a"
                          : "add a new"}{" "}
                        purchased product to your inventory.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        className="w-full max-w-full  mx-auto p-4 sm:p-6"
                        onSubmit={form.handleSubmit(handleSubmit)}
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="DocumentNumber.documentnumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel htmlFor="documentnumber">
                                    Purchase Order No.
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      id="documentnumber"
                                      type="text"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel htmlFor="status">
                                    Payment Status
                                  </FormLabel>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      {...field}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status">
                                          {field.value}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">
                                          Pending
                                        </SelectItem>
                                        <SelectItem value="paid">
                                          Paid
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                          Cancelled
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="frommilling"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel htmlFor="frommilling">
                                    From Milling
                                  </FormLabel>
                                  <FormControl>
                                    <Select
                                      value={field.value ? "true" : "false"}
                                      onValueChange={(value) => {
                                        field.onChange(value === "true");
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select Value">
                                          {field.value ? "Yes" : "No"}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="true">
                                          Yes
                                        </SelectItem>
                                        <SelectItem value="false">
                                          No
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        {!form.getValues("transactionid") && (
                          <>
                            <div className="overflow-y-auto h-[300px] border rounded-lg p-2">
                              {fields.map((item, index) => (
                                <div
                                  key={item.id}
                                  className="grid grid-cols-2 lg:grid-cols-3 grid-rows-4 lg:grid-rows-2 gap-2 py-2"
                                >
                                  <div className="space-y-2">
                                    <FormField
                                      control={form.control}
                                      name={`TransactionItem.${index}.Item.itemname`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel htmlFor="itemname">
                                            Item Name
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              id="itemname"
                                              type="text"
                                              placeholder="Enter item name"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <FormField
                                      control={form.control}
                                      name={`TransactionItem.${index}.Item.itemtype`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel htmlFor="itemtype">
                                            Item Type
                                          </FormLabel>
                                          <FormControl>
                                            <Select
                                              onValueChange={field.onChange}
                                              defaultValue={field.value}
                                              {...field}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select Type">
                                                  {field.value}
                                                </SelectValue>
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="bigas">
                                                  Bigas
                                                </SelectItem>
                                                <SelectItem value="palay">
                                                  Palay
                                                </SelectItem>
                                                <SelectItem value="resico">
                                                  Resico
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <FormField
                                      control={form.control}
                                      name={`TransactionItem.${index}.Item.sackweight`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel htmlFor="sackweight">
                                            Sack Weight
                                          </FormLabel>
                                          <FormControl>
                                            <Select
                                              onValueChange={field.onChange}
                                              defaultValue={field.value}
                                              {...field}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select Sack Weight">
                                                  {field.value}
                                                </SelectValue>
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="bag25kg">
                                                  Bag 25kg
                                                </SelectItem>
                                                <SelectItem value="cavan50kg">
                                                  Cavan 50kg
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <FormField
                                      control={form.control}
                                      name={`TransactionItem.${index}.unitofmeasurement`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel htmlFor="unitofmeasurement">
                                            Unit of Measurement
                                          </FormLabel>
                                          <FormControl>
                                            <Select
                                              onValueChange={field.onChange}
                                              defaultValue={field.value}
                                              {...field}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select Unit of Measurement">
                                                  {field.value}
                                                </SelectValue>
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="quantity">
                                                  Quantity
                                                </SelectItem>
                                                <SelectItem value="weight">
                                                  Weight
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <FormField
                                      control={form.control}
                                      name={`TransactionItem.${index}.stock`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel htmlFor="stock">
                                            Stock
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              id="stock"
                                              type="number"
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <FormField
                                      control={form.control}
                                      name={`TransactionItem.${index}.unitprice`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel htmlFor="unitprice">
                                            Unit Price
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              id="unitprice"
                                              type="number"
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className="pt-2">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => remove(index)}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <Button
                                onClick={() =>
                                  append({
                                    sackweight: "bag25kg",
                                    Item: {
                                      itemtype: "palay",
                                      itemname: "",
                                      sackweight: "bag25kg",
                                      itemid: undefined,
                                    },
                                    unitofmeasurement: "",
                                    stock: 0,
                                    unitprice: 0,
                                  })
                                }
                                className="mt-4"
                              >
                                Add Item
                              </Button>
                            </div>
                          </>
                        )}
                        <DialogFooter className="mt-4">
                          <Button variant="outline" onClick={handleCancel}>
                            Cancel
                          </Button>
                          <Button type="submit">Save</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
              {showModalEditPurchase && (
                <Dialog
                  open={showModalEditPurchase}
                  onOpenChange={handleCancel}
                >
                  <DialogContent
                    className={`w-full max-w-full sm:min-w-[600px] md:w-[700px] lg:min-w-[1200px] p-4 bg-customColors-offWhite ${
                      user?.role === ROLES.ADMIN
                        ? "w-full max-w-full sm:min-w-[600px] md:w-[700px] lg:min-w-[1200px] p-4 bg-customColors-offWhite"
                        : user?.role === ROLES.MANAGER
                        ? "w-full max-w-full sm:min-w-[400px] md:w-[400px] lg:min-w-[400px] p-4 bg-customColors-offWhite"
                        : "default-class"
                    }`}
                  >
                    <DialogHeader>
                      <DialogTitle>
                        {formPurchaseOnly.getValues("transactionid")
                          ? "Edit Purchase of Product"
                          : "Add New Purchase of Product"}
                      </DialogTitle>
                      <DialogDescription>
                        Fill out the form to{" "}
                        {formPurchaseOnly.getValues("transactionid")
                          ? "edit a"
                          : "add a new"}{" "}
                        purchased product to your inventory.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...formPurchaseOnly}>
                      <form
                        className="w-full max-w-full  mx-auto p-4 sm:p-6"
                        onSubmit={formPurchaseOnly.handleSubmit(handleSubmit)}
                      >
                        <div
                          className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-2 
${
  user?.role === ROLES.ADMIN
    ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-2"
    : user?.role === ROLES.MANAGER
    ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-4 py-2"
    : "default-class"
}`}
                        >
                          {(action === "add" ||
                            (action === "edit" &&
                              user?.role === ROLES.ADMIN)) && (
                            <div className="space-y-2">
                              <FormField
                                control={formPurchaseOnly.control}
                                name="DocumentNumber.documentnumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel htmlFor="documentnumber">
                                      Purchase Order Number
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        id="documentnumber"
                                        type="text"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          <div className="space-y-2">
                            <FormField
                              control={formPurchaseOnly.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel htmlFor="status">
                                    Payment Status
                                  </FormLabel>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      {...field}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status">
                                          {field.value}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">
                                          Pending
                                        </SelectItem>
                                        <SelectItem value="paid">
                                          Paid
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                          Cancelled
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          {(action === "add" ||
                            (action === "edit" &&
                              user?.role === ROLES.ADMIN)) && (
                            <div className="space-y-2">
                              <FormField
                                control={formPurchaseOnly.control}
                                name="frommilling"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel htmlFor="frommilling">
                                      From Milling
                                    </FormLabel>
                                    <FormControl>
                                      <Select
                                        value={field.value ? "true" : "false"}
                                        onValueChange={(value) => {
                                          field.onChange(value === "true");
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select Value">
                                            {field.value ? "Yes" : "No"}
                                          </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="true">
                                            Yes
                                          </SelectItem>
                                          <SelectItem value="false">
                                            No
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </div>
                        <DialogFooter className="pt-2 lg:pt-1">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={handleCancel}>
                              Cancel
                            </Button>
                            <Button type="submit">Save</Button>
                          </div>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
