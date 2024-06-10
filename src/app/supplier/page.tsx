"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Component() {
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      name: "Acme Inc.",
      email: "info@acme.com",
      phone: "555-1234",
      orders: [
        { id: 1, date: "2023-04-15", amount: 1500, status: "Paid" },
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
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSuppliers.map((supplier) => (
              <tr
                key={supplier.id}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <td className="px-4 py-3">{supplier.name}</td>
                <td className="px-4 py-3">{supplier.email}</td>
                <td className="px-4 py-3">{supplier.phone}</td>
                <td className="px-4 py-3">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Order History</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <Card key={supplier.id}>
              <CardHeader>
                <CardTitle>{supplier.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-left font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        <td className="px-4 py-2">{order.date}</td>
                        <td className="px-4 py-2">
                          ${order.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
