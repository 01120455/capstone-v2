"use client";

import { useEffect, useState } from "react";
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Entity } from "@/schemas/entity.schema";
import {
  TransactionItem,
  TransactionTable,
} from "@/schemas/transaction.schema";
import { AlertCircle, CheckIcon, FilePenIcon } from "@/components/icons/Icons";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useAuth } from "../../utils/hooks/auth";
import { useRouter } from "next/navigation";
import { Cell, LabelList, Pie, PieChart } from "recharts";
import Link from "next/link";
import Layout from "@/components/layout";

type CategorySpend = {
  [key: string]: number;
};

export default function Component() {
  const [customers, setCustomers] = useState<Entity[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Entity | null>(null);
  const [transactions, setTransactions] = useState<TransactionTable[]>([]);
  const [salesItems, setSalesItems] = useState<TransactionItem[] | null>(null);
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ [key: string]: any }>({});
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();

  const handleCustomerSelect = (customer: Entity) => {
    const transactionForSelectedCustomer = transactions.find(
      (transaction) => transaction.Entity.entityid === customer.entityid
    );
    if (transactionForSelectedCustomer) {
      setSelectedCustomer(customer);
    }
  };

  // useEffect(() => {
  //   if (customers.length > 0) {
  //     const testCustomer = customers.find(
  //       (customer) => customer.entityid === 4
  //     );
  //     if (testCustomer) {
  //       setSelectedCustomer(testCustomer);
  //     }
  //   }
  // }, [customers]);

  const filteredTransactions = selectedCustomer
    ? transactions
        .filter(
          (transaction) =>
            transaction.Entity.entityid === selectedCustomer.entityid
        )
        .filter((purchase) => {
          const purchaseDate = new Date(purchase.createdat);
          const itemNames = purchase.TransactionItem.map(
            (item) => item.Item?.name
          )
            .filter(Boolean)
            .join(", ")
            .toLowerCase();
          return (
            (!dateFilter.start || purchaseDate >= new Date(dateFilter.start)) &&
            (!dateFilter.end || purchaseDate <= new Date(dateFilter.end)) &&
            (!categoryFilter ||
              itemNames.includes(categoryFilter.toLowerCase()))
          );
        })
    : [];

  console.log("filteredTransactions", filteredTransactions);

  const totalSpend = filteredTransactions.reduce(
    (total, purchase) => total + (purchase.totalamount || 0),
    0
  );
  const purchaseFrequency =
    filteredTransactions.length / (transactions.length || 1);

  const categorySpend = filteredTransactions.reduce<CategorySpend>(
    (categories, purchase) => {
      purchase.TransactionItem.forEach((transactionItem) => {
        const itemType = transactionItem.Item?.type;
        if (itemType) {
          categories[itemType] =
            (categories[itemType] || 0) + (purchase.totalamount || 0);
        }
      });
      return categories;
    },
    {}
  );

  const handleClearFilters = () => {
    setDateFilter({ start: "", end: "" });
    setCategoryFilter("");
  };

  const handleEdit = (row: TransactionTable) => {
    setEditingRow(row.transactionid);
    setEditData({ ...row });
  };

  const handleInputChange = (key: string, value: any) => {
    setEditData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  useEffect(() => {
    const getSales = async () => {
      try {
        const response = await fetch("/api/customer");
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

        setCustomers(parsedData);
      } catch (error) {
        console.error("Error in getPurchases:", error);
      }
    };

    getSales();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customersResponse = await fetch("/api/customer");
        const transactionsResponse = await fetch("/api/customertransaction");

        if (!customersResponse.ok || !transactionsResponse.ok) {
          throw new Error("Network response was not ok");
        }

        const customersData = await customersResponse.json();
        const transactionsData = await transactionsResponse.json();

        console.log("Customers Data:", customersData);
        console.log("Transactions Data:", transactionsData);

        setCustomers(customersData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const itemCounts = filteredTransactions.reduce<Record<string, number>>(
    (acc, purchase) => {
      purchase.TransactionItem.forEach((item) => {
        const itemName = item.Item?.name;
        if (itemName) {
          acc[itemName] = (acc[itemName] || 0) + 1;
        }
      });
      return acc;
    },
    {}
  );

  const pieData = Object.entries(itemCounts).map(([name, value]) => ({
    item: name,
    value,
  }));

  const chartConfig: ChartConfig = pieData.reduce((acc, { item }, index) => {
    acc[item] = {
      label: item,
      color: `hsl(var(--chart-${index + 1}))`,
    };
    return acc;
  }, {} as ChartConfig);

  if (isAuthenticated === null) {
    return <p>Loading...</p>;
  }

  if (userRole === "admin" || userRole === "manager" || userRole === "sales") {
    return (
      <div className="flex h-screen">
        <Layout />
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col h-full">
            <header className="bg-gray-100 dark:bg-gray-900 py-4 px-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Customer Management</h1>
            </header>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
              <div className="col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-auto">
                <div className="p-4 border-b dark:border-gray-700">
                  <h2 className="text-lg font-bold">Customers</h2>
                </div>
                <div className="p-4 max-h-[calc(100vh-200px)]">
                  {customers.map((customer: Entity, index: number) => (
                    <div
                      key={index}
                      className={`px-4 py-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        selectedCustomer?.entityid === customer.entityid
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
                          {filteredTransactions.map(
                            (purchase: TransactionTable) => (
                              <TableRow key={purchase.transactionid}>
                                {editingRow === purchase.transactionid ? (
                                  <>
                                    <TableCell>
                                      <Input
                                        type="date"
                                        value={editData.date || ""}
                                        onChange={(e) =>
                                          handleInputChange(
                                            "date",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        value={
                                          editData.items
                                            ? editData.items.join(", ")
                                            : ""
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            "items",
                                            e.target.value.split(", ")
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        value={editData.totalamount || ""}
                                        onChange={(e) =>
                                          handleInputChange(
                                            "totalamount",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </TableCell>
                                    {/* <TableCell>
                                    <Button onClick={handleSave}>Save</Button>
                                  </TableCell> */}
                                  </>
                                ) : (
                                  <>
                                    <TableCell>
                                      {purchase.createdat
                                        ? new Date(
                                            purchase.createdat
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
                                      {purchase.TransactionItem.map(
                                        (item, index) => item.Item?.name
                                      )
                                        .filter(Boolean)
                                        .join(", ")}
                                    </TableCell>
                                    <TableCell>
                                      ${purchase.totalamount?.toFixed(2)}
                                    </TableCell>
                                    {/* <TableCell>
                                    <Button
                                      onClick={() => handleEdit(purchase)}
                                    >
                                      Edit
                                    </Button>
                                  </TableCell> */}
                                  </>
                                )}
                              </TableRow>
                            )
                          )}
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
                            ₱{totalSpend.toFixed(2)}
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
                          <ChartContainer
                            config={chartConfig}
                            className="mx-auto aspect-square max-h-[400px]"
                          >
                            <PieChart>
                              <ChartTooltip
                                content={
                                  <ChartTooltipContent
                                    nameKey="item"
                                    hideLabel
                                  />
                                }
                              />
                              <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="item"
                                cx="50%"
                                cy="50%"
                                outerRadius="80%"
                              >
                                <LabelList
                                  dataKey="item"
                                  className="fill-foreground"
                                  stroke="none"
                                  fontSize={13}
                                  formatter={(
                                    value: keyof typeof chartConfig
                                  ) => chartConfig[value]?.label}
                                />
                                {pieData.map(({ item }) => (
                                  <Cell
                                    key={item}
                                    fill={chartConfig[item]?.color}
                                  />
                                ))}
                              </Pie>
                            </PieChart>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-bold">Insights</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Based on the customer`&apos;`s purchase history, we can
                        see that they have a strong preference for certain
                        product categories. To better serve this customer, we
                        could recommend similar products or offer personalized
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

  return (
    <div className="flex h-screen">
      <div className="flex items-center justify-center w-full">
        <div className="flex justify-center">
          <Card className="w-[400px]">
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
            <CardFooter className="flex justify-between">
              <Button
                onClick={() => router.back()}
                variant="secondary"
                className="max-w-lg"
              >
                Go Back
              </Button>
              <Button asChild className="max-w-lg">
                <Link href="/login">Go to Login</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
