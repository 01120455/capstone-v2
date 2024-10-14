"use client";

import React from "react";
import { useEffect, useState, ChangeEvent } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  TrashIcon,
  ViewIcon,
  FilePenIcon,
  CheckCircle,
} from "@/components/icons/Icons";

import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User } from "@/interfaces/user";
import SideMenu from "@/components/sidemenu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ROLES = {
  SALES: "sales",
  INVENTORY: "inventory",
  MANAGER: "manager",
  ADMIN: "admin",
};

export default function Component() {
  const [user, setUser] = useState<User | null>(null);
  const [purchases, setPurchases] = useState<TransactionTable[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<TransactionItem[] | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [showModalEditPurchase, setShowModalEditPurchase] = useState(false);
  const [showModalPurchaseItem, setShowModalPurchaseItem] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertPurchaseItem, setShowAlertPurchaseItem] = useState(false);
  const [showTablePurchaseItem, setShowTablePurchaseItem] = useState(false);
  const [purchaseItemToDelete, setPurchaseItemToDelete] =
    useState<TransactionItem | null>(null);
  const [purchaseToDelete, setPurchaseToDelete] =
    useState<TransactionTable | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successItem, setSuccessItem] = useState<Transaction | null>(null);
  const [successAction, setSuccessAction] = useState("");
  const [showSuccessTI, setShowSuccessTI] = useState(false);
  const [successTransactionItem, setSuccessTransactionItem] =
    useState<TransactionItemOnly | null>(null);
  const [showDeletionSuccess, setShowDeletionSuccess] = useState(false);
  const [showDeletedTransaction, setShowDeletedTransaction] =
    useState<TransactionTable | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredPurchases = purchases.filter((Transaction) => {
    const search = searchTerm.toLowerCase();

    const invoiceNumber =
      Transaction.InvoiceNumber?.invoicenumber?.toLowerCase() || "";
    const supplierName = `${Transaction.Entity.name}`.toLowerCase();

    return invoiceNumber.includes(search) || supplierName.includes(search);
  });

  const form = useForm<Transaction>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactionid: 0,
      type: "purchase",
      status: "pending",
      walkin: false,
      frommilling: false,
      taxpercentage: 0,
      Entity: {
        entityid: 0,
        name: "",
        contactnumber: "",
      },
      InvoiceNumber: {
        invoicenumberid: 0,
        invoicenumber: "",
      },
      TransactionItem: [
        {
          transactionitemid: 0,
          Item: {
            itemid: 0,
            name: "",
            type: "palay",
            sackweight: "bag25kg",
          },
          unitofmeasurement: "",
          measurementvalue: 0,
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
        name: "",
        type: "palay",
        sackweight: "bag25kg",
      },
      unitofmeasurement: "",
      measurementvalue: 0,
      unitprice: 0,
    },
  });

  const formPurchaseOnly = useForm<TransactionOnly>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactionid: 0,
      type: "purchase",
      status: "pending",
      walkin: false,
      frommilling: false,
      taxpercentage: 0,
      Entity: {
        entityid: 0,
        name: "",
        contactnumber: "",
      },
      InvoiceNumber: {
        invoicenumberid: 0,
        invoicenumber: "",
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

  useEffect(() => {
    async function getPurchase() {
      try {
        const response = await fetch("/api/purchase");
        if (response.ok) {
          const purchases = await response.json();
          setPurchases(purchases);
        } else {
          console.error("Error fetching purchase history:", response.status);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    }
    getPurchase();
  }, []);

  useEffect(() => {
    if (showSuccess) {
      setShowSuccessTI(false);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  useEffect(() => {
    if (showSuccessTI) {
      setShowSuccess(false);
      const timer = setTimeout(() => {
        setShowSuccessTI(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessTI]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const session = await response.json();
        setUser(session || null);
      } catch (error) {
        console.error("Failed to fetch session", error);
      }
    };
    fetchUser();
  }, []);

  const refreshPurchases = async () => {
    try {
      const response = await fetch("/api/purchase");
      if (response.ok) {
        const purchases = await response.json();
        setPurchases(purchases);
        setPurchaseItems(purchases.TransactionItem);
      } else {
        console.error("Error fetching purchases:", response.status);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  };

  const handleAddPurchase = () => {
    setShowModal(true);

    form.reset({
      transactionid: 0,
      type: "purchase",
      status: "pending",
      walkin: false,
      frommilling: false,
      taxpercentage: 0,
      Entity: {
        entityid: 0,
        name: "",
        contactnumber: "",
      },
      InvoiceNumber: {
        invoicenumberid: 0,
        invoicenumber: "",
      },
      TransactionItem: [
        {
          transactionitemid: 0,
          Item: {
            itemid: 0,
            name: "",
            type: "palay",
            sackweight: "bag25kg",
          },
          unitofmeasurement: "",
          measurementvalue: 0,
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
        name: purchaseItem.Item?.name,
        type: purchaseItem.Item?.type,
        sackweight: purchaseItem.Item?.sackweight,
      },
      unitofmeasurement: purchaseItem?.unitofmeasurement,
      measurementvalue: purchaseItem?.measurementvalue,
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
        name: "",
        type: "palay",
        sackweight: "bag25kg",
      },
      unitofmeasurement: "",
      measurementvalue: 0,
      unitprice: 0,
    });
  };

  const handleEdit = (purchase: TransactionOnly) => {
    console.log("Editing purchase:", purchase);
    setShowModalEditPurchase(true);

    formPurchaseOnly.reset({
      transactionid: purchase.transactionid,
      type: purchase.type,
      status: purchase.status,
      walkin: purchase.walkin,
      frommilling: purchase.frommilling,
      taxpercentage: purchase.taxpercentage,
      Entity: {
        entityid: purchase.Entity.entityid,
        name: purchase.Entity.name,
        contactnumber: purchase.Entity?.contactnumber || "",
      },
      InvoiceNumber: {
        invoicenumberid: purchase.InvoiceNumber.invoicenumberid,
        invoicenumber: purchase.InvoiceNumber.invoicenumber,
      },
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    setShowModalPurchaseItem(false);
    setShowModalEditPurchase(false);

    form.reset({
      transactionid: 0,
      type: "purchase",
      status: "pending",
      walkin: false,
      frommilling: false,
      taxpercentage: 0,
      Entity: {
        entityid: 0,
        name: "",
        contactnumber: "",
      },
      InvoiceNumber: {
        invoicenumberid: 0,
        invoicenumber: "",
      },
      TransactionItem: [
        {
          transactionitemid: 0,
          Item: {
            itemid: 0,
            name: "",
            type: "palay",
            sackweight: "bag25kg",
          },
          unitofmeasurement: "",
          measurementvalue: 0,
          unitprice: 0,
        },
      ],
    });

    formPurchaseItemOnly.reset({
      transactionitemid: 0,
      Item: {
        itemid: 0,
        name: "",
        type: "palay",
        sackweight: "bag25kg",
      },
      unitofmeasurement: "",
      measurementvalue: 0,
      unitprice: 0,
    });

    formPurchaseOnly.reset({
      transactionid: 0,
      type: "purchase",
      status: "pending",
      walkin: false,
      frommilling: false,
      taxpercentage: 0,
      Entity: {
        entityid: 0,
        name: "",
        contactnumber: "",
      },
      InvoiceNumber: {
        invoicenumberid: 0,
        invoicenumber: "",
      },
    });
  };

  const handleViewPurchaseItem = (purchase: TransactionTable) => {
    setPurchaseItems(purchase.TransactionItem);
    setShowTablePurchaseItem(true);
  };

  const closeViewPurchaseItem = () => {
    setPurchaseItems(null);
    setShowTablePurchaseItem(false);
  };

  const handleSubmit = async (values: Transaction) => {
    console.log("Form Values:", values);
    const formData = new FormData();

    formData.append("type", values.type);
    formData.append("status", values.status);
    formData.append("walkin", values.walkin.toString());
    formData.append("frommilling", values.frommilling.toString());
    formData.append(
      "taxpercentage",
      values.taxpercentage !== undefined ? values.taxpercentage.toString() : ""
    );
    formData.append("Entity[name]", values.Entity.name);
    formData.append(
      "Entity[contactnumber]",
      values.Entity?.contactnumber?.toString() ?? ""
    );
    formData.append("invoicenumber", values.InvoiceNumber.invoicenumber || "");

    values.TransactionItem !== undefined
      ? values.TransactionItem.forEach((item, index) => {
          formData.append(
            `TransactionItem[${index}][item][name]`,
            item.Item.name
          );
          formData.append(
            `TransactionItem[${index}][item][type]`,
            item.Item.type
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
            `TransactionItem[${index}][measurementvalue]`,
            item.measurementvalue.toString()
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
          console.log("Purchase updated successfully");
        } else {
          console.log("Purchase added successfully");
        }

        if (uploadResult.Entity) {
          setSuccessItem(uploadResult);
        } else {
          console.error("Unexpected structure:", uploadResult);
        }

        console.log("Upload Result:", uploadResult);
        setShowModal(false);
        setShowModalEditPurchase(false);
        refreshPurchases();
        setSuccessAction(values.transactionid ? "edited" : "added");
        setSuccessItem(values);
        setShowSuccess(true);
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
    formData.append("Item[name]", values.Item.name);
    formData.append("Item[type]", values.Item.type);
    formData.append("Item[sackweight]", values.Item.sackweight);
    formData.append("unitofmeasurement", values.unitofmeasurement);
    formData.append("measurementvalue", values.measurementvalue.toString());
    formData.append("unitprice", values.unitprice.toString());
    formData.append("transactionid", values.transactionid.toString());

    try {
      const uploadRes = await fetch(endpoint, {
        method: isUpdate ? "PUT" : "POST",
        body: formData,
      });

      if (uploadRes.ok) {
        console.log("Purchase Item processed successfully");
        setShowModalPurchaseItem(false);
        refreshPurchases();
        setSuccessAction(values.transactionitemid ? "edited" : "added");
        setSuccessTransactionItem(values);
        setShowSuccessTI(true);
        formPurchaseItemOnly.reset();
      } else {
        console.error("Operation failed", await uploadRes.text());
      }
    } catch (error) {
      console.error("Error processing purchase item:", error);
    }
  };

  const handleDeletePurchaseItemConfirm = async (
    purchaseItem: TransactionItem
  ) => {
    try {
      const response = await fetch(
        `/api/purchaseitem/purchaseitemSD/purchaseitem-soft-delete/${purchaseItem.transactionitemid}`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        console.log("Purchase Item deleted successfully");
        setShowAlertPurchaseItem(false);
        refreshPurchases();
      } else {
        console.error("Error deleting Purchase Item:", response.status);
      }
    } catch (error) {
      console.error("Error deleting Purchase Item:", error);
    }
  };

  const handleDeletePurchaseItem = (purchaseItem: TransactionItem) => {
    setPurchaseItemToDelete(purchaseItem);
    setShowAlertPurchaseItem(true);
    console.log("Deleting purchase item:", purchaseItem);
  };

  const handlePurchaseItemDeleteCancel = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    setShowAlertPurchaseItem(false);
    setPurchaseItemToDelete(null);
    formPurchaseItemOnly.reset();
  };

  const handleDelete = async (transactionid: number | undefined) => {
    try {
      const response = await fetch(
        `/api/purchase/purchase-soft-delete/${transactionid}`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Purchase deleted successfully");
        setShowAlert(false);
        setPurchaseToDelete(null);
        refreshPurchases();
        setShowDeletionSuccess(true);
        setShowDeletedTransaction(data);
      } else {
        console.error("Error deleting Purchase:", response.status);
      }
    } catch (error) {
      console.error("Error deleting Purchase:", error);
    }
  };

  const handleDeletePurchase = (purchase: TransactionTable) => {
    setPurchaseToDelete(purchase);
    setShowAlert(true);
  };

  const handleDeleteCancel = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    setShowAlert(false);
    setPurchaseToDelete(null);
    form.reset();
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

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const canAccessButton = (role: String) => {
    if (user?.role === ROLES.ADMIN) return true;
    if (user?.role === ROLES.MANAGER) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.SALES) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.INVENTORY) return role !== ROLES.ADMIN;
    return false;
  };

  const transactionData = {
    transactionid: formPurchaseOnly.getValues("transactionid") || 0,
    type: formPurchaseOnly.getValues("type") || "purchase",
    status: formPurchaseOnly.getValues("status") || "pending",
    walkin: formPurchaseOnly.getValues("walkin") || false,
    frommilling: formPurchaseOnly.getValues("frommilling") || false,
    Entity: {
      entityid: formPurchaseOnly.getValues("Entity.entityid") || null,
      name: formPurchaseOnly.getValues("Entity.name") || "",
      contactnumber: formPurchaseOnly.getValues("Entity.contactnumber"),
    },
    InvoiceNumber: {
      invoicenumberid: formPurchaseOnly.getValues(
        "InvoiceNumber.invoicenumberid"
      ),
      invoicenumber:
        formPurchaseOnly.getValues("InvoiceNumber.invoicenumber") || "",
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

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const paginatedPurchases = filteredPurchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 overflow-y-hidden p-5">
        {showSuccess && (
          <Alert className="alert-center">
            <AlertTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              {successAction === "added"
                ? "Purchase Order Added Successfully"
                : "Purchase Order Edited Successfully"}
            </AlertTitle>
            <AlertDescription>
              Purchase Order from supplier {""} {successItem?.Entity.name} {""}
              with Invoice number {""}
              {successItem?.InvoiceNumber.invoicenumber} {""} successfully {""}
              {successAction === "added" ? "added" : "Edited"}
            </AlertDescription>
          </Alert>
        )}
        {showSuccessTI && (
          <Alert className="alert-center">
            <AlertTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              {successAction === "added"
                ? "Item Added Successfully"
                : "Item Edited Successfully"}
            </AlertTitle>
            <AlertDescription>
              Item {successTransactionItem?.Item.name} successfully{" "}
              {successAction === "added"
                ? "added to the purchase order."
                : "edited successfully in the purchase order"}
            </AlertDescription>
          </Alert>
        )}
        {showDeletionSuccess && (
          <Alert className="alert-center">
            <AlertTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Transaction Deleted Successfully
            </AlertTitle>
            <AlertDescription>
              Transaction with Invoice Number {""}{" "}
              {showDeletedTransaction?.InvoiceNumber.invoicenumber} is deleted
              successfully.
            </AlertDescription>
          </Alert>
        )}
        <div className="p-6 md:p-8">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="flex  items-center justify-between mb-6 -mr-6">
              <h1 className="text-2xl font-bold ">
                Company Purchase Order Management
              </h1>
              <Button onClick={handleAddPurchase}>
                {isSmallScreen ? (
                  <PlusIcon className="w-6 h-6" />
                ) : (
                  "Add Product"
                )}
              </Button>
            </div>
            <div>
              <Input
                type="text"
                placeholder="Search invoice no. or supplier name..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full md:w-auto mb-4"
              />
            </div>
            <div className="overflow-x-auto">
              <div className="table-container relative ">
                <ScrollArea>
                  <Table
                    style={{ width: "100%" }}
                    className="min-w-[1000px]  rounded-md border-border w-full h-10 overflow-clip relative"
                    divClassname="min-h-[400px] overflow-y-scroll max-h-[400px] overflow-y-auto"
                  >
                    <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                      <TableRow>
                        <TableHead>Invoice No.</TableHead>
                        <TableHead>Supplier Name</TableHead>
                        <TableHead>Contact No.</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>From Milling</TableHead>
                        <TableHead>Tax %</TableHead>
                        <TableHead>Tax Amount</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Created at</TableHead>
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
                        {paginatedPurchases.map((purchase) => (
                          <TableRow key={purchase.transactionid}>
                            <TableCell>
                              {purchase.InvoiceNumber.invoicenumber}
                            </TableCell>
                            <TableCell>{purchase.Entity.name}</TableCell>
                            <TableCell>
                              {purchase.Entity?.contactnumber || "N/A"}
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
                            <TableCell>{purchase.taxpercentage}</TableCell>
                            <TableCell>
                              {formatPrice(purchase.taxamount ?? 0)}
                            </TableCell>
                            <TableCell>
                              {formatPrice(purchase.totalamount ?? 0)}
                            </TableCell>
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
                                  {purchase.User
                                    ? `${purchase.User.firstname} ${purchase.User.lastname}`
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
                                {canAccessButton(ROLES.ADMIN) && (
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
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-center mt-2">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              handlePageChange(Math.max(1, currentPage - 1))
                            }
                          />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink
                              onClick={() => handlePageChange(index + 1)}
                              isActive={currentPage === index + 1}
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
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
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </div>
            {showTablePurchaseItem && purchaseItems && (
              <Dialog
                open={showTablePurchaseItem}
                onOpenChange={closeViewPurchaseItem}
              >
                <DialogContent className="w-full max-w-full sm:min-w-[600px] md:w-[700px] lg:min-w-[1200px] p-4">
                  <DialogHeader>
                    <DialogTitle>Items Purchased</DialogTitle>
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
                          divClassname="min-h-[400px] overflow-y-scroll max-h-[400px] overflow-y-auto"
                        >
                          <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                            <TableRow>
                              <TableHead>Item Name</TableHead>
                              <TableHead>Item Type</TableHead>
                              <TableHead>Sack Weight</TableHead>
                              <TableHead>Unit of Measurement</TableHead>
                              <TableHead>Measurement Value</TableHead>
                              <TableHead>Unit Price</TableHead>
                              <TableHead>Total Amount</TableHead>
                              {canAccessButton(ROLES.ADMIN) && (
                                <>
                                  <TableHead>Actions</TableHead>
                                </>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <>
                              {purchaseItems &&
                                purchaseItems.map(
                                  (purchaseItem, index: number) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {purchaseItem.Item.name}
                                      </TableCell>
                                      <TableCell>
                                        {purchaseItem.Item.type}
                                      </TableCell>
                                      <TableCell>
                                        {purchaseItem.Item.sackweight}
                                      </TableCell>
                                      <TableCell>
                                        {purchaseItem.unitofmeasurement}
                                      </TableCell>
                                      <TableCell>
                                        {purchaseItem.measurementvalue}
                                      </TableCell>
                                      <TableCell>
                                        {purchaseItem.unitprice}
                                      </TableCell>
                                      <TableCell>
                                        {purchaseItem.totalamount}
                                      </TableCell>
                                      <TableCell>
                                        {canAccessButton(ROLES.ADMIN) && (
                                          <>
                                            <div className="flex items-center gap-2">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  handleEditPurchaseItem(
                                                    purchaseItem
                                                  )
                                                }
                                              >
                                                <FilePenIcon className="w-4 h-4" />
                                                <span className="sr-only">
                                                  Edit
                                                </span>
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  handleDeletePurchaseItem(
                                                    purchaseItem
                                                  )
                                                }
                                              >
                                                <TrashIcon className="w-4 h-4" />
                                                <span className="sr-only">
                                                  Delete
                                                </span>
                                              </Button>
                                            </div>
                                          </>
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
            {showModalPurchaseItem && (
              <Dialog open={showModalPurchaseItem} onOpenChange={handleCancel}>
                <DialogContent className="w-full max-w-full sm:min-w-[600px] md:w-[700px] lg:min-w-[1200px] p-4">
                  <DialogHeader>
                    <DialogTitle>
                      {formPurchaseItemOnly.getValues("transactionitemid")
                        ? "Edit Purchase Item"
                        : "Add New Purchase Item"}
                    </DialogTitle>
                    <DialogDescription>
                      Fill out the form to{" "}
                      {formPurchaseItemOnly.getValues("transactionitemid")
                        ? "edit a"
                        : "add a new"}{" "}
                      purchased product to your inventory.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...formPurchaseItemOnly}>
                    <form
                      className="w-full max-w-full  mx-auto p-4 sm:p-6"
                      onSubmit={formPurchaseItemOnly.handleSubmit(
                        handleSubmitEditPurchaseItem
                      )}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2">
                        <div className="space-y-2">
                          <FormField
                            control={formPurchaseItemOnly.control}
                            name="Item.name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="name">Item Name</FormLabel>
                                <FormControl>
                                  <Input {...field} id="name" type="text" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <FormField
                            control={formPurchaseItemOnly.control}
                            name="Item.type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="type">Item Type</FormLabel>
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
                            control={formPurchaseItemOnly.control}
                            name="Item.sackweight"
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
                            control={formPurchaseItemOnly.control}
                            name={`unitofmeasurement`}
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
                            control={formPurchaseItemOnly.control}
                            name="measurementvalue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="measurementvalue">
                                  Measurement Value
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    id="measurementvalue"
                                    type="number"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <FormField
                            control={formPurchaseItemOnly.control}
                            name="unitprice"
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
                      </div>
                      <div className="flex justify-end gap-4 mt-4">
                        <Button variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
            {purchaseItemToDelete && (
              <AlertDialog open={showAlertPurchaseItem}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will delete the
                      purchased item {purchaseItemToDelete.Item.name} from the
                      Supplier. Please confirm you want to proceed with this
                      action.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={handlePurchaseItemDeleteCancel}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        handleDeletePurchaseItemConfirm(purchaseItemToDelete)
                      }
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {purchaseToDelete && (
              <AlertDialog open={showAlert}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      Invoice No. {purchaseToDelete.InvoiceNumber.invoicenumber}{" "}
                      and all of its contents from the database. Please confirm
                      you want to proceed with this action.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleDeleteCancel}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        handleDelete(purchaseToDelete.transactionid)
                      }
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {showModal && (
              <Dialog open={showModal} onOpenChange={handleCancel}>
                <DialogContent className="w-full max-w-full sm:min-w-[600px] md:w-[700px] lg:min-w-[1200px] p-4">
                  <DialogHeader>
                    <DialogTitle>
                      {form.getValues("transactionid")
                        ? "Edit Purchase of Product"
                        : "Add New Purchase of Product"}
                    </DialogTitle>
                    <DialogDescription>
                      Fill out the form to{" "}
                      {form.getValues("transactionid") ? "edit a" : "add a new"}{" "}
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
                            name="InvoiceNumber.invoicenumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="invoicenumber">
                                  Invoice Number
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    id="invoicenumber"
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
                            name="Entity.name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="name">
                                  Supplier Name
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} id="name" type="text" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name="Entity.contactnumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="contactnumber">
                                  Contact Number
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    id="contactnumber"
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
                                      <SelectItem value="true">Yes</SelectItem>
                                      <SelectItem value="false">No</SelectItem>
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
                            name="taxpercentage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="taxpercentage">
                                  Tax Percentage
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    id="taxpercentage"
                                    type="number"
                                  />
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
                                    name={`TransactionItem.${index}.Item.name`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel htmlFor="name">
                                          Item Name
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            id="name"
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
                                    name={`TransactionItem.${index}.Item.type`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel htmlFor="type">
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
                                    name={`TransactionItem.${index}.measurementvalue`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel htmlFor="measurementvalue">
                                          Measurement Value
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            id="measurementvalue"
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
                                  Item: {
                                    type: "palay",
                                    name: "",
                                    sackweight: "bag25kg",
                                    itemid: undefined,
                                  },
                                  unitofmeasurement: "",
                                  measurementvalue: 0,
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
                        <Button type="submit">Save</Button>
                        <Button variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
            {showModalEditPurchase && (
              <Dialog open={showModalEditPurchase} onOpenChange={handleCancel}>
                <DialogContent
                  className={`w-full max-w-full sm:min-w-[600px] md:w-[700px] lg:min-w-[1200px] p-4${
                    user?.role === ROLES.ADMIN
                      ? "w-full max-w-full sm:min-w-[600px] md:w-[700px] lg:min-w-[1200px] p-4"
                      : user?.role === ROLES.MANAGER
                      ? "w-full max-w-full sm:min-w-[400px] md:w-[400px] lg:min-w-[400px] p-4"
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
                              name="InvoiceNumber.invoicenumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel htmlFor="invoicenumber">
                                    Invoice Number
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      id="invoicenumber"
                                      type="text"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        {(action === "add" ||
                          (action === "edit" &&
                            user?.role === ROLES.ADMIN)) && (
                          <div className="space-y-2">
                            <FormField
                              control={formPurchaseOnly.control}
                              name="Entity.name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel htmlFor="name">
                                    Supplier Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} id="name" type="text" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        {(action === "add" ||
                          (action === "edit" &&
                            user?.role === ROLES.ADMIN)) && (
                          <div className="space-y-2">
                            <FormField
                              control={formPurchaseOnly.control}
                              name="Entity.contactnumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel htmlFor="contactnumber">
                                    Contact Number
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      id="contactnumber"
                                      type="number"
                                    />
                                  </FormControl>
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
                        {(action === "add" ||
                          (action === "edit" &&
                            user?.role === ROLES.ADMIN)) && (
                          <div className="space-y-2">
                            <FormField
                              control={formPurchaseOnly.control}
                              name="taxpercentage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel htmlFor="taxpercentage">
                                    Tax Percentage
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      id="taxpercentage"
                                      type="number"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter className="pt-2 lg:pt-1">
                        <div className="flex justify-end space-x-2">
                          <Button type="submit">Save</Button>
                          <Button variant="outline" onClick={handleCancel}>
                            Cancel
                          </Button>
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
  );
}
