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
  TransactionTable,
} from "@/schemas/transaction.schema";
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
  const [showAlert, setShowAlert] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Transaction | null>(
    null
  );

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
      entity: {
        entityid: 0,
        firstname: "",
        middlename: "",
        lastname: "",
        contactnumber: "",
      },
      invoicenumber: {
        invoicenumberid: 0,
        invoicenumber: "",
      },
      transactionitem: [
        {
          transactionitemid: 0,
          item: {
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "transactionitem",
  });

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

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
      entity: {
        entityid: 0,
        firstname: "",
        middlename: "",
        lastname: "",
        contactnumber: "",
      },
      invoicenumber: {
        invoicenumberid: 0,
        invoicenumber: "",
      },
      transactionitem: [
        {
          transactionitemid: 0,
          item: {
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

  const handleEdit = (purchase: Transaction) => {
    setShowModal(true);

    form.reset({
      transactionid: purchase.transactionid,
      type: purchase.type,
      status: purchase.status,
      walkin: purchase.walkin,
      frommilling: purchase.frommilling,
      taxpercentage: purchase.taxpercentage,
      // totalamount: purchase.totalamount,
      entity: {
        entityid: purchase.entity.entityid,
        firstname: purchase.entity.firstname,
        middlename: purchase.entity.middlename,
        lastname: purchase.entity.lastname,
        contactnumber: purchase.entity.contactnumber,
      },
      invoicenumber: {
        invoicenumberid: purchase.invoicenumber.invoicenumberid,
        invoicenumber: purchase.invoicenumber.invoicenumber,
      },
      transactionitem: purchase.transactionitem.map((item) => ({
        transactionitemid: item.transactionitemid,
        item: {
          itemid: item.item.itemid,
          name: item.item.name,
          type: item.item.type,
          sackweight: item.item.sackweight,
        },
        unitofmeasurement: item.unitofmeasurement,
        measurementvalue: item.measurementvalue,
        unitprice: item.unitprice,
      })),
    });
  };

  const handleCancel = () => {
    setShowModal(false);

    form.reset({
      transactionid: 0,
      type: "purchase",
      status: "pending",
      walkin: false,
      frommilling: false,
      taxpercentage: 0,
      // totalamount: 0,
      entity: {
        entityid: 0,
        firstname: "",
        middlename: "",
        lastname: "",
        contactnumber: "",
      },
      invoicenumber: {
        invoicenumberid: 0,
        invoicenumber: "",
      },
      transactionitem: [
        {
          transactionitemid: 0,
          item: {
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

  // const handleSubmit = async (values: Purchase) => {
  //   console.log("Form Values:", values);
  //   const formData = new FormData();

  //   formData.append("name", values.purchaseitems[0].item.name);
  //   formData.append("type", values.purchaseitems[0].item.type);
  //   formData.append("noofsack", values.purchaseitems[0].noofsack.toString());
  //   formData.append(
  //     "totalweight",
  //     values.purchaseitems[0].totalweight.toString()
  //   );
  //   formData.append(
  //     "priceperunit",
  //     values.purchaseitems[0].priceperunit.toString()
  //   );
  //   formData.append(
  //     "unitofmeasurement",
  //     values.purchaseitems[0].unitofmeasurement
  //   );
  //   formData.append("frommilling", values.frommilling ? "true" : "false");
  //   formData.append("suppliername", values.supplier.suppliername);
  //   formData.append("contactnumber", values.supplier.contactnumber);
  //   formData.append("status", values.status);

  //   try {
  //     let method = "POST";
  //     let endpoint = "/api/purchase";

  //     if (values.purchaseid) {
  //       method = "PUT";
  //       endpoint = `/api/purchase/`;
  //       formData.append("purchaseid", values.purchaseid.toString());
  //     }

  //     const uploadRes = await fetch(endpoint, {
  //       method: method,
  //       body: formData,
  //     });

  //     if (uploadRes.ok) {
  //       if (values.purchaseid) {
  //         console.log("Purchase updated successfully");
  //       } else {
  //         console.log("Purchase added successfully");
  //       }

  //       setShowModal(false);
  //       refreshPurchases();
  //       form.reset();
  //     } else {
  //       console.error("Upload failed", await uploadRes.text());
  //     }
  //   } catch (error) {
  //     console.error("Error adding/updating purchase:", error);
  //   }
  // };

  // const handleDelete = async (purchaseid: number | undefined) => {
  //   try {
  //     const response = await fetch(`/api/purchase-delete/${purchaseid}`, {
  //       method: "DELETE",
  //     });

  //     if (response.ok) {
  //       console.log("Purchased product deleted successfully");
  //       setShowAlert(false);
  //       setPurchaseToDelete(null);
  //       refreshPurchases();
  //     } else {
  //       console.error("Error deleting purchase:", response.status);
  //     }
  //   } catch (error) {
  //     console.error("Error deleting purchase:", error);
  //   }
  // };

  const handleSubmit = async (values: Transaction) => {
    console.log("Form Values:", values);
    const formData = new FormData();

    // Append general purchase data
    formData.append("type", values.type);
    formData.append("status", values.status);
    formData.append("walkin", values.walkin.toString());
    formData.append("frommilling", values.frommilling.toString());
    formData.append("taxpercentage", values.taxpercentage !== undefined ? values.taxpercentage.toString() : '');
    formData.append("Entity[firstname]", values.entity.firstname);
    formData.append("Entity[middlename]", values.entity.middlename);
    formData.append("Entity[lastname]", values.entity.lastname);
    formData.append("Entity[contactnumber]", values.entity.contactnumber.toString());
    formData.append(
      "invoicenumber",
      values.invoicenumber.invoicenumber || ''
    );

    // Loop through each Transaction item and append its data
    values.transactionitem.forEach((item, index) => {
      formData.append(`TransactionItem[${index}][item][name]`, item.item.name);
      formData.append(`TransactionItem[${index}][item][type]`, item.item.type);
      formData.append(`TransactionItem[${index}][item][sackweight]`, item.item.sackweight);
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
    });

    try {
      let method = "POST";
      let endpoint = "/api/purchase";

      if (values.transactionid) {
        method = "PUT";
        endpoint = `/api/purchase/`;
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

        setShowModal(false);
        refreshPurchases();
        form.reset();
      } else {
        console.error("Upload failed", await uploadRes.text());
      }
    } catch (error) {
      console.error("Error adding/updating purchase:", error);
    }
  };

  const handleDelete = async (transactionid: number | undefined) => {
    try {
      const response = await fetch(
        `/api/purchase-soft-delete/${transactionid}`,
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

  const handleDeletePurchase = (purchase: Transaction) => {
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

  // const handleAddPurchaseItem = (index: number) => {
  //   const updatedPurchasteItems = purchaseItems;
  //   updatedPurchasteItems?.splice(index + 1, 0, {
  //     Item: {
  //       itemid: 0,
  //       name: "",
  //       type: "palay",
  //       unitofmeasurement: "",
  //     },
  //     noofsack: 0,
  //     priceperunit: 0,
  //     totalweight: 0,
  //   });
  //   setPurchaseItems(updatedPurchasteItems);
  // }

  // const handleRemovePurchaseItem = (index: number) => {
  //   const updatedPurchasteItems = purchaseItems;
  //   updatedPurchasteItems?.splice(index, 1);
  //   setPurchaseItems(updatedPurchasteItems);
  // }

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
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Last Modify by</TableHead>
                      <TableHead>Last Modified at</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <>
                      {purchases &&
                        purchases.map((purchase, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              {purchase.Invoicenumber.invoicenumber}
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
                            <TableCell>{purchase.totalamount}</TableCell>
                            <TableCell>
                              {purchase.user
                                ? `${purchase.user.firstname} ${purchase.user.lastname}`
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
                    {/* <>
                      {purchases &&
                        purchases.map((purchase, index: number) => (
                          <TableRow key={index}>
                            {purchase.PurchaseItems.map((item, itemIndex) => (
                              <React.Fragment key={itemIndex}>
                                <TableCell>{item.Item.name}</TableCell>
                                <TableCell>{item.Item.type}</TableCell>
                                <TableCell>{item.noofsack}</TableCell>
                                <TableCell>{item.unitofmeasurement}</TableCell>
                                <TableCell>{item.priceperunit}</TableCell>
                                <TableCell>{item.totalweight}</TableCell>
                              </React.Fragment>
                            ))}
                            <TableCell>
                              {purchase.frommilling ? "True" : "False"}
                            </TableCell>
                            <TableCell>
                              {purchase.Supplier.suppliername}
                            </TableCell>

                            <TableCell>{purchase.status}</TableCell>
                            <TableCell>{purchase.totalamount}</TableCell>
                            <TableCell>
                              {purchase.User.firstname} {purchase.User.lastname}
                            </TableCell>
                            <TableCell>
                              {purchase.date
                                ? new Date(purchase.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {purchase.LastModifier
                                ? `${purchase.LastModifier.firstname} ${purchase.LastModifier.lastname}`
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {purchase.updatedat
                                ? new Date(
                                    purchase.updatedat
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
                    </> */}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>
          {purchaseToDelete && (
            <AlertDialog open={showAlert}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    Invoice No.{" "} {purchaseToDelete.invoicenumber.invoicenumber}{" "}
                    and all of its contents from the database. Please confirm you want to
                    proceed with this action.
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
                        name="invoicenumber.invoicenumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="invoicenumber">
                              Invoice Number
                            </FormLabel>
                            <FormControl>
                              <Input {...field} id="invoicenumber" type="text" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="entity.firstname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="firstname">
                                First Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="firstname"
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
                          name="entity.middlename"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="middlename">
                                Middle Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="middlename"
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
                          name="entity.lastname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="lastname">Last Name</FormLabel>
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
                          name="entity.contactnumber"
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
                    {fields.map((item, index) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-2 lg:grid-cols-3 grid-rows-4 lg:grid-rows-2 gap-2 py-2"
                      >
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name={`transactionitem.${index}.item.name`}
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
                            control={form.control}
                            name={`transactionitem.${index}.item.type`}
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
                            control={form.control}
                            name={`transactionitem.${index}.item.sackweight`}
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
                            name={`transactionitem.${index}.unitofmeasurement`}
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
                          name={`transactionitem.${index}.measurementvalue`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="measurementvalue">
                                Measurement Value
                              </FormLabel>
                              <FormControl>
                                <Input {...field} id="measurementvalue" type="number" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        </div>
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name={`transactionitem.${index}.unitprice`}
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
        </div>
      </div>
    </div>
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
