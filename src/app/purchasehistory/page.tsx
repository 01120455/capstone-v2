"use client";

import { useState, useMemo, useEffect } from "react";
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
import SideMenu from "@/components/sidemenu";
import transactionSchema, {
  TransactionTable,
} from "@/schemas/transaction.schema";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { XIcon, ArrowRightIcon } from "@/components/icons/Icons";
import { useAuth } from "../../utils/hooks/auth";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "@/components/icons/Icons";
import Link from "next/link";

export default function Component() {
  const [purchases, setPurchases] = useState<TransactionTable[]>([]);
  const [filters, setFilters] = useState({
    invoiceno: "",
    name: "",
    supplier: "",
    dateRange: { start: "", end: "" },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionTable | null>(null);
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const getPurchases = async () => {
      try {
        const response = await fetch("/api/suppliertransaction");
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

        console.log("Parsed Data:", parsedData);
        setPurchases(parsedData);
      } catch (error) {
        console.error("Error in getPurchases:", error);
      }
    };

    getPurchases();
  }, []);

  const filteredTransactions = useMemo(() => {
    console.log("Filters:", filters);
    console.log("Search Term:", searchTerm);

    if (
      !filters.invoiceno &&
      !filters.name &&
      !filters.supplier &&
      !filters.dateRange.start &&
      !filters.dateRange.end &&
      !searchTerm
    ) {
      return purchases;
    }

    return purchases.filter((purchase) => {
      const invoiceNo =
        purchase.InvoiceNumber?.invoicenumber?.toLowerCase() || "";
      const supplierName =
        `${purchase.Entity.name}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      console.log("Invoice Number:", invoiceNo);
      console.log("Filter Invoice Number:", filters.invoiceno.toLowerCase());

      const itemNameMatches = purchase.TransactionItem.some((item) => {
        const itemName = item?.Item?.name?.toLowerCase() || "";
        return itemName.includes(filters.name.toLowerCase());
      });

      const createdAt = purchase.createdat
        ? new Date(purchase.createdat)
        : null;
      const start = filters.dateRange.start
        ? new Date(filters.dateRange.start)
        : null;
      const end = filters.dateRange.end
        ? new Date(filters.dateRange.end)
        : null;

      const isWithinDateRange = (
        createdAt: Date | null,
        start: Date | null,
        end: Date | null
      ) => {
        if (!createdAt) return false;
        if (start && end) return createdAt >= start && createdAt <= end;
        if (start) return createdAt >= start;
        if (end) return createdAt <= end;
        return true;
      };

      return (
        (!filters.invoiceno ||
          invoiceNo.includes(filters.invoiceno.toLowerCase())) &&
        (!filters.supplier ||
          supplierName.includes(filters.supplier.toLowerCase())) &&
        itemNameMatches &&
        isWithinDateRange(createdAt, start, end) &&
        (itemNameMatches || supplierName.includes(searchLower))
      );
    });
  }, [filters, searchTerm, purchases]);

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

  // Role-based access control
  if (userRole === "admin" || userRole === "manager") {
    return (
      <div className="flex h-screen">
        <SideMenu />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="container mx-auto px-4 md:px-6 ">
            <h1 className="text-2xl font-bold mb-6">Purchase Order History</h1>
            <div className="grid gap-6 md:grid-cols-[1fr_380px]">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  {/* <Input
                  type="text"
                  placeholder="Search Item name or Supplier Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                /> */}
                </div>
                {selectedTransaction ? (
                  <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold">
                        Purchase Order Details
                      </h2>
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
                          Supplier Name:
                        </div>
                        <div>
                          {selectedTransaction.Entity.name}
                        </div>
                        <div className="font-medium text-muted-foreground">
                          Purchase Date:
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
                          Updated by:
                        </div>
                        <div>
                          {selectedTransaction.User
                            ? `${selectedTransaction.User.firstname} ${selectedTransaction.User.lastname}`
                            : "N/A"}
                        </div>
                        <div className="font-medium text-muted-foreground">
                          Updated at:
                        </div>
                        <div>
                          {selectedTransaction.lastmodifiedat
                            ? new Date(
                                selectedTransaction.lastmodifiedat
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
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
                                <TableRow>
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
                                {selectedTransaction.TransactionItem.map(
                                  (item, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{item.Item.name}</TableCell>
                                      <TableCell>{item.Item.type}</TableCell>
                                      <TableCell>
                                        {item.Item.sackweight}
                                      </TableCell>
                                      <TableCell>
                                        {item.unitofmeasurement}
                                      </TableCell>
                                      <TableCell>
                                        {item.measurementvalue}
                                      </TableCell>
                                      <TableCell>
                                        {formatPrice(item.unitprice)}
                                      </TableCell>
                                      <TableCell>
                                        {formatPrice(item.totalamount)}
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="font-medium">Total Items:</div>
                        <div>{selectedTransaction.TransactionItem.length}</div>
                        <div className="font-medium">
                          Tax Amount {""} {selectedTransaction.taxpercentage}%:
                        </div>
                        <div>
                          {formatPrice(selectedTransaction.taxamount ?? 0)}
                        </div>
                        <div className="font-medium">Total:</div>
                        <div>
                          {formatPrice(selectedTransaction.totalamount ?? 0)}
                        </div>
                      </div>
                      {/* <div className="flex justify-end space-x-2">
                      <Button variant={"secondary"}>
                        <Pencil className="h-4 w-4 mr-2" />
                        <span className="sr-only">Edit Transaction</span>
                      </Button>
                      <Button variant={"destructive"}>
                        <Bin className="h-4 w-4 mr-2" />
                        <span className="sr-only">Delete Transaction</span>
                      </Button>
                    </div> */}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="table-container relative ">
                      <ScrollArea>
                        <Table
                          style={{ width: "100%" }}
                          className="min-w-[600px]  rounded-md border-border w-full h-10 overflow-clip relative"
                          divClassname="min-h-[400px] overflow-y-scroll max-h-[400px] overflow-y-auto"
                        >
                          <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                            <TableRow>
                              <TableHead>Invoice No.</TableHead>
                              <TableHead>Supplier</TableHead>
                              {/* <TableHead>Walk-in</TableHead> */}
                              <TableHead>From Milling</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Total Amount</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead />
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
                                    onClick={() =>
                                      setSelectedTransaction(transaction)
                                    }
                                    // onClick={() => {
                                    //   console.log(transaction); // Ensure `transaction` is defined and has expected properties
                                    //   if (transaction) {
                                    //     setSelectedTransaction(transaction);
                                    //   }
                                    // }}
                                    className="cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                                  >
                                    <TableCell>
                                      {transaction.InvoiceNumber.invoicenumber}
                                    </TableCell>
                                    <TableCell>
                                      {transaction.Entity.name}
                                    </TableCell>
                                    {/* <TableCell>
                                      {transaction.walkin ? "Yes" : "No"}
                                    </TableCell> */}
                                    <TableCell>
                                      {transaction.frommilling ? "Yes" : "No"}
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
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" // Default case
                                        }`}
                                      >
                                        {transaction.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {formatPrice(
                                        transaction.totalamount ?? 0
                                      )}
                                    </TableCell>
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
                                      <Button variant="outline" size="icon">
                                        <ArrowRightIcon className="h-4 w-4" />
                                        <span className="sr-only">
                                          View details
                                        </span>
                                      </Button>
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
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4">Filters</h2>
                <div className="grid gap-4">
                  {/* Item Name Filter */}
                  <div className="grid gap-2">
                    <Label htmlFor="item-name">Invoice Number</Label>
                    <Input
                      id="invoice-number"
                      type="text"
                      placeholder="Enter Invoice Number"
                      value={filters.invoiceno}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          invoiceno: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="item-name">Item Name</Label>
                    <Input
                      id="item-name"
                      type="text"
                      placeholder="Enter Item name"
                      value={filters.name}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Supplier Name Filter */}
                  <div className="grid gap-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      type="text"
                      placeholder="Enter supplier name"
                      value={filters.supplier}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          supplier: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Date Range Filter */}
                  <div className="grid gap-2">
                    <Label className="my-1.5 mt-3">Date Range</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Start Date Filter */}
                      <div className="grid gap-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={filters.dateRange.start}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              dateRange: {
                                ...prev.dateRange,
                                start: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>

                      {/* End Date Filter */}
                      <div className="grid gap-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={filters.dateRange.end}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              dateRange: {
                                ...prev.dateRange,
                                end: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
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
