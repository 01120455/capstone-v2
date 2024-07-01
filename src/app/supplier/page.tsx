"use client";

import { useState } from "react";
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

export default function Component() {
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      name: "Acme Inc.",
      email: "info@acme.com",
      phone: "555-1234",
      orders: [
        {
          id: 1,
          date: "2023-04-15",
          item: "Product A",
          quantity: 50,
          amount: 1500,
          status: "Paid",
        },
        { id: 2, date: "2023-03-20", amount: 2000, status: "Pending" },
        { id: 3, date: "2023-02-10", amount: 1800, status: "Paid" },
      ],
    },
    {
      id: 2,
      name: "Globex Corporation",
      email: "orders@globex.com",
      phone: "555-5678",
      orders: [
        { id: 1, date: "2023-05-01", amount: 3000, status: "Paid" },
        { id: 2, date: "2023-04-05", amount: 2500, status: "Paid" },
        { id: 3, date: "2023-03-15", amount: 1800, status: "Pending" },
      ],
    },
    {
      id: 3,
      name: "Stark Industries",
      email: "contact@stark.com",
      phone: "555-9012",
      orders: [
        { id: 1, date: "2023-06-01", amount: 4000, status: "Paid" },
        { id: 2, date: "2023-05-10", amount: 3500, status: "Paid" },
        { id: 3, date: "2023-04-20", amount: 2800, status: "Pending" },
      ],
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [suppliersPerPage] = useState(10);
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const indexOfLastSupplier = currentPage * suppliersPerPage;
  const indexOfFirstSupplier = indexOfLastSupplier - suppliersPerPage;
  const currentSuppliers = suppliers
    .filter((supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(indexOfFirstSupplier, indexOfLastSupplier);
  const totalPages = Math.ceil(suppliers.length / suppliersPerPage);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const [selectedOrder, setSelectedOrder] = useState(null);
  const handleOrderClick = (supplier, order) => {
    setSelectedOrder({ supplier, order });
  };

  const [editingRow, setEditingRow] = useState(null);
  const handleEdit = (rowIndex) => {
    setEditingRow(rowIndex);
  };
  const handleSave = (rowIndex, updatedData) => {
    setSuppliers((prevData) =>
      prevData.map((row, index) =>
        index === rowIndex ? { ...row, ...updatedData } : row
      )
    );
    setEditingRow(null);
  };
  const handleCancel = () => {
    setEditingRow(null);
  };

  return (
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
                Email
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
            {currentSuppliers.map((supplier) => (
              <TableRow
                key={supplier.id}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                {editingRow === supplier.id ? (
                  <>
                    <TableCell className="px-4 py-3">
                      <Input
                        type="text"
                        value={supplier.name}
                        onChange={(e) =>
                          handleSave(supplier.id, { name: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Input
                        type="text"
                        value={supplier.email}
                        onChange={(e) =>
                          handleSave(supplier.id, { email: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Input
                        type="text"
                        value={supplier.phone}
                        onChange={(e) =>
                          handleSave(supplier.id, { phone: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCancel}
                        >
                          <CheckIcon className="h-4 w-4" />
                          <span className="sr-only">Save</span>
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="px-4 py-3">{supplier.name}</TableCell>
                    <TableCell className="px-4 py-3">
                      {supplier.email}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {supplier.phone}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(supplier.id)}
                        >
                          <FilePenIcon className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        {/* <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Delete
                        </Button> */}
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* <TableCell className="px-4 py-3">{supplier.name}</TableCell>
                <TableCell className="px-4 py-3">{supplier.email}</TableCell>
                <TableCell className="px-4 py-3">{supplier.phone}</TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" color="red">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div> */}
      <div className="flex justify-end mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Order History</h2>
        {selectedOrder ? (
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6 border-2 border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Order Details</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedOrder(null)}
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Order ID:</TableHead>
                  <TableHead className="font-medium">Supplier:</TableHead>
                  <TableHead className="font-medium">Date:</TableHead>
                  <TableHead className="font-medium">Item:</TableHead>
                  <TableHead className="font-medium">Quantity:</TableHead>
                  <TableHead className="font-medium">Amount:</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{selectedOrder.order.id}</TableCell>
                  <TableCell>{selectedOrder.supplier.name}</TableCell>
                  <TableCell>{selectedOrder.order.date}</TableCell>
                  <TableCell>{selectedOrder.order.item}</TableCell>
                  <TableCell>{selectedOrder.order.quantity}</TableCell>
                  <TableCell>
                    ${selectedOrder.order.amount.toFixed(2)}
                  </TableCell>
                  <TableHead className="font-medium">Status:</TableHead>
                  <TableCell>
                    <Badge
                      className={
                        selectedOrder.order.status === "Paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : selectedOrder.order.status === "Pending"
                          ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          : "red"
                      }
                    >
                      {selectedOrder.order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                variant="secondary"
                onClick={() => handleEditClick(selectedOrder.order.id)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                <span className="sr-only">Edit Transaction</span>
              </Button>
              <Button variant="destructive">
                <Bin className="h-4 w-4 mr-2" />
                <span className="sr-only">Delete Transaction</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {suppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardHeader>
                  <CardTitle>{supplier.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table className="w-full table-auto">
                    <TableHeader>
                      <TableRow className="bg-gray-100 dark:bg-gray-800">
                        <TableHead className="px-4 py-2 text-left font-medium">
                          Date
                        </TableHead>
                        <TableHead className="px-4 py-2 text-left font-medium">
                          Item
                        </TableHead>
                        <TableHead className="px-4 py-2 text-left font-medium">
                          Quantity
                        </TableHead>
                        <TableHead className="px-4 py-2 text-left font-medium">
                          Amount
                        </TableHead>
                        <TableHead className="px-4 py-2 text-left font-medium">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplier.orders.map((order) => (
                        <TableRow
                          key={order.id}
                          onClick={() => handleOrderClick(supplier, order)}
                          className="cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                        >
                          <TableCell className="px-4 py-2">
                            {order.date}
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            {order.item}
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            {order.quantity}
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            ${order.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            <Badge
                              className={
                                order.status === "Paid"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                  : order.status === "Pending"
                                  ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                  : "red"
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {suppliers.map((supplier) => (
            <Card key={supplier.id}>
              <CardHeader>
                <CardTitle>{supplier.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table className="w-full table-auto">
                  <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-800">
                      <TableHead className="px-4 py-2 text-left font-medium">
                        Date
                      </TableHead>
                      <TableHead className="px-4 py-2 text-left font-medium">
                        Item
                      </TableHead>
                      <TableHead className="px-4 py-2 text-left font-medium">
                        Quantity
                      </TableHead>
                      <TableHead className="px-4 py-2 text-left font-medium">
                        Amount
                      </TableHead>
                      <TableHead className="px-4 py-2 text-left font-medium">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplier.orders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        <TableCell className="px-4 py-2">
                          {order.date}
                        </TableCell>
                        <TableCell className="px-4 py-2">
                          {order.item}
                        </TableCell>
                        <TableCell className="px-4 py-2">
                          {order.quantity}
                        </TableCell>
                        <TableCell className="px-4 py-2">
                          ${order.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-4 py-2">
                          <Badge
                            color={
                              order.status === "Paid"
                                ? "green"
                                : order.status === "Pending"
                                ? "yellow"
                                : "red"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end mt-4">
                  <Button variant={"secondary"}
                    onClick={() => handleEditClick(supplier.id)}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div> */}
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
      <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
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
