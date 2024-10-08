"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, RotateCcw } from "@/components/icons/Icons";

const tables = ["Users", "Customers", "Suppliers", "Transactions", "Items"];

export default function ArchivePage() {
  const [activeTab, setActiveTab] = useState("Users");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRestore = (id: number) => {
    console.log(`Restore item with id: ${id}`);
    // Implement restore logic here
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Archive</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          {tables.map((table) => (
            <TabsTrigger key={table} value={table}>
              {table}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-4 mb-4">
          <div className="relative w-full">
            <Input
              placeholder="Search archived items..."
              value={searchTerm}
              onChange={handleSearch}
              className="max-w-sm" // Adjust padding to prevent overlap with the icon
            />
          </div>
        </div>

        {tables.map((table) => (
          <TabsContent key={table} value={table}>
            <ArchiveTable
              type={table.toLowerCase()}
              searchTerm={searchTerm}
              onRestore={handleRestore}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

type ArchiveTableProps = {
  type: string;
  searchTerm: string;
  onRestore: (id: number) => void;
};

function ArchiveTable({ type, searchTerm, onRestore }: ArchiveTableProps) {
  // Mock data for each table type
  const data = {
    users: [
      { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
    ],
    customers: [
      {
        id: 1,
        name: "Acme Corp",
        contact: "Alice Johnson",
        phone: "123-456-7890",
      },
      {
        id: 2,
        name: "XYZ Inc",
        contact: "Bob Williams",
        phone: "987-654-3210",
      },
    ],
    suppliers: [
      {
        id: 1,
        name: "Supply Co",
        contact: "Charlie Brown",
        phone: "111-222-3333",
      },
      {
        id: 2,
        name: "Parts Ltd",
        contact: "Diana Ross",
        phone: "444-555-6666",
      },
    ],
    transactions: [
      { id: 1, date: "2023-05-01", amount: 1000, type: "Sale" },
      { id: 2, date: "2023-05-02", amount: 500, type: "Purchase" },
    ],
    items: [
      { id: 1, name: "Widget A", sku: "WA-001", price: 9.99 },
      { id: 2, name: "Gadget B", sku: "GB-002", price: 19.99 },
    ],
  };

  const filteredData = data[type].filter((item) =>
    Object.values(item).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const columns = Object.keys(data[type][0]).filter((key) => key !== "id");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column} className="capitalize">
              {column}
            </TableHead>
          ))}
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((item) => (
          <TableRow key={item.id}>
            {columns.map((column) => (
              <TableCell key={column}>{item[column]}</TableCell>
            ))}
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestore(item.id)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
