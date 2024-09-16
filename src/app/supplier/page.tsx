"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { Entity, EntityTransaction } from "@/schemas/entity.schema";
import {
  TransactionItem,
  TransactionTable,
} from "@/schemas/transaction.schema";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Component() {
  const [suppliers, setSuppliers] = useState<Entity[]>([]);
  const [transactions, setTransactions] = useState<TransactionTable[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<TransactionItem[] | null>(
    null
  );
  const [showTablePurchaseItem, setShowTablePurchaseItem] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // const [currentPage, setCurrentPage] = useState(1);

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

        // Convert date strings to Date objects
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
        const suppliersResponse = await fetch("/api/supplier"); // Adjust the endpoint as needed
        const transactionsResponse = await fetch("/api/suppliertransaction"); // Adjust the endpoint as needed

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
                            // onClick={() => handleEditSupplier(supplier)}
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

          {/* <div className="flex justify-end mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div> */}
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
                                      {purchaseItem.unitprice}
                                    </TableCell>
                                    <TableCell>
                                      {purchaseItem.totalamount}
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
                                              : transaction.status === "pending"
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
                                        {transaction.walkin ? "True" : "False"}
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
                                        {transaction.taxamount}
                                      </TableCell>
                                      <TableCell className="px-4 py-2">
                                        {transaction.totalamount}
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

          {/* <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Order History</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {suppliers.map((supplier) => {
          const supplierTransactions = transactions.filter(
            (transaction) =>
              transaction.Entity?.entityid === supplier.entityid
          );

          return (
            <Card key={supplier.entityid}>
              <CardHeader>
                <CardTitle>
                  {supplier.firstname} {supplier.middlename ?? ""}{" "}
                  {supplier.lastname}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table className="w-full table-auto">
                  <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-800">
                      <TableHead className="px-4 py-2 text-left font-medium">
                        Invoice
                      </TableHead>
                      <TableHead className="px-4 py-2 text-left font-medium">
                        Status
                      </TableHead>
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
                          className="cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                        >
                          <TableCell className="px-4 py-2">
                            {transaction.InvoiceNumber?.invoicenumber || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`px-2 py-1 rounded-full ${
                                transaction.status === "paid"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                  : transaction.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                  : transaction.status === "cancelled"
                                  ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                              }`}
                            >
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            {transaction.totalamount}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center px-4 py-2">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div> */}
        </div>
      </div>
    </div>
  );
}

function CheckIcon(props) {
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
      <path d="M20 6 9 17l-5-5" />
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
      <path d="m12 20h9" />
      <path d="m16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function XIcon(props) {
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
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}
