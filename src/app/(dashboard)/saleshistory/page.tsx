"use client";

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import transactionSchema, {
  TransactionItem,
  TransactionOnly,
  TransactionTable,
} from "@/schemas/transaction.schema";
import { Badge } from "@/components/ui/badge";
import {
  XIcon,
  ArrowRightIcon,
  FilterIcon,
  FilePenIcon,
} from "@/components/icons/Icons";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import salesTransactionEditSchema, {
  EditSales,
} from "@/schemas/saleseditstatus.schema";
import { User } from "@/interfaces/user";
import { userSessionContext } from "@/components/sessionContext-provider";

const ROLES = {
  SALES: "sales",
  INVENTORY: "inventory",
  MANAGER: "manager",
  ADMIN: "admin",
};

interface CombinedTransactionItem {
  documentNumber?: string;
  transactionitemid: number;
  transactionid: number;
  status: "pending" | "paid" | "cancelled";
  Item: {
    type: "bigas" | "palay" | "resico";
    name: string;
    sackweight: "bag25kg" | "cavan50kg";
    itemid?: number;
  };
  type: "purchases" | "sales";
  sackweight: "bag25kg" | "cavan50kg";
  unitofmeasurement: string;
  stock?: number;
  unitprice?: number;
  totalamount: number;
  lastmodifiedat?: Date;
}

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
    invoiceno: "",
    name: "",
    walkin: "",
    status: "",
    dateRange: { start: "", end: "" },
  });

  const clear = () => {
    setFilters({
      invoiceno: "",
      name: "",
      walkin: "",
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
  const [sales, setSales] = useState<TransactionTable[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchSales = useCallback(
    async (page: number) => {
      if (isNaN(page) || page < 1) return;

      try {
        const params = new URLSearchParams({
          limit: ROWS_PER_PAGE.toString(),
          page: page.toString(),
        });

        if (filters.invoiceno) {
          params.append("documentnumber", filters.invoiceno);
        }
        if (filters.name) {
          params.append("name", filters.name);
        }
        if (filters.walkin) {
          params.append("walkin", filters.walkin);
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

        const response = await fetch(`/api/sales/salespagination?${params}`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setSales(data);

        const totalSalesResponse = await fetch(`/api/sales/salespagination`);
        const totalRowsData = await totalSalesResponse.json();
        setTotalPages(Math.ceil(totalRowsData.length / ROWS_PER_PAGE));
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    },
    [filters]
  );

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const shouldDebounce = filters.invoiceno || filters.name;

    if (shouldDebounce) {
      const timer = setTimeout(() => fetchSales(currentPage), 2000);
      setDebounceTimeout(timer);
    } else {
      fetchSales(currentPage);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [filters.invoiceno, filters.name, currentPage, fetchSales]);

  // console.log(filters);

  // useEffect(() => {
  //   fetchSales(currentPage);
  // }, [fetchSales, currentPage]);

  const refreshSales = () => {
    setFilters({
      invoiceno: "",
      name: "",
      walkin: "",
      status: "",
      dateRange: { start: "", end: "" },
    });
    fetchSales(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    clear();
    fetchSales(1);
  };

  return {
    sales,
    currentPage,
    totalPages,
    handlePageChange,
    refreshSales,
    filters,
    setFilters,
    clearFilters,
  };
};

const useTransactionItems = () => {
  const {
    filters: filters2,
    setFilters: setFilters2,
    clear: clear2,
  } = useFilters();
  const [transactionItem, setTransactionItem] = useState<
    CombinedTransactionItem[]
  >([]);
  const [currentTransactionItemsPage, setCurrentTransactionItemsPage] =
    useState(1);
  const [totalTransactionItemsPages, setTotalTransactionItemsPages] =
    useState(0);

  const fetchTransactionData = useCallback(
    async (page: number) => {
      if (isNaN(page) || page < 1) return;

      try {
        const params = new URLSearchParams({
          limit: ROWS_PER_PAGE.toString(),
          page: page.toString(),
        });

        // Add filters to params
        if (filters2.invoiceno) {
          params.append("documentnumber", filters2.invoiceno);
        }
        if (filters2.name) {
          params.append("name", filters2.name);
        }
        if (filters2.walkin) {
          params.append("walkin", filters2.walkin);
        }
        if (filters2.status) {
          params.append("status", filters2.status);
        }
        if (filters2.dateRange.start) {
          params.append("startdate", filters2.dateRange.start);
        }
        if (filters2.dateRange.end) {
          params.append("enddate", filters2.dateRange.end);
        }

        // Fetch filtered transactions
        const transactionsResponse = await fetch(
          `/api/customertransaction/customertransactionpagination?${params}`
        );
        if (!transactionsResponse.ok) {
          throw new Error(`HTTP error! status: ${transactionsResponse.status}`);
        }
        const transactions: any[] = await transactionsResponse.json();

        // Fetch all transaction items
        const transactionItemsResponse = await fetch("/api/transactionitem");
        if (!transactionItemsResponse.ok) {
          throw new Error(
            `HTTP error! status: ${transactionItemsResponse.status}`
          );
        }
        const allTransactionItems: TransactionItem[] =
          await transactionItemsResponse.json();

        // Create transaction map for quick lookups
        const transactionMap = new Map<number, any>();
        transactions.forEach((transaction) => {
          transactionMap.set(transaction.transactionid, {
            documentNumber: transaction.DocumentNumber?.documentnumber,
            frommilling: transaction.frommilling,
            type: transaction.type,
            status: transaction.status,
          });
        });

        // Combine and filter data
        const combinedData: CombinedTransactionItem[] = allTransactionItems
          .map((item) => {
            const transactionInfo =
              transactionMap.get(item.transactionid) || {};
            return {
              ...item,
              documentNumber: transactionInfo.documentNumber,
              frommilling: transactionInfo.frommilling || false,
              type: transactionInfo.type || "otherType",
              status: transactionInfo.status || "otherStatus",
            };
          })
          .filter((item) => item.documentNumber !== undefined);

        // Set state
        setTransactionItem(combinedData);

        // Fetch total count for pagination
        const totalResponse = await fetch(
          `/api/customertransaction/customertransactionpagination`
        );
        const totalData = await totalResponse.json();
        setTotalTransactionItemsPages(
          Math.ceil(totalData.length / ROWS_PER_PAGE)
        );
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      }
    },
    [filters2]
  );

  useEffect(() => {
    const fetchData = async () => {
      await fetchTransactionData(currentTransactionItemsPage);
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 2000); // Debounce time

    return () => {
      clearTimeout(timer);
    };
  }, [filters2, currentTransactionItemsPage, fetchTransactionData]);

  const clearFilters2 = () => {
    clear2();
    fetchTransactionData(1);
  };

  const handleTransactionItemsPageChange = (page: number) => {
    setCurrentTransactionItemsPage(page);
  };

  const refreshTransactionItems = async () => {
    await fetchTransactionData(currentTransactionItemsPage);
  };

  return {
    transactionItem,
    currentTransactionItemsPage,
    totalTransactionItemsPages,
    handleTransactionItemsPageChange,
    refreshTransactionItems,
    filters: filters2,
    setFilters: setFilters2,
    clearFilters2,
  };
};

export default function Component() {
  const user = useContext(userSessionContext);
  const {
    sales,
    currentPage,
    totalPages,
    handlePageChange,
    refreshSales,
    filters,
    setFilters,
    clearFilters,
  } = usePurchases();
  const {
    transactionItem,
    currentTransactionItemsPage,
    totalTransactionItemsPages,
    handleTransactionItemsPageChange,
    refreshTransactionItems,
    filters: filters2,
    setFilters: setFilters2,
    clearFilters2,
  } = useTransactionItems();
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionTable | null>(null);
  const [showModalEditSales, setShowModalEditSales] = useState(false);

  const formSalesOnly = useForm<EditSales>({
    resolver: zodResolver(salesTransactionEditSchema),
    defaultValues: {
      transactionid: 0,
      status: "pending",
      DocumentNumber: {
        documentnumberid: 0,
        documentnumber: "",
      },
    },
  });

  useEffect(() => {
    console.log(formSalesOnly.formState.errors);
  }, [formSalesOnly.formState.errors]);

  const handleEdit = (sales: EditSales) => {
    console.log("Editing sales:", sales);
    setShowModalEditSales(true);

    formSalesOnly.reset({
      transactionid: sales.transactionid,
      status: sales.status,
      DocumentNumber: {
        documentnumberid: sales.DocumentNumber.documentnumberid,
        documentnumber: sales.DocumentNumber.documentnumber,
      },
    });
  };

  const handleCancel = () => {
    setShowModalEditSales(false);

    formSalesOnly.reset({
      transactionid: 0,
      status: "pending",
      DocumentNumber: {
        documentnumberid: 0,
        documentnumber: "",
      },
    });
  };

  const handleSubmit = async (values: EditSales) => {
    console.log("Form Values:", values);
    const formData = new FormData();

    formData.append("status", values.status);

    let method = "put";
    let endpoint = `/api/editsalesstatus/${values.transactionid}`;

    try {
      const uploadRes = await fetch(endpoint, {
        method: method,
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadResult = await uploadRes.json();
        toast.success(
          `Invoice No. ${""} ${formSalesOnly.getValues(
            "DocumentNumber.documentnumber"
          )} ${""} status has been updated`,
          {
            description: "You have successfully edited the purchase.",
          }
        );
        console.log("Purchase updated successfully");
        console.log("Upload Result:", uploadResult);
        console.log("Closing modal...");
        setShowModalEditSales(false);
        refreshSales();
        refreshTransactionItems();
      } else {
        console.error("Upload failed", await uploadRes.text());
      }
    } catch (error) {
      console.error("Error adding/updating purchase:", error);
    }
  };

  const filteredTransactions = useMemo(() => {
    return sales;
    //   const invoiceNo =
    //     sales.DocumentNumber?.documentnumber?.toLowerCase() || "";
    //   const statusMatches =
    //     filters.status === "all" || sales.status === filters.status;
    //   const walkinMatches =
    //     filters.walkin === "all" ||
    //     (filters.walkin === "true" && sales.walkin) ||
    //     (filters.walkin === "false" && !sales.walkin);
    //   const frommillingMatches =
    //     filters.frommilling === "all" ||
    //     (filters.frommilling === "true" && sales.frommilling) ||
    //     (filters.frommilling === "false" && !sales.frommilling);
    //   const itemNameMatches = sales.TransactionItem.some((item) => {
    //     const itemName = item?.Item?.name?.toLowerCase() || "";
    //     return itemName.includes(filters.name.toLowerCase());
    //   });
    //   const createdAt = sales.createdat ? new Date(sales.createdat) : null;
    //   const start = filters.dateRange.start
    //     ? new Date(filters.dateRange.start)
    //     : null;
    //   const end = filters.dateRange.end
    //     ? new Date(filters.dateRange.end)
    //     : null;
    //   const isWithinDateRange = (
    //     createdAt: Date | null,
    //     start: Date | null,
    //     end: Date | null
    //   ) => {
    //     if (!createdAt) return false;
    //     if (start && end) return createdAt >= start && createdAt <= end;
    //     if (start) return createdAt >= start;
    //     if (end) return createdAt <= end;
    //     return true;
    //   };
    //   const dateRangeMatches = isWithinDateRange(createdAt, start, end);
    //   console.log("Filtering sales:", sales);
    //   console.log("Matches:", {
    //     invoiceNoMatches:
    //       !filters.invoiceno ||
    //       invoiceNo.includes(filters.invoiceno.toLowerCase()),
    //     statusMatches,
    //     walkinMatches,
    //     frommillingMatches,
    //     itemNameMatches,
    //     dateRangeMatches,
    //   });
    //   return (
    //     (!filters.invoiceno ||
    //       invoiceNo.includes(filters.invoiceno.toLowerCase())) &&
    //     statusMatches &&
    //     walkinMatches &&
    //     frommillingMatches &&
    //     itemNameMatches &&
    //     dateRangeMatches
    //   );
    // });
  }, [sales]);

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, invoiceno: value }));
    setFilters2((prev) => ({ ...prev, invoiceno: value }));
  };

  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, name: value }));
    setFilters2((prev) => ({ ...prev, name: value }));
  };

  const clearAllFilters = () => {
    clearFilters();
    clearFilters2();
    handlePageChange(1);
    handleTransactionItemsPageChange(1);
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
            <Label htmlFor="document-number">Invoice No.</Label>
            <Input
              id="document-number"
              type="text"
              placeholder="Enter Purchase Order No."
              value={filters.invoiceno}
              onChange={handleInvoiceChange}
            />
            {/* {isInvoiceDropdownVisible && invoiceSuggestions.length > 0 && (
              <div
                ref={dropdownRefInvoice} // Attach ref to the dropdown
                className="absolute z-10 bg-white border border-gray-300 mt-14 w-44 max-h-60 overflow-y-auto"
              >
                {invoiceSuggestions.map((invoiceno) => (
                  <div
                    key={invoiceno}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        invoiceno: invoiceno,
                      }))
                    }
                  >
                    {invoiceno}
                  </div>
                ))}
              </div>
            )} */}
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
            {/* {isItemDropdownVisible && itemNameSuggestions.length > 0 && (
              <div
                ref={dropdownRefItem} // Attach ref to the dropdown
                className="absolute z-10 bg-white border border-gray-300 mt-14 w-44 max-h-60 overflow-y-auto"
              >
                {itemNameSuggestions.map((item) => (
                  <div
                    key={item}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        name: item,
                      }))
                    }
                  >
                    {item}
                  </div>
                ))}
              </div>
            )} */}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="walkin">Walk-in</Label>
            <Select value={filters.walkin} onValueChange={handleWalkinChange}>
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

                setFilters2((prev) => ({
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

                setFilters2((prev) => ({
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
    setFilters2((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleWalkinChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      walkin: value,
    }));
    setFilters2((prev) => ({
      ...prev,
      walkin: value,
    }));
  };

  const filteredTransactionItems = useMemo(() => {
    return transactionItem;
    //   const invoiceno = item.documentNumber?.toLowerCase() || "";
    //   const statusMatches =
    //     filters.status === "all" || item.status === filters.status;
    //   const itemNameMatches = item.Item?.name
    //     ? item.Item.name.toLowerCase().includes(filters.name.toLowerCase())
    //     : false;
    //   const createdAt = item.lastmodifiedat
    //     ? new Date(item.lastmodifiedat)
    //     : null;
    //   const start = filters.dateRange.start
    //     ? new Date(filters.dateRange.start)
    //     : null;
    //   const end = filters.dateRange.end
    //     ? new Date(filters.dateRange.end)
    //     : null;
    //   const isWithinDateRange = (
    //     createdAt: Date | null,
    //     start: Date | null,
    //     end: Date | null
    //   ) => {
    //     if (!createdAt) return false;
    //     if (start && end) return createdAt >= start && createdAt <= end;
    //     if (start) return createdAt >= start;
    //     if (end) return createdAt <= end;
    //     return true;
    //   };
    //   const dateRangeMatches = isWithinDateRange(createdAt, start, end);
    //   return (
    //     (!filters.invoiceno ||
    //       invoiceno.includes(filters.invoiceno.toLowerCase())) &&
    //     statusMatches &&
    //     itemNameMatches &&
    //     dateRangeMatches
    //   );
    // });
  }, [transactionItem]);

  const canAccessButton = (role: String) => {
    if (user?.role === ROLES.ADMIN) return true;
    if (user?.role === ROLES.MANAGER) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.SALES) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.INVENTORY) return role !== ROLES.ADMIN;
    return false;
  };

  return (
    <div className="flex h-screen w-full bg-customColors-offWhite">
      <div className="flex-1 overflow-y-auto pt-8 pl-4 pr-4 w-full">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <h1 className="text-2xl font-bold mb-6">Sales History</h1>
          <div className="grid gap-6 grid-cols-1">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4"></div>
              {selectedTransaction ? (
                <div className="bg-customColors-offWhite rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Sales Details</h2>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedTransaction(null)}
                    >
                      <XIcon className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>
                  <div className="grid gap-1">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 p-2">
                      <div className="font-medium text-muted-foreground">
                        Sales Date:
                      </div>
                      <div>
                        {selectedTransaction.createdat
                          ? new Date(
                              selectedTransaction.createdat
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </div>
                      <div className="font-medium text-muted-foreground">
                        Sales Created by:
                      </div>
                      <div>
                        {selectedTransaction.User
                          ? `${selectedTransaction.User.firstname} ${selectedTransaction.User.lastname}`
                          : "N/A"}
                      </div>
                    </div>
                    <div className="overflow-y-auto">
                      <div className="table-container relative ">
                        <ScrollArea>
                          <Table
                            style={{ width: "100%" }}
                            className="min-w-[600px]  rounded-md border-border w-full h-10 overflow-clip relative"
                            divClassname="min-h-[200px] overflow-y-scroll max-h-[200px] overflow-y-auto"
                          >
                            <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                              <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
                                <TableHead>Item Name</TableHead>
                                <TableHead>Item Type</TableHead>
                                <TableHead>Sack Weight</TableHead>
                                <TableHead>Unit of Measurement</TableHead>
                                <TableHead>Measurement Value</TableHead>
                                {canAccessButton(
                                  ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES
                                ) && (
                                  <>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                  </>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedTransaction.TransactionItem.map(
                                (item, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{item.Item.name}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{item.sackweight}</TableCell>
                                    <TableCell>
                                      {item.unitofmeasurement}
                                    </TableCell>
                                    <TableCell>{item.stock}</TableCell>
                                    {canAccessButton(
                                      ROLES.ADMIN ||
                                        ROLES.MANAGER ||
                                        ROLES.SALES
                                    ) && (
                                      <>
                                        <TableCell>
                                          {formatPrice(item.unitprice)}
                                        </TableCell>
                                        <TableCell>
                                          {formatPrice(item.totalamount)}
                                        </TableCell>
                                      </>
                                    )}
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div>
                    </div>
                    <div className="grid grid-cols-1">
                      <div className="text-lg font-medium">
                        Total Items:{" "}
                        {selectedTransaction.TransactionItem.length}
                      </div>
                      {canAccessButton(
                        ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES
                      ) && (
                        <>
                          <div className="text-lg font-medium">
                            Total:{" "}
                            {formatPrice(selectedTransaction.totalamount ?? 0)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-4 mb-4">
                      {renderFilters()}
                    </div>
                  </div>
                  <div className="table-container relative  ">
                    <ScrollArea>
                      <Table
                        style={{ width: "100%" }}
                        className="min-w-[600px]  rounded-md border-border w-full h-10 overflow-clip relative"
                        divClassname="min-h-[300px] overflow-y-scroll max-h-[400px] lg:max-h-[600px] xl:max-h-[800px] overflow-y-auto"
                      >
                        <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                          <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
                            <TableHead>Invoice No.</TableHead>
                            <TableHead>Walk-in</TableHead>
                            {/* <TableHead>From Milling</TableHead> */}
                            <TableHead>Status</TableHead>
                            {canAccessButton(
                              ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES
                            ) && (
                              <>
                                <TableHead>Total Amount</TableHead>
                              </>
                            )}
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTransactions.length > 0 ? (
                            filteredTransactions.map(
                              (
                                transaction: TransactionTable,
                                index: number
                              ) => (
                                <TableRow
                                  key={index}
                                  className="cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                                >
                                  <TableCell>
                                    {transaction.DocumentNumber.documentnumber}
                                  </TableCell>
                                  <TableCell>
                                    {transaction.walkin ? "True" : "False"}
                                  </TableCell>
                                  {/* <TableCell>
                                    {transaction.frommilling ? "True" : "False"}
                                  </TableCell> */}
                                  <TableCell>
                                    <Badge
                                      className={`px-2 py-1 rounded-full ${
                                        transaction.status === "paid"
                                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                          : transaction.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                          : transaction.status === "cancelled"
                                          ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" // Default case
                                      }`}
                                    >
                                      {transaction.status}
                                    </Badge>
                                  </TableCell>
                                  {canAccessButton(
                                    ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES
                                  ) && (
                                    <>
                                      <TableCell>
                                        {formatPrice(
                                          transaction.totalamount ?? 0
                                        )}
                                      </TableCell>
                                    </>
                                  )}
                                  <TableCell>
                                    {transaction.createdat
                                      ? new Date(
                                          transaction.createdat
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {canAccessButton(
                                        ROLES.ADMIN || ROLES.MANAGER
                                      ) && (
                                        <>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleEdit(transaction)
                                            }
                                          >
                                            
                                            <FilePenIcon className="h-4 w-4" />
                                            <span className="sr-only">
                                              Edit Transaction
                                            </span>
                                          </Button>
                                        </>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          setSelectedTransaction(transaction)
                                        }
                                      >
                                        <ArrowRightIcon className="h-6 w-6" />
                                        <span className="sr-only">
                                          View details
                                        </span>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center">
                                No transactions found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    <div className="flex items-center justify-center mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                handlePageChange(Math.max(1, currentPage - 1))
                              }
                            />
                          </PaginationItem>
                          {currentPage > 3 && (
                            <>
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => handlePageChange(1)}
                                  isActive={currentPage === 1}
                                >
                                  1
                                </PaginationLink>
                              </PaginationItem>
                              {currentPage > 3 && <PaginationEllipsis />}
                            </>
                          )}

                          {Array.from(
                            { length: Math.min(3, totalPages) },
                            (_, index) => {
                              const pageIndex =
                                Math.max(1, currentPage - 1) + index;
                              if (pageIndex < 1 || pageIndex > totalPages)
                                return null;

                              return (
                                <PaginationItem key={pageIndex}>
                                  <PaginationLink
                                    onClick={() => handlePageChange(pageIndex)}
                                    isActive={currentPage === pageIndex}
                                  >
                                    {pageIndex}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }
                          )}

                          {currentPage < totalPages - 2 && (
                            <>
                              {currentPage < totalPages - 3 && (
                                <PaginationEllipsis />
                              )}
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => handlePageChange(totalPages)}
                                  isActive={currentPage === totalPages}
                                >
                                  {totalPages}
                                </PaginationLink>
                              </PaginationItem>
                            </>
                          )}

                          <PaginationItem>
                            <PaginationNext
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
              )}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex  items-center justify-between mb-6 -mr-6">
              <h1 className="text-2xl font-bold ">List of Sales Items</h1>
            </div>
            <div className="flex items-center justify-between"></div>
            <div className="overflow-x-auto">
              <div className="table-container relative">
                <ScrollArea>
                  <Table
                    style={{ width: "100%" }}
                    className="min-w-[600px] rounded-md border-border w-full h-10 overflow-clip relative"
                    divClassname="min-h-[200px] overflow-y-scroll max-h-[400px] overflow-y-auto"
                  >
                    <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                      <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
                        <TableHead>Invoice No.</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Item Type</TableHead>
                        <TableHead>Sack Weight</TableHead>
                        <TableHead>Unit of Measurement</TableHead>
                        <TableHead>Measurement Value</TableHead>
                        {canAccessButton(
                          ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES
                        ) && (
                          <>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total Amount</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactionItems.map((purchaseItem) => (
                        <TableRow key={purchaseItem.transactionitemid}>
                          <TableCell>{purchaseItem.documentNumber}</TableCell>
                          <TableCell>
                            <Badge
                              className={`px-2 py-1 rounded-full ${
                                purchaseItem.status === "paid"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                  : purchaseItem.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                  : purchaseItem.status === "cancelled"
                                  ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" // Default case
                              }`}
                            >
                              {purchaseItem.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{purchaseItem.Item.name}</TableCell>
                          <TableCell>{purchaseItem.Item.type}</TableCell>
                          <TableCell>{purchaseItem.sackweight}</TableCell>
                          <TableCell>
                            {purchaseItem.unitofmeasurement}
                          </TableCell>
                          <TableCell>{purchaseItem.stock}</TableCell>
                          {canAccessButton(
                            ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES
                          ) && (
                            <>
                              <TableCell>{purchaseItem.unitprice}</TableCell>
                              <TableCell>{purchaseItem.totalamount}</TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <div className="flex items-center justify-center mt-4 mb-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            handleTransactionItemsPageChange(
                              Math.max(1, currentTransactionItemsPage - 1)
                            )
                          }
                        />
                      </PaginationItem>
                      {[...Array(totalTransactionItemsPages)].map(
                        (_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink
                              onClick={() =>
                                handleTransactionItemsPageChange(index + 1)
                              }
                              isActive={
                                currentTransactionItemsPage === index + 1
                              }
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handleTransactionItemsPageChange(
                              Math.min(
                                totalTransactionItemsPages,
                                currentTransactionItemsPage + 1
                              )
                            )
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          </div>
          {showModalEditSales && (
            <Dialog open={showModalEditSales} onOpenChange={handleCancel}>
              <DialogContent className="w-full max-w-full sm:min-w-[400px] md:w-[400px] lg:min-w-[400px] p-4 bg-customColors-offWhite">
                <DialogHeader>
                  <DialogTitle>
                    {formSalesOnly.getValues("transactionid")
                      ? "Edit Sales status"
                      : "Add Sales status"}
                  </DialogTitle>
                  <DialogDescription>
                    Fill out the form to{" "}
                    {formSalesOnly.getValues("transactionid")
                      ? "edit a"
                      : "add a new"}{" "}
                    sales status.
                  </DialogDescription>
                </DialogHeader>
                <Form {...formSalesOnly}>
                  <form
                    className="w-full max-w-full  mx-auto p-4 sm:p-6"
                    onSubmit={formSalesOnly.handleSubmit(handleSubmit)}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-4 py-2">
                      <div className="space-y-2">
                        <FormField
                          control={formSalesOnly.control}
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
                                    <SelectItem value="paid">Paid</SelectItem>
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
  );
}
