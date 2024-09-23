"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import SideMenu from "@/components/sidemenu";
import entitySchema, {
  Entity,
  EntityTransaction,
} from "@/schemas/entity.schema";
import {
  TransactionItem,
  TransactionTable,
} from "@/schemas/transaction.schema";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FilePenIcon } from "@/components/icons/Icons";
import { useAuth } from "../../utils/hooks/auth";
import { useRouter } from "next/navigation";
import { AlertCircle } from "@/components/icons/Icons";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { values } from "lodash";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

export default function Component() {
  const [suppliers, setSuppliers] = useState<Entity[]>([]);
  const [transactions, setTransactions] = useState<TransactionTable[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<TransactionItem[] | null>(
    null
  );
  const [showTablePurchaseItem, setShowTablePurchaseItem] = useState(false);
  const [showEditSupplier, setShowEditSupplier] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();

  const form = useForm<Entity>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      entityid: 0,
      firstname: "",
      middlename: "",
      lastname: "",
      contactnumber: "",
    },
  });

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

  const handleEditSupplier = (supplier: Entity) => {
    setShowEditSupplier(true);
    form.reset({
      entityid: supplier.entityid,
      firstname: supplier.firstname,
      middlename: supplier.middlename ?? "",
      lastname: supplier.lastname,
      contactnumber: supplier.contactnumber ?? "",
    });
  };

  const handleCancelEditSupplier = () => {
    setShowEditSupplier(false);
    form.reset();
  };

  const handleSubmit = async (values: Entity) => {
    console.log("Form Values:", values);
    const formData = new FormData();

    formData.append(
      "entityid",
      values.entityid !== undefined ? values.entityid.toString() : ""
    );
    formData.append("firstname", values.firstname);
    formData.append("middlename", values.middlename ?? "");
    formData.append("lastname", values.lastname);
    formData.append("contactnumber", values.contactnumber ?? "");

    try {
      const response = await fetch("/api/supplier", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      } else {
        const data = await response.json();
        console.log("Response Data:", data);
        setSuppliers((prevSuppliers) => {
          const updatedSuppliers = prevSuppliers.map((supplier) => {
            if (supplier.entityid === data.entityid) {
              return data;
            }

            return supplier;
          });

          return updatedSuppliers;
        });
        form.reset();
        setShowEditSupplier(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const getPurchases = async () => {
      try {
        const response = await fetch("/api/supplier");
        const text = await response.text();
        console.log("Raw Response Text:", text);

        const data = JSON.parse(text);

        const parsedData = data.map((item: any) => {
          return {
            ...item,
            createdat: item.createdat ? new Date(item.createdat) : null,
            lastmodifiedat: item.lastmodifiedat
              ? new Date(item.lastmodifiedat)
              : null,
            taxamount: item.taxamount ? parseFloat(item.taxamount) : null,
          };
        });

        console.log("Parsed Data with Date Conversion:", parsedData);

        setSuppliers(parsedData);
      } catch (error) {
        console.error("Error in getPurchases:", error);
      }
    };

    getPurchases();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const suppliersResponse = await fetch("/api/supplier"); 
        const transactionsResponse = await fetch("/api/suppliertransaction"); 

        if (!suppliersResponse.ok || !transactionsResponse.ok) {
          throw new Error("Network response was not ok");
        }

        const suppliersData = await suppliersResponse.json();
        const transactionsData = await transactionsResponse.json();

        console.log("Suppliers Data:", suppliersData);
        console.log("Transactions Data:", transactionsData);

        setSuppliers(suppliersData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const currentSuppliers = suppliers.filter((supplier) =>
    supplier.firstname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPurchaseItem = (purchase: TransactionTable) => {
    setPurchaseItems(purchase.TransactionItem);
    setShowTablePurchaseItem(true);
  };

  const closeViewPurchaseItem = () => {
    setPurchaseItems(null);
    setShowTablePurchaseItem(false);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (isAuthenticated === null) {
    return <p>Loading...</p>;
  }

  // if (isAuthenticated === false) {
  //   return null; // Prevent showing the page while redirecting
  // }

  if (
    userRole === "admin" ||
    userRole === "manager" ||
    userRole === "inventory"
  ) {
    return (
      <div className="flex h-screen">
        <SideMenu />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <h1 className="text-3xl font-bold mb-6">Supplier Management</h1>
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full md:w-auto"
              />
            </div>
            <div className="overflow-x-auto">
              <Table className="w-full table-auto">
                <TableHeader>
                  <TableRow className="bg-gray-100 dark:bg-gray-800">
                    <TableHead className="px-4 py-3 text-left font-medium">
                      Name
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left font-medium">
                      Phone
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left font-medium">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSuppliers.map((supplier: Entity, index: number) => (
                    <TableRow
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <>
                        <TableCell className="px-4 py-3">
                          {supplier.firstname} {supplier.middlename}{" "}
                          {supplier.lastname}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {supplier.contactnumber}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditSupplier(supplier)}
                            >
                              <FilePenIcon className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                              {/* <TableHead>Purchased ID</TableHead> */}
                              <TableHead>Item Name</TableHead>
                              <TableHead>Item Type</TableHead>
                              <TableHead>Sack Weight</TableHead>
                              <TableHead>Unit of Measurement</TableHead>
                              <TableHead>Measurement Value</TableHead>
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
                                      {/* <TableCell>
                              {purchaseItem.transactionitemid}
                            </TableCell> */}
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
                                        {formatPrice(purchaseItem.unitprice)}
                                      </TableCell>
                                      <TableCell>
                                        {formatPrice(purchaseItem.totalamount)}
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
            {showEditSupplier && (
              <Dialog
                open={showEditSupplier}
                onOpenChange={handleCancelEditSupplier}
              >
                <DialogContent className="w-full max-w-full sm:min-w-[600px] md:w-[700px] lg:min-w-[1200px] p-4">
                  <DialogHeader>
                    <DialogTitle>Edit Supplier</DialogTitle>
                    <DialogDescription>
                      Update supplier details
                    </DialogDescription>
                    <DialogClose onClick={handleCancelEditSupplier} />
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
                            name="firstname"
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
                            name="middlename"
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
                            name="lastname"
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
                      </div>
                      <DialogFooter className="mt-4">
                        <Button type="submit">Save</Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelEditSupplier}
                        >
                          Cancel
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Order History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {suppliers.map((supplier) => {
                  const supplierTransactions = transactions.filter(
                    (transaction) =>
                      transaction.Entity?.entityid === supplier.entityid
                  );

                  // console.log("Supplier Transactions:", supplierTransactions);

                  return (
                    <Card key={supplier.entityid}>
                      <CardHeader>
                        <CardTitle>
                          {supplier.firstname} {supplier.middlename ?? ""}{" "}
                          {supplier.lastname}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <div className="table-container relative ">
                            <ScrollArea>
                              <Table
                                style={{ width: "100%" }}
                                className="min-w-[400px]  rounded-md border-border w-full h-10 overflow-clip relative"
                                divClassname="min-h-[300px] overflow-y-scroll max-h-[300px] overflow-y-auto"
                              >
                                <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                                  <TableRow className="bg-gray-100 dark:bg-gray-800">
                                    <TableHead className="px-4 py-2 text-left font-medium">
                                      Invoice
                                    </TableHead>
                                    <TableHead className="px-4 py-2 text-left font-medium">
                                      Status
                                    </TableHead>
                                    <TableHead>Walk in</TableHead>
                                    <TableHead>From Milling</TableHead>
                                    <TableHead>Tax %</TableHead>
                                    <TableHead>Tax Amount</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-medium">
                                      Total Amount
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {supplierTransactions.length > 0 ? (
                                    supplierTransactions.map((transaction) => (
                                      <TableRow
                                        key={transaction.transactionid}
                                        onClick={() =>
                                          handleViewPurchaseItem(transaction)
                                        }
                                        className="cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                                      >
                                        <TableCell className="px-4 py-2">
                                          {transaction.InvoiceNumber
                                            ?.invoicenumber || "N/A"}
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            className={`px-2 py-1 rounded-full ${
                                              transaction.status === "paid"
                                                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                                : transaction.status ===
                                                  "pending"
                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                                : transaction.status ===
                                                  "cancelled"
                                                ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" // Default case
                                            }`}
                                          >
                                            {transaction.status}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          {transaction.walkin
                                            ? "True"
                                            : "False"}
                                        </TableCell>
                                        <TableCell>
                                          {transaction.frommilling
                                            ? "True"
                                            : "False"}
                                        </TableCell>
                                        <TableCell>
                                          {transaction.taxpercentage}
                                        </TableCell>
                                        <TableCell>
                                          {formatPrice(
                                            transaction.taxamount ?? 0
                                          )}
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                          {formatPrice(
                                            transaction.totalamount ?? 0
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell
                                        colSpan={3}
                                        className="text-center px-4 py-2"
                                      >
                                        No transactions found
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                              <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You do not have permission to view this page.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
