"use client";

import { useState, useMemo } from "react";
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

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    customer: "",
    dateRange: {
      start: "",
      end: "",
    },
    paymentMethod: "",
  });
  const transactions = [
    {
      id: "TX001",
      customer: "John Doe",
      items: [
        { name: "Product A", quantity: 2, price: 9.99 },
        { name: "Product B", quantity: 1, price: 19.99 },
      ],
      subtotal: 39.97,
      tax: 3.2,
      total: 43.17,
      paymentMethod: "Credit Card",
      date: "2023-05-15",
    },
    {
      id: "TX002",
      customer: "Jane Smith",
      items: [
        { name: "Product C", quantity: 1, price: 14.99 },
        { name: "Product D", quantity: 3, price: 7.99 },
      ],
      subtotal: 37.96,
      tax: 3.04,
      total: 41.0,
      paymentMethod: "Cash",
      date: "2023-05-20",
    },
    {
      id: "TX003",
      customer: "Bob Johnson",
      items: [{ name: "Product E", quantity: 1, price: 24.99 }],
      subtotal: 24.99,
      tax: 2.0,
      total: 26.99,
      paymentMethod: "Debit Card",
      date: "2023-05-25",
    },
    {
      id: "TX004",
      customer: "Sarah Lee",
      items: [
        { name: "Product F", quantity: 2, price: 12.99 },
        { name: "Product G", quantity: 1, price: 9.99 },
      ],
      subtotal: 35.97,
      tax: 2.88,
      total: 38.85,
      paymentMethod: "Credit Card",
      date: "2023-05-30",
    },
  ];
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const { customer, dateRange, paymentMethod } = filters;
        const { start, end } = dateRange;
        return (
          transaction.customer.toLowerCase().includes(customer.toLowerCase()) &&
          (!start || new Date(transaction.date) >= new Date(start)) &&
          (!end || new Date(transaction.date) <= new Date(end)) &&
          (paymentMethod === "" || transaction.paymentMethod === paymentMethod)
        );
      })
      .filter((transaction) => {
        return (
          transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.customer.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
  }, [filters, searchTerm]);

  const [selectedTransaction, setSelectedTransaction] = useState(null);

  return (
    <div className="flex h-screen">
      <SideMenu />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <h1 className="text-2xl font-bold mb-6">Sales History</h1>
          <div className="grid gap-6 md:grid-cols-[1fr_380px]">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <Input
                  type="text"
                  placeholder="Search sales by ID or Customer Name..."
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
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Sale ID:</div>
                      <div>{selectedTransaction.id}</div>
                      <div className="font-medium">Customer:</div>
                      <div>{selectedTransaction.customer}</div>
                      <div className="font-medium">Date:</div>
                      <div>{selectedTransaction.date}</div>
                      <div className="font-medium">Payment Method:</div>
                      <div>{selectedTransaction.paymentMethod}</div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTransaction.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell>
                              ${(item.quantity * item.price).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Subtotal:</div>
                      <div>${selectedTransaction.subtotal.toFixed(2)}</div>
                      <div className="font-medium">Tax:</div>
                      <div>${selectedTransaction.tax.toFixed(2)}</div>
                      <div className="font-medium">Total:</div>
                      <div>${selectedTransaction.total.toFixed(2)}</div>
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
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        onClick={() => setSelectedTransaction(transaction)}
                        className="cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                      >
                        <TableCell>{transaction.id}</TableCell>
                        <TableCell>{transaction.customer}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>${transaction.total.toFixed(2)}</TableCell>
                        <TableCell>{transaction.paymentMethod}</TableCell>
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
                  <Label htmlFor="customer">Customer</Label>
                  <Input
                    id="customer"
                    type="text"
                    placeholder="Enter customer name"
                    value={filters.customer}
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
                <div className="grid gap-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select
                    id="payment-method"
                    value={filters.paymentMethod}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        paymentMethod: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Debit Card">Debit Card</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
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
