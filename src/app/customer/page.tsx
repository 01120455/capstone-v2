"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsivePie } from "@nivo/pie";
import { Label } from "@/components/ui/label";

// import { Label } from "@/components/ui/label";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
import SideMenu from "@/components/sidemenu";

export default function Component() {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "John Doe",
      purchases: [
        {
          id: 1,
          date: "2023-05-01",
          items: ["Product A", "Product B"],
          total: 50.99,
        },
        { id: 2, date: "2023-03-15", items: ["Product C"], total: 19.99 },
        {
          id: 3,
          date: "2022-12-01",
          items: ["Product D", "Product E"],
          total: 75.5,
        },
      ],
    },
    {
      id: 2,
      name: "Jane Smith",
      purchases: [
        { id: 1, date: "2023-06-01", items: ["Product F"], total: 29.99 },
        {
          id: 2,
          date: "2023-04-20",
          items: ["Product G", "Product H"],
          total: 45.75,
        },
        { id: 3, date: "2022-11-10", items: ["Product I"], total: 14.99 },
        { id: 4, date: "2022-11-10", items: ["Product F"], total: 14.99 },
      ],
    },
  ]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [categoryFilter, setCategoryFilter] = useState("");
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };
  const filteredPurchases = selectedCustomer
    ? selectedCustomer.purchases.filter((purchase) => {
        const purchaseDate = new Date(purchase.date);
        return (
          (!dateFilter.start || purchaseDate >= new Date(dateFilter.start)) &&
          (!dateFilter.end || purchaseDate <= new Date(dateFilter.end)) &&
          (!categoryFilter ||
            purchase.items.some((item) =>
              item.toLowerCase().includes(categoryFilter.toLowerCase())
            ))
        );
      })
    : [];
  const totalSpend = filteredPurchases.reduce(
    (total, purchase) => total + purchase.total,
    0
  );
  const purchaseFrequency =
    filteredPurchases.length / (selectedCustomer?.purchases.length || 1);
  const categorySpend = filteredPurchases.reduce((categories, purchase) => {
    purchase.items.forEach((item) => {
      if (categories[item]) {
        categories[item] += purchase.total;
      } else {
        categories[item] = purchase.total;
      }
    });
    return categories;
  }, {});

  const handleClearFilters = () => {
    setDateFilter({ start: "", end: "" });
    setCategoryFilter("");
  };

  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEdit = (row) => {
    setEditingRow(row.id);
    setEditData({ ...row });
  };

  const handleInputChange = (key, value) => {
    setEditData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleSave = () => {
    setFilteredPurchases((prevData) =>
      prevData.map((row) =>
        row.id === editingRow ? { ...row, ...editData } : row
      )
    );
    setEditingRow(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };


  return (
    <div className="flex h-screen">
      <SideMenu />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col h-full">
          <header className="bg-gray-100 dark:bg-gray-900 py-4 px-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Customer Management</h1>
          </header>
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            <div className="col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-auto">
              <div className="p-4 border-b dark:border-gray-700">
                <h2 className="text-lg font-bold">Customers</h2>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)]">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`px-4 py-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      selectedCustomer?.id === customer.id
                        ? "bg-gray-100 dark:bg-gray-700"
                        : ""
                    }`}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <h3 className="text-lg font-medium">{customer.name}</h3>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-auto">
              {selectedCustomer ? (
                <div className="p-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b dark:border-gray-700 pb-4">
                    <div>
                      <h2 className="text-lg font-bold">
                        {selectedCustomer.name}
                      </h2>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h2 className="text-lg font-bold">Purchase History</h2>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                      {/* <Popover>
                    <PopoverTrigger>
                      <button>Start Date</button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        value={dateFilter.start}
                        onChange={(date) =>
                          setDateFilter({ ...dateFilter, start: date })
                        }
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger>
                      <button>End Date</button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        value={dateFilter.end}
                        onChange={(date) =>
                          setDateFilter({ ...dateFilter, end: date })
                        }
                      />
                    </PopoverContent>
                  </Popover> */}
                      <div className="grid gap-2 mt-4">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          type="date"
                          placeholder="Start Date"
                          value={dateFilter.start}
                          onChange={(e) =>
                            setDateFilter({
                              ...dateFilter,
                              start: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2 mt-4">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          type="date"
                          placeholder="End Date"
                          value={dateFilter.end}
                          onChange={(e) =>
                            setDateFilter({
                              ...dateFilter,
                              end: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2 mt-4">
                        <Label htmlFor="item-filter">Item Filter</Label>
                        <Input
                          type="text"
                          placeholder="Filter by Item"
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                        />
                      </div>
                      <Button className="mt-9" onClick={handleClearFilters}>
                        Clear Filters
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPurchases.map((purchase) => (
                          <TableRow key={purchase.id}>
                            {editingRow === purchase.id ? (
                              <>
                                <TableCell>
                                  <Input
                                     type="date"
                                     value={editData.date || ''}
                                     onChange={(e) => handleInputChange('date', e.target.value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={editData.items ? editData.items.join(", ") : ''}
                                    onChange={(e) => handleInputChange('items', e.target.value.split(", "))}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={editData.total || ''}
                                    onChange={(e) => handleInputChange('total', e.target.value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCancel}
                                  >
                                    <CheckIcon className="h-4 w-4" />
                                    <span className="sr-only">Save</span>
                                  </Button>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell>{purchase.date}</TableCell>
                                <TableCell>
                                  {purchase.items.join(", ")}
                                </TableCell>
                                <TableCell>
                                  ${purchase.total.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleEdit(purchase)}
                                  >
                                    <FilePenIcon className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}

                        {/* {filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>{purchase.date}</TableCell>
                        <TableCell>
                          {purchase.items.map((item, index) => (
                            <div key={index}>{item}</div>
                          ))}
                        </TableCell>
                        <TableCell>${purchase.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))} */}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a customer to view details
                  </p>
                </div>
              )}
            </div>
            <div className="col-span-1 lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-auto">
              {selectedCustomer && (
                <div className="p-4">
                  <h2 className="text-lg font-bold">Customer Analysis</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Total Spend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold">
                          ${totalSpend.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Purchase Frequency</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold">
                          {purchaseFrequency.toFixed(2)}/month
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Favorite Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PieChart className="aspect-square" />
                      </CardContent>
                    </Card>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-bold">Insights</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Based on the customer's purchase history, we can see that
                      they have a strong preference for certain product
                      categories. To better serve this customer, we could
                      recommend similar products or offer personalized
                      promotions in their favorite categories.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
      <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
    </svg>
  );
}

function PieChart(props) {
  return (
    <div {...props}>
      <ResponsivePie
        data={[
          { id: "Product A", value: 111 },
          { id: "Product B", value: 157 },
          { id: "Product C", value: 129 },
          { id: "Product D", value: 150 },
          { id: "Product E", value: 119 },
          { id: "Product F", value: 72 },
        ]}
        sortByValue
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        cornerRadius={0}
        padAngle={0}
        borderWidth={1}
        borderColor={"#ffffff"}
        enableArcLinkLabels={false}
        arcLabel={(d) => `${d.id}`}
        arcLabelsTextColor={"#ffffff"}
        arcLabelsRadiusOffset={0.65}
        colors={[
          "#2563eb",
          "#3b82f6",
          "#60a5fa",
          "#93c5fd",
          "#bfdbfe",
          "#dbeafe",
        ]}
        theme={{
          labels: {
            text: {
              fontSize: "14px",
            },
          },
          tooltip: {
            chip: {
              borderRadius: "9999px",
            },
            container: {
              fontSize: "12px",
              textTransform: "capitalize",
              borderRadius: "6px",
            },
          },
        }}
        role="application"
      />
    </div>
  );
}
