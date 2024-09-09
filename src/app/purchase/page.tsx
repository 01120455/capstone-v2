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
import Image from "next/image";
import transactionSchema, {
  Transaction,
  TransactionItem,
  TransactionOnly,
  TransactionTable,
} from "@/schemas/transaction.schema";
import transactionItemSchema, { TransactionItemOnly } from "@/schemas/transactionitem.schema";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SideMenu from "@/components/sidemenu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Component() {
  const [purchases, setPurchases] = useState<TransactionTable[] | null>(null);
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

  const form = useForm<Transaction>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactionid: 0,
      type: "purchase",
      status: "pending",
      walkin: false,
      frommilling: false,
      taxpercentage: 0,
      // totalamount: 0,
      Entity: {
        entityid: 0,
        firstname: "",
        middlename: "",
        lastname: "",
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
        firstname: "",
        middlename: "",
        lastname: "",
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

  const refreshPurchases = async () => {
    try {
      const response = await fetch("/api/purchase");
      if (response.ok) {
        const purchases = await response.json();
        setPurchases(purchases);
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
      // totalamount: 0,
      Entity: {
        entityid: 0,
        firstname: "",
        middlename: "",
        lastname: "",
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
        firstname: purchase.Entity.firstname,
        middlename: purchase.Entity?.middlename || "",
        lastname: purchase.Entity.lastname,
        contactnumber: purchase.Entity.contactnumber,
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
      // totalamount: 0,
      Entity: {
        entityid: 0,
        firstname: "",
        middlename: "",
        lastname: "",
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
      // totalamount: 0,
      Entity: {
        entityid: 0,
        firstname: "",
        middlename: "",
        lastname: "",
        contactnumber: "",
      },
      InvoiceNumber: {
        invoicenumberid: 0,
        invoicenumber: "",
      },
    });
  };

  // const handleCancelPurchaseItem = () => {
  //   setShowModalPurchaseItem(false);

  //   formPurchaseItem.reset({
  //     transactionitemid: 0,
  //     Item: {
  //       itemid: 0,
  //       name: "",
  //       type: "palay",
  //       sackweight: "bag25kg",
  //     },
  //     unitofmeasurement: "",
  //     measurementvalue: 0,
  //     unitprice: 0,
  //   });
  // };

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

    // Append general purchase data
    formData.append("type", values.type);
    formData.append("status", values.status);
    formData.append("walkin", values.walkin.toString());
    formData.append("frommilling", values.frommilling.toString());
    formData.append(
      "taxpercentage",
      values.taxpercentage !== undefined ? values.taxpercentage.toString() : ""
    );
    formData.append("Entity[firstname]", values.Entity.firstname);
    formData.append("Entity[middlename]", values.Entity.middlename ?? "");
    formData.append("Entity[lastname]", values.Entity.lastname);
    formData.append(
      "Entity[contactnumber]",
      values.Entity.contactnumber.toString() ?? ""
    );
    formData.append("invoicenumber", values.InvoiceNumber.invoicenumber || "");

    // Loop through each Transaction item and append its data
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
        if (values.transactionid) {
          console.log("Purchase updated successfully");
        } else {
          console.log("Purchase added successfully");
        }

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

  // const handleSubmitEditPurchase = async (values: TransactionOnly) => {
  //   console.log("Form Values:", values);

  //   const formData = new FormData();

  //   // Append all necessary fields to formData
  //   formData.append("transactionid", values.transactionid.toString());
  //   formData.append("type", values.type);
  //   formData.append("status", values.status);
  //   formData.append("walkin", values.walkin.toString());
  //   formData.append("frommilling", values.frommilling.toString());
  //   formData.append(
  //     "taxpercentage",
  //     values.taxpercentage ? values.taxpercentage.toString() : "0"
  //   );
  //   formData.append("Entity[firstname]", values.Entity.firstname);
  //   formData.append("Entity[middlename]", values.Entity.middlename ?? "");
  //   formData.append("Entity[lastname]", values.Entity.lastname);
  //   formData.append("Entity[contactnumber]", values.Entity.contactnumber ?? "");
  //   formData.append("invoicenumber", values.InvoiceNumber.invoicenumber ?? "");

  //   try {
  //     const endpoint = `/api/purchase/${values.transactionid}`;

  //     // Make the fetch call to update the purchase
  //     const uploadRes = await fetch(endpoint, {
  //       method: "PUT",
  //       body: formData,
  //     });

  //     if (uploadRes.ok) {
  //       console.log("Purchase updated successfully");
  //       setShowModalEditPurchase(false);
  //       refreshPurchases(); // Refresh purchases data to reflect changes
  //       formPurchaseOnly.reset(); // Reset the form to initial state
  //     } else {
  //       const errorText = await uploadRes.text();
  //       console.error("Upload failed", errorText);
  //     }
  //   } catch (error) {
  //     console.error("Error updating purchase:", error);
  //   }
  // };

  // const handleSubmitEditPurchaseItem = async (values: TransactionItem) => {
  //   if (!values.transactionitemid) {
  //     console.error("Transaction item ID is required for updating.");
  //     return;
  //   }

  //   console.log("Form Values:", values);
  //   const formData = new FormData();

  //   // Append general purchase data
  //   formData.append("Item[name]", values.Item.name);
  //   formData.append("Item[type]", values.Item.type);
  //   formData.append("Item[sackweight]", values.Item.sackweight);
  //   formData.append("unitofmeasurement", values.unitofmeasurement);
  //   formData.append("measurementvalue", values.measurementvalue.toString());
  //   formData.append("unitprice", values.unitprice.toString());

  //   try {
  //     const endpoint = `/api/purchase-item/${values.transactionitemid}`;

  //     const uploadRes = await fetch(endpoint, {
  //       method: "PUT",
  //       body: formData,
  //     });

  //     if (uploadRes.ok) {
  //       console.log("Purchase Item updated successfully");
  //       setShowModalPurchaseItem(false);
  //       refreshPurchases();
  //       formPurchaseItem.reset();
  //     } else {
  //       console.error("Update failed", await uploadRes.text());
  //     }
  //   } catch (error) {
  //     console.error("Error updating purchase:", error);
  //   }
  // };

  const handleSubmitEditPurchaseItem = async (values: TransactionItemOnly) => {
    // Validate required fields
    if (!values.transactionid) {
      console.error("Transaction ID is required.");
      return;
    }

    // Check if it's an update or create operation
    const isUpdate = !!values.transactionitemid; // True if transactionitemid exists
    const endpoint = isUpdate
      ? `/api/purchase-item/${values.transactionitemid}` // PUT endpoint for update
      : `/api/purchasteitem/purchaseitem/${values.transactionid}`; // POST endpoint for creation

    // Prepare form data for submission
    const formData = new FormData();
    formData.append("Item[name]", values.Item.name);
    formData.append("Item[type]", values.Item.type);
    formData.append("Item[sackweight]", values.Item.sackweight);
    formData.append("unitofmeasurement", values.unitofmeasurement);
    formData.append("measurementvalue", values.measurementvalue.toString());
    formData.append("unitprice", values.unitprice.toString());
    formData.append("transactionid", values.transactionid.toString()); // Convert to string

    try {
      const uploadRes = await fetch(endpoint, {
        method: isUpdate ? "PUT" : "POST", // Determine HTTP method based on the operation
        body: formData,
      });

      if (uploadRes.ok) {
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

  const handleDeletePurchaseItemConfirm = async (
    purchaseItem: TransactionItem
  ) => {
    try {
      const response = await fetch(
        `/api/purchaseitem/purchaseitem-soft-delete/${purchaseItem.transactionitemid}`,
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
        console.log("Purchase deleted successfully");
        setShowAlert(false);
        setPurchaseToDelete(null);
        refreshPurchases();
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

  return (
    <div className="flex h-screen">
      <SideMenu />
      <div className="flex-1 overflow-y-auto p-5">
        <div className="p-6 md:p-8">
          <div className="flex  items-center justify-between mb-6 -mr-6">
            <h1 className="text-2xl font-bold ">Company Purchase Management</h1>
            <Button onClick={handleAddPurchase}>
              {isSmallScreen ? <PlusIcon className="w-6 h-6" /> : "Add Product"}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <div className="table-container relative ">
              <ScrollArea>
                <Table
                  style={{ width: "100%" }}
                  className="min-w-[1000px]  rounded-md border-border w-full h-10 overflow-clip relative"
                  divClassname="min-h-[400px] overflow-y-scroll"
                >
                  <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                    <TableRow>
                      <TableHead>Invoice No.</TableHead>
                      <TableHead>Supplier name</TableHead>
                      <TableHead>Contact no.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Walkin</TableHead>
                      <TableHead>From Milling</TableHead>
                      <TableHead>Tax %</TableHead>
                      <TableHead>Tax Amount</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Created at</TableHead>
                      <TableHead>Last Modify by</TableHead>
                      <TableHead>Last Modified at</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <>
                      {purchases &&
                        purchases.map((purchase, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              {purchase.InvoiceNumber.invoicenumber}
                            </TableCell>
                            <TableCell>
                              {purchase.Entity.firstname} {""}
                              {purchase.Entity?.middlename || ""} {""}
                              {purchase.Entity.lastname}
                            </TableCell>
                            <TableCell>
                              {purchase.Entity?.contactnumber || "N/A"}
                            </TableCell>
                            <TableCell>{purchase.status}</TableCell>
                            <TableCell>
                              {purchase.walkin ? "True" : "False"}
                            </TableCell>
                            <TableCell>
                              {purchase.frommilling ? "True" : "False"}
                            </TableCell>
                            <TableCell>{purchase.taxpercentage}</TableCell>
                            <TableCell>{purchase.taxamount}</TableCell>
                            <TableCell>{purchase.totalamount}</TableCell>
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
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeletePurchase(purchase)}
                                >
                                  <TrashIcon className="w-4 h-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </>
                  </TableBody>
                </Table>
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
                    <Button
                      onClick={() => {
                        const transactionid = purchaseItems[0]?.transactionid; // Or select the specific purchase item by index
                        handleAddPurchaseItem(transactionid);
                      }}
                    >
                      {isSmallScreen ? (
                        <PlusIcon className="w-6 h-6" />
                      ) : (
                        "Add Purchased Item"
                      )}
                    </Button>
                  </div>
                </DialogHeader>
                <Table
                  style={{ width: "100%" }}
                  className="min-w-[600px]  rounded-md border-border w-full h-10 overflow-clip relative"
                  divClassname="min-h-[400px] overflow-y-scroll"
                >
                  <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                    <TableRow>
                      {/* <TableHead>Purchased ID</TableHead> */}
                      <TableHead>Item Name</TableHead>
                      <TableHead>Item Type</TableHead>
                      <TableHead>Sack Weight</TableHead>
                      <TableHead>Unit of Measurement</TableHead>
                      <TableHead>Measurement Value</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <>
                      {purchaseItems &&
                        purchaseItems.map((purchaseItem, index: number) => (
                          <TableRow key={index}>
                            {/* <TableCell>
                              {purchaseItem.transactionitemid}
                            </TableCell> */}
                            <TableCell>{purchaseItem.Item.name}</TableCell>
                            <TableCell>{purchaseItem.Item.type}</TableCell>
                            <TableCell>
                              {purchaseItem.Item.sackweight}
                            </TableCell>
                            <TableCell>
                              {purchaseItem.unitofmeasurement}
                            </TableCell>
                            <TableCell>
                              {purchaseItem.measurementvalue}
                            </TableCell>
                            <TableCell>{purchaseItem.unitprice}</TableCell>
                            <TableCell>{purchaseItem.totalamount}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleEditPurchaseItem(purchaseItem)
                                  }
                                >
                                  <FilePenIcon className="w-4 h-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDeletePurchaseItem(purchaseItem)
                                  }
                                >
                                  <TrashIcon className="w-4 h-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </>
                  </TableBody>
                </Table>
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
                                    <SelectItem value="bigas">Bigas</SelectItem>
                                    <SelectItem value="palay">Palay</SelectItem>
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
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will delete the purchased
                    item {purchaseItemToDelete.Item.name} from the Supplier.
                    Please confirm you want to proceed with this action.
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
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
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
                    onClick={() => handleDelete(purchaseToDelete.transactionid)}
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
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2">
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
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="Entity.firstname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="firstname">
                                First Name
                              </FormLabel>
                              <FormControl>
                                <Input {...field} id="firstname" type="text" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="Entity.middlename"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="middlename">
                                Middle Name
                              </FormLabel>
                              <FormControl>
                                <Input {...field} id="middlename" type="text" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="Entity.lastname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="lastname">
                                Last Name
                              </FormLabel>
                              <FormControl>
                                <Input {...field} id="lastname" type="text" />
                              </FormControl>
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
                                  type="text"
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
                                      {field.value ? "true" : "false"}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="true">True</SelectItem>
                                    <SelectItem value="false">False</SelectItem>
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
                                      <Input {...field} id="name" type="text" />
                                    </FormControl>
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
                        <Button onClick={() => append({})} className="mt-4">
                          Add Item
                        </Button>
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
              <DialogContent className="w-full max-w-full sm:min-w-[600px] md:w-[700px] lg:min-w-[1200px] p-4">
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
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2">
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
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={formPurchaseOnly.control}
                          name="Entity.firstname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="firstname">
                                First Name
                              </FormLabel>
                              <FormControl>
                                <Input {...field} id="firstname" type="text" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={formPurchaseOnly.control}
                          name="Entity.middlename"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="middlename">
                                Middle Name
                              </FormLabel>
                              <FormControl>
                                <Input {...field} id="middlename" type="text" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={formPurchaseOnly.control}
                          name="Entity.lastname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="lastname">
                                Last Name
                              </FormLabel>
                              <FormControl>
                                <Input {...field} id="lastname" type="text" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
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
                                  type="text"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
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
                                      {field.value ? "true" : "false"}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="true">True</SelectItem>
                                    <SelectItem value="false">False</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
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
                    </div>
                    <DialogFooter className="items-end mt-4">
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
        </div>
      </div>
    </div>
  );
}

function ViewIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="1" />
      <path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0" />
    </svg>
  );
}

function PlusIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function FilePenIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
