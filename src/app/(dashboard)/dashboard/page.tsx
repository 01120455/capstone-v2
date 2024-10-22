"use client";
import React, { useEffect, useState } from "react";
import {
  TransactionItem,
  TransactionTable,
} from "@/schemas/transaction.schema";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  WalletMoney,
  TrendingUp,
  ShoppingCart,
} from "@/components/icons/Icons";
import { ViewItem } from "@/schemas/item.schema";

type SalesChartData = {
  month: string;
  [itemName: string]: number | string;
};

const sackWeights = {
  bag25kg: 25, // 25 kg per bag
  cavan50kg: 50, // 50 kg per cavan
};

interface Totals {
  totalSales: number;
  totalItemsSold: number;
  totalTransactions: number;
  currentMonth: {
    amount: number;
    items: number;
  };
  lastMonth: {
    amount: number;
    items: number;
  };
}

export default function Dashboard() {
  const [sales, setSales] = useState<TransactionTable[]>([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const [totalItemsSold, setTotalItemsSold] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [avgTransactionValue, setAvgTransactionValue] = useState<number>(0);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);

  useEffect(() => {
    const getSales = async () => {
      try {
        const response = await fetch("/api/dashboard/customertransaction");
        const text = await response.text();
        // console.log("Raw Response Text:", text);

        const data = JSON.parse(text);

        const parsedData = data.map((item: any) => ({
          ...item,
          createdat: item.createdat ? new Date(item.createdat) : null,
          lastmodifiedat: item.lastmodifiedat
            ? new Date(item.lastmodifiedat)
            : null,
          taxamount: item.taxamount ? parseFloat(item.taxamount) : null,
        }));

        // console.log("Parsed Data with Date Conversion:", parsedData);

        const now = new Date();
        const currentMonthStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        const lastMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of last month

        // Calculate totals
        const totals: Totals = parsedData.reduce(
          (acc: Totals, transaction: TransactionTable) => {
            const transactionItems = transaction.TransactionItem || [];

            const transactionTotalAmount = transactionItems.reduce(
              (sum: number, item) => sum + (item.totalamount || 0),
              0
            );
            const transactionTotalItems = transactionItems.reduce(
              (sum: number, item) => sum + (item.measurementvalue || 0),
              0
            );

            // Add to total sales and items sold
            acc.totalSales += transactionTotalAmount;
            acc.totalItemsSold += transactionTotalItems;

            // Increment the total number of transactions
            acc.totalTransactions += 1; // Count each transaction

            // Current month totals
            if (transaction.createdat >= currentMonthStart) {
              acc.currentMonth.amount += transactionTotalAmount;
              acc.currentMonth.items += transactionTotalItems;
            }

            // Last month totals
            if (
              transaction.createdat >= lastMonthStart &&
              transaction.createdat <= lastMonthEnd
            ) {
              acc.lastMonth.amount += transactionTotalAmount;
              acc.lastMonth.items += transactionTotalItems;
            }

            return acc;
          },
          {
            totalSales: 0,
            totalItemsSold: 0,
            totalTransactions: 0, // Initialize total transactions
            currentMonth: { amount: 0, items: 0 },
            lastMonth: { amount: 0, items: 0 },
          }
        );

        setTotalSales(totals.totalSales); // Set the total sales state
        setTotalItemsSold(totals.totalItemsSold); // Set the total items sold state
        setTotalTransactions(totals.totalTransactions); // Set the total transactions state

        // Calculate average transaction value
        const averageTransactionValue = totals.totalTransactions
          ? totals.totalSales / totals.totalTransactions
          : 0; // Avoid division by zero
        setAvgTransactionValue(averageTransactionValue); // Set the average transaction value

        // console.log("Parsed Data:", parsedData);
        setSales(parsedData);
      } catch (error) {
        console.error("Error in getSales:", error);
      }
    };

    getSales();
  }, []);

  const allMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const allItems = new Set<string>();

  sales.forEach((sales) => {
    sales.TransactionItem.forEach((item) => {
      if (item.Item?.name) {
        allItems.add(item.Item.name);
      }
    });
  });

  const itemNames = Array.from(allItems);

  const salesData = sales.reduce((acc, sales) => {
    const salesDate = new Date(sales.createdat);
    const month = salesDate.toLocaleString("default", { month: "long" });

    acc[month] = acc[month] || {};

    sales.TransactionItem.forEach((item) => {
      const itemName = item.Item?.name;
      const quantitySold = item.measurementvalue || 1;

      if (itemName) {
        acc[month][itemName] = (acc[month][itemName] || 0) + quantitySold;
      }
    });

    return acc;
  }, {} as Record<string, Record<string, number>>);

  // console.log("sales data:", salesData);

  const salesChartData: SalesChartData[] = allMonths.map((month) => {
    const monthData = salesData[month] || {};

    const dataForMonth = itemNames.reduce((acc, itemName) => {
      acc[itemName] = monthData[itemName] || 0;
      return acc;
    }, {} as Record<string, number>);

    return {
      month,
      ...dataForMonth,
    };
  });

  // console.log("Chart Data:", salesChartData);

  const salesChartConfig: ChartConfig = {
    month: { label: "Month", color: "var(--chart-0)" },
  };

  itemNames.forEach((itemName, index) => {
    salesChartConfig[itemName] = {
      label: itemName,
      color: `hsl(var(--chart-${index + 1}))`,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [items, setItems] = useState<ViewItem[]>([]);
  const [chartData, setChartData] = useState<{ name: string; stock: number }[]>(
    []
  );
  const [totalStock, setTotalStock] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  useEffect(() => {
    async function getItems() {
      try {
        const response = await fetch("/api/product");
        if (response.ok) {
          const items: ViewItem[] = await response.json();
          setItems(items);

          // Calculate total stock
          const total = items.reduce((acc: number, item: ViewItem) => {
            if (item.unitofmeasurement === "weight") {
              return acc + item.stock; // Assuming stock is already in kg
            } else if (item.unitofmeasurement === "quantity") {
              const weightPerItem =
                sackWeights[item.sackweight || "bag25kg"] || 0; // Default to bag25kg if undefined
              return acc + item.stock * weightPerItem; // Convert quantity to kg
            }
            return acc;
          }, 0);
          setTotalStock(total);

          // Count total items (not unique, just count all)
          setTotalItems(items.length); // Total number of items in the array

          // Prepare data for the chart
          const data = items.map((item) => ({
            name: item.name,
            stock: item.stock || 0, // Default to 0 if stock is undefined
          }));
          setChartData(data);
        } else {
          console.error("Error fetching items:", response.status);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    }
    getItems();
  }, []);

  const stocksChartConfig = {
    desktop: {
      label: "Stock Levels",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const numberFormat = (price: number): string => {
    return new Intl.NumberFormat("en-PH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const [purchases, setPurchases] = useState<TransactionTable[]>([]);
  const [averagePurchaseValue, setAveragePurchaseValue] = useState(0);

  useEffect(() => {
    async function getPurchases() {
      try {
        const response = await fetch("/api/dashboard/suppliertransaction");
        if (response.ok) {
          const data = await response.json();

          setPurchases(data);

          // Calculate average purchase value for frommilling transactions
          const fromMillingPurchases = data.filter(
            (purchase: TransactionTable) => purchase.frommilling
          );
          const totalFromMillingAmount = fromMillingPurchases.reduce(
            (sum: number, purchase: TransactionTable) =>
              sum + (purchase.totalamount || 0),
            0
          );
          const average =
            fromMillingPurchases.length > 0
              ? totalFromMillingAmount / fromMillingPurchases.length
              : 0;

          setAveragePurchaseValue(average);
        } else {
          console.error("Error fetching purchase history:", response.status);
        }
      } catch (error) {
        console.error("Error fetching purchases:", error);
      }
    }
    getPurchases();
  }, []);

  const [transactionData, setTransactionData] = useState<any[]>([]);

  useEffect(() => {
    const combineData = () => {
      const salesData = sales.reduce(
        (acc: any, transaction: TransactionTable) => {
          const date = new Date(transaction.createdat).toLocaleDateString(
            "en-US",
            { month: "long", year: "numeric" }
          );
          const amount = transaction.totalamount || 0;

          if (!acc[date]) {
            acc[date] = { name: date, sales: 0, purchases: 0 };
          }
          acc[date].sales += amount;

          return acc;
        },
        {}
      );

      const purchasesData = purchases.reduce(
        (acc: any, transaction: TransactionTable) => {
          const date = new Date(transaction.createdat).toLocaleDateString(
            "en-US",
            { month: "long", year: "numeric" }
          );
          const amount = transaction.totalamount || 0;

          if (!acc[date]) {
            acc[date] = { name: date, sales: 0, purchases: 0 };
          }
          acc[date].purchases += amount;

          return acc;
        },
        {}
      );

      // Merge sales and purchases data
      const combinedData = Object.keys(salesData).map((key) => ({
        name: key,
        sales: salesData[key].sales,
        purchases: purchasesData[key] ? purchasesData[key].purchases : 0,
      }));

      setTransactionData(combinedData);
    };

    if (sales.length > 0 || purchases.length > 0) {
      combineData();
    }
  }, [sales, purchases]);

  const transactionChartConfig = {
    desktop: {
      label: "transactions",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const [transactions, setTransactions] = useState<TransactionTable[]>([]);
  const [volume, setVolume] = useState({
    palayPurchase: 0,
    bigasPurchase: 0,
    resicoPurchase: 0,
    bigasMilling: 0,
    resicoMilling: 0,
  });

  useEffect(() => {
    // Fetch transactions from your API (use your actual API here)
    fetch("/api/dashboard/frommillingpurchases") // Replace with your actual API endpoint
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);
        setTransactions(data);
        calculateVolume(data); // Calculate volumes based on fetched data
      });
  }, []);

  // console.log("Volume:", volume);

  const calculateVolume = (transactions: TransactionTable[]) => {
    const volume = {
      palayPurchase: 0,
      bigasPurchase: 0,
      resicoPurchase: 0,
      bigasMilling: 0,
      resicoMilling: 0,
    };

    transactions
      .filter((transaction) => transaction.frommilling) // Only transactions with frommilling true
      .forEach((transaction) => {
        transaction.TransactionItem.forEach((item: TransactionItem) => {
          const weightPerItem = sackWeights[item.sackweight] || 0;

          console.log(
            "Weight per item:",
            weightPerItem,
            "for sackweight:",
            item.sackweight
          );

          // Handle unit of measurement cases
          if (item.unitofmeasurement === "weight") {
            // Directly add to purchase volume if unit of measurement is weight
            if (item.type === "palay") {
              volume.palayPurchase += item.measurementvalue;
            } else if (item.type === "bigas") {
              volume.bigasPurchase += item.measurementvalue;
              volume.bigasMilling += item.measurementvalue; // Also update milling volume
            } else if (item.type === "resico") {
              volume.resicoPurchase += item.measurementvalue;
              volume.resicoMilling += item.measurementvalue; // Also update milling volume
            }
          } else if (item.unitofmeasurement === "quantity") {
            // Convert quantity to weight using sack weight for purchase volume
            if (item.type === "palay") {
              volume.palayPurchase += item.measurementvalue * weightPerItem;
            } else if (item.type === "bigas") {
              volume.bigasPurchase += item.measurementvalue * weightPerItem;
              volume.bigasMilling += item.measurementvalue * weightPerItem; // Update milling volume
            } else if (item.type === "resico") {
              volume.resicoPurchase += item.measurementvalue * weightPerItem;
              volume.resicoMilling += item.measurementvalue * weightPerItem; // Update milling volume
            }
          }
        });
      });

    setVolume(volume); // Update the state with calculated volumes
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">
        <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Inventory
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {numberFormat(totalStock)} kg
              </div>
              <p className="text-xs text-muted-foreground">
                Total Items in Inventory: {totalItems}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <WalletMoney className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(totalSales)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total Items Sold: {totalItemsSold}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Sales Transaction Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(avgTransactionValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total Transactions: {totalTransactions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Purchase Order Value From Milling
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(averagePurchaseValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total of Purchase Orders from Milling:{" "}
                {purchases.filter((p) => p.frommilling).length}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Palay Purchase Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div>{volume.palayPurchase} kg</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bigas Purchase Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div>{volume.bigasPurchase} kg</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resico Purchase Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div>{volume.resicoPurchase} kg</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bigas Milling Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div>{volume.bigasMilling} kg</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resico Milling Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div>{volume.resicoMilling} kg</div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Levels */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Inventory Levels</CardTitle>
            <CardDescription>Current Inventory Stock Levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={stocksChartConfig}
              className="w-full h-[300px] md:h-[400px]"
            >
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 10)} // Limit name length if needed
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="stock" fill="var(--color-desktop)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
              Showing current stock levels for all items
            </div>
          </CardFooter>
        </Card>

        {/* Sales Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>Sales data by item over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={salesChartConfig}
              className="w-full h-[300px] md:h-[400px]"
            >
              <LineChart
                data={salesChartData}
                margin={{ left: 12, right: 12, top: 20, bottom: 20 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                {itemNames.map((itemName, index) => (
                  <Line
                    key={itemName}
                    dataKey={itemName}
                    type="monotone"
                    stroke={`hsl(var(--chart-${index + 1}))`}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Transaction Insights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Transaction Trends</CardTitle>
            <CardDescription>Purchases vs. Sales over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={transactionChartConfig}
              className="w-full h-[300px] md:h-[400px]"
            >
              <BarChart
                width={600}
                height={300}
                data={transactionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="purchases" fill="#8884d8" />
                <Bar dataKey="sales" fill="#82ca9d" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
