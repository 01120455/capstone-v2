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
import {
  purchase,
  AddPurchase,
  ViewPurchase,
  TablePurchase,
} from "@/schemas/purchase.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SideMenu from "@/components/sidemenu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Component() {
  const [purchases, setPurchases] = useState<TablePurchase[] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<AddPurchase | null>(
    null
  );

  const form = useForm<AddPurchase>({
    resolver: zodResolver(purchase),
    defaultValues: {
      purchaseid: 0,
      supplierid: 0,
      suppliername: "",
      contactnumber: "",
      itemid: 0,
      name: "",
      type: "palay",
      unitofmeasurement: "",
      status: "pending",
      totalamount: 0,
      frommilling: false,
      noofsack: 0,
      totalweight: 0,
      priceperunit: 0,
    },
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
      purchaseid: 0,
      supplierid: 0,
      suppliername: "",
      contactnumber: "",
      itemid: 0,
      name: "",
      type: "palay",
      unitofmeasurement: "",
      status: "pending",
      totalamount: 0,
      frommilling: false,
      noofsack: 0,
      totalweight: 0,
      priceperunit: 0,
    });
  };

  const handleEdit = (purchase: TablePurchase) => {
    setShowModal(true);

    form.reset({
      purchaseid: purchase.purchaseid,
      supplierid: purchase.Supplier.supplierid,
      suppliername: purchase.Supplier.suppliername,
      contactnumber: purchase.Supplier.contactnumber,
      itemid: purchase.PurchaseItems[0].itemid,
      name: purchase.PurchaseItems[0].Item.name,
      type: purchase.PurchaseItems[0].Item.type,
      unitofmeasurement: purchase.PurchaseItems[0].Item.unitofmeasurement,
      status: purchase.status,
      totalamount: purchase.totalamount,
      frommilling: purchase.frommilling,
      noofsack: purchase.PurchaseItems[0].noofsack,
      totalweight: purchase.PurchaseItems[0].totalweight,
      priceperunit: purchase.PurchaseItems[0].priceperunit,
    });
  };

  const handleCancel = () => {
    setShowModal(false);

    form.reset({
      purchaseid: 0,
      supplierid: 0,
      suppliername: "",
      contactnumber: "",
      itemid: 0,
      name: "",
      type: "palay",
      unitofmeasurement: "",
      status: "pending",
      totalamount: 0,
      noofsack: 0,
      totalweight: 0,
      priceperunit: 0,
    });
  };

  const handleSubmit = async (values: AddPurchase) => {
    console.log("Form Values:", values);
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("type", values.type);
    formData.append("noofsack", values.noofsack.toString());
    formData.append("totalweight", values.totalweight.toString());
    formData.append("priceperunit", values.priceperunit.toString());
    formData.append("unitofmeasurement", values.unitofmeasurement.toString());
    formData.append("suppliername", values.suppliername);
    formData.append("contactnumber", values.contactnumber);
    formData.append("status", values.status);

    try {
      let method = "POST";
      let endpoint = "/api/purchase";

      if (values.purchaseid) {
        method = "PUT";
        endpoint = `/api/purchase/`;
        formData.append("purchaseid", values.purchaseid.toString());
      }

      const uploadRes = await fetch(endpoint, {
        method: method,
        body: formData,
      });

      if (uploadRes.ok) {
        if (values.purchaseid) {
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

  const handleDelete = async (purchaseid: number | undefined) => {
    try {
      const response = await fetch(`/api/purchase-delete/${purchaseid}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Purchased product deleted successfully");
        setShowAlert(false);
        setPurchaseToDelete(null);
        refreshPurchases();
      } else {
        console.error("Error deleting purchase:", response.status);
      }
    } catch (error) {
      console.error("Error deleting purchase:", error);
    }
  };

  const handleDeletePurchase = (purchase: TablePurchase) => {
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
              <ScrollArea >
                <Table
                  style={{ width: "100%"}}
                  className="min-w-[1000px]  rounded-md border-border w-full h-10 overflow-clip relative"
                  divClassname="min-h-[400px] overflow-y-scroll"
                >
                  <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Item Type</TableHead>
                      <TableHead>No of Sacks</TableHead>
                      <TableHead>Unit of Measurement</TableHead>
                      <TableHead>Price Per Kilogram</TableHead>
                      <TableHead>Total Weight</TableHead>
                      <TableHead>From Milling</TableHead>
                      <TableHead>Supplier Name</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Created by</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <>
                      {purchases &&
                        purchases.map((purchase, index: number) => (
                          <TableRow key={index}>
                            {purchase.PurchaseItems.map((item, itemIndex) => (
                              <React.Fragment key={itemIndex}>
                                <TableCell>{item.Item.name}</TableCell>
                                <TableCell>{item.Item.type}</TableCell>
                                <TableCell>{item.noofsack}</TableCell>
                                <TableCell>
                                  {item.Item.unitofmeasurement}
                                </TableCell>
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
                    </>
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
                    the item name {purchaseToDelete?.name} {""} type{" "}
                    {purchaseToDelete.type} {""}
                    from supplier {purchaseToDelete?.suppliername}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={handleDeleteCancel}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(purchaseToDelete.purchaseid)}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {showModal && (
            <Dialog open={showModal} onOpenChange={handleCancel}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {form.getValues("purchaseid")
                      ? "Edit Purchase of Product"
                      : "Add New Purchase of Product"}
                  </DialogTitle>
                  <DialogDescription>
                    Fill out the form to{" "}
                    {form.getValues("purchaseid") ? "edit a" : "add a new"}{" "}
                    purchase product to your inventory.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    className="w-full max-w-4xl mx-auto p-6"
                    onSubmit={form.handleSubmit(handleSubmit)}
                  >
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="name"
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
                          name="type"
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
                                    <SelectValue placeholder="Select type">
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
                          control={form.control}
                          name="noofsack"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="noofsack">
                                No. of sacks
                              </FormLabel>
                              <FormControl>
                                <Input {...field} id="noofsack" type="number" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="unitofmeasurement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="unitofmeasurement">
                                Unit of Measurement
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="unitofmeasurement"
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
                          name="totalweight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="totalweight">
                                Total weight
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="totalweight"
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
                          name="priceperunit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="priceperunit">
                                Price per unit
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="priceperunit"
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
                          name="suppliername"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="suppliername">
                                Supplier Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="suppliername"
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
                          name="contactnumber"
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
                    </div>
                    <DialogFooter>
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
