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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import SideMenu from "@/components/sidemenu";
import transactionSchema, {
  TransactionTable,
} from "@/schemas/transaction.schema";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
        `${purchase.Entity.firstname} ${purchase.Entity.lastname}`.toLowerCase();
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

  return (
    <div className="flex h-screen">
      <SideMenu />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="container mx-auto px-4 md:px-6 ">
          <h1 className="text-2xl font-bold mb-6">Purchase History</h1>
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
                    <h2 className="text-lg font-bold">Purchase Details</h2>
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
                    <div className="grid grid-cols-4 gap-1 p-2">
                      <div className="font-medium text-muted-foreground">
                        Supplier Name:
                      </div>
                      <div>
                        {selectedTransaction.Entity.firstname} {""}
                        {selectedTransaction.Entity.middlename} {""}
                        {selectedTransaction.Entity.lastname}
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
                            <TableHeader>
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
                                    <TableCell>{item.unitprice}</TableCell>
                                    <TableCell>{item.totalamount}</TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                          <ScrollBar orientation="vertical" />
                        </ScrollArea>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="font-medium">Total Items:</div>
                      <div>{selectedTransaction.TransactionItem.length}</div>
                      <div className="font-medium">
                        Tax Amount {""} ${selectedTransaction.taxpercentage}%:
                      </div>
                      <div>${selectedTransaction.taxamount}</div>
                      <div className="font-medium">Total:</div>
                      <div>${selectedTransaction.totalamount}</div>
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
                            <TableHead>Walkin</TableHead>
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
                                    {transaction.Entity.firstname}{" "}
                                    {transaction.Entity.middlename}{" "}
                                    {transaction.Entity.lastname}
                                  </TableCell>
                                  <TableCell>
                                    {transaction.walkin ? "True" : "False"}
                                  </TableCell>
                                  <TableCell>
                                    {transaction.frommilling ? "True" : "False"}
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
                                    ${transaction.totalamount}
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

function ArrowRightIcon(props) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function FilterIcon(props) {
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
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function Bin(props) {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

function Pencil(props) {
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
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}
