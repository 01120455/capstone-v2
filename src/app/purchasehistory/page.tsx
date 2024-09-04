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
import { tablePurchase, TablePurchase } from "@/schemas/transaction.schema";

export default function Component() {
  const [purchases, setPurchases] = useState<TablePurchase[]>([]);
  const [filters, setFilters] = useState({
    supplier: "",
    dateRange: { start: "", end: "" },
    paymentMethod: "", // This field is not in your schema, consider removing if not used
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<TablePurchase | null>(null);

  useEffect(() => {
    const getPurchases = async () => {
      try {
        const response = await fetch("/api/purchase");
        const text = await response.text();
        console.log("Raw Response Text:", text);

        const data = JSON.parse(text);
        console.log("Parsed Data:", data);

        const validatedPurchases = data
          .map((item: any) => {
            const result = tablePurchase.safeParse(item);
            if (result.success) {
              return result.data;
            } else {
              console.error("Error parsing purchase:", result.error);
              return null;
            }
          })
          .filter((item: any): item is TablePurchase => item !== null);

        console.log("Validated Purchases:", validatedPurchases);
        setPurchases(validatedPurchases);
      } catch (error) {
        console.error("Error in getPurchases:", error);
      }
    };

    getPurchases();
  }, []);

  const filteredTransactions = useMemo(() => {
    return purchases
      .filter((purchase) => {
        const { supplier, dateRange } = filters;
        const { start, end } = dateRange;

        return (
          purchase.Supplier.suppliername
            .toLowerCase()
            .includes(supplier.toLowerCase()) &&
          (!start || new Date(purchase.date ?? "") >= new Date(start)) &&
          (!end || new Date(purchase.date ?? "") <= new Date(end))
        );
      })
      .filter((purchase) => {
        return (
          purchase.PurchaseItems[0].Item.name
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          purchase.Supplier.suppliername
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      });
  }, [filters, searchTerm, purchases]);

  return (
    <div className="flex h-screen">
      <SideMenu />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <h1 className="text-2xl font-bold mb-6">Purchase History</h1>
          <div className="grid gap-6 md:grid-cols-[1fr_380px]">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <Input
                  type="text"
                  placeholder="Search Item name or Supplier Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                {/* <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedTransaction(null)}
            >
              <FilterIcon className="h-4 w-4" />
              <span className="sr-only">Filters</span>
            </Button> */}
              </div>
              {selectedTransaction ? (
                <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
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
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Supplier Name:</div>
                      <div>Jean Clarisse</div>
                      <div className="font-medium">Date:</div>
                      <div>2024-08-25</div>
                      <div className="font-medium">Purchase Created by:</div>
                      <div>John Doe</div>
                      <div className="font-medium">From Milling:</div>
                      <div>False</div>
                      <div className="font-medium">Status:</div>
                      <div>Paid</div>
                      <div className="font-medium">Updated by:</div>
                      <div>Jane Doe</div>
                      <div className="font-medium">Updated at:</div>
                      <div>2024-08-25</div>
                      <div className="font-medium">Total Amount:</div>
                      <div>10,000</div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Item Type</TableHead>
                          <TableHead>Unit of Measurement</TableHead>
                          <TableHead>No. of Sacks</TableHead>
                          <TableHead>Price Per Unit</TableHead>
                          <TableHead>Total Weight</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTransaction.PurchaseItems.map(
                          (item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.Item.name}</TableCell>
                              <TableCell>{item.Item.type}</TableCell>
                              <TableCell>
                                {item.Item.unitofmeasurement}
                              </TableCell>
                              <TableCell>{item.noofsack}</TableCell>
                              <TableCell>{item.priceperunit}</TableCell>
                              <TableCell>{item.totalweight}</TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Total:</div>
                      <div>${selectedTransaction.totalamount}</div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant={"secondary"}>
                        <Pencil className="h-4 w-4 mr-2" />
                        <span className="sr-only">Edit Transaction</span>
                      </Button>
                      <Button variant={"destructive"}>
                        <Bin className="h-4 w-4 mr-2" />
                        <span className="sr-only">Delete Transaction</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Number of Sacks</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction, index: number) => (
                      <TableRow
                        key={index}
                        onClick={() => setSelectedTransaction(transaction)}
                        className="cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                      >
                        <TableCell>
                          {transaction.PurchaseItems[0].Item.name}
                        </TableCell>
                        <TableCell>
                          {transaction.PurchaseItems[0].noofsack}
                        </TableCell>
                        <TableCell>
                          {transaction.Supplier.suppliername}
                        </TableCell>
                        <TableCell>${transaction.totalamount}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="icon">
                            <ArrowRightIcon className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4">Filters</h2>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">Item Name</Label>
                  <Input
                    id="customer"
                    type="text"
                    placeholder="Enter Item name"
                    value={filters.name}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        customer: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Input
                    id="customer"
                    type="text"
                    placeholder="Enter customer name"
                    value={filters.supplier}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        customer: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="my-1.5">Date Range</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={filters.dateRange.start || ""}
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
                    <div className="grid gap-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={filters.dateRange.end || ""}
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
