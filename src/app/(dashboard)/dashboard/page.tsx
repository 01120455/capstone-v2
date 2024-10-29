"use client";
import React, { useEffect, useMemo, useState } from "react";
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

// Constants
const SACK_WEIGHTS = {
  bag25kg: 25,
  cavan50kg: 50,
} as const;

const ALL_MONTHS = [
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
] as const;

// Types
type SalesChartData = {
  month: string;
  [itemName: string]: number | string;
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
interface StatCardProps {
  title: string; // Title should be a string
  value: number | string; // Value can be either a number or string
  subValue?: number | string; // subValue is optional and can be a number or string
  icon: React.ElementType; // Icon is a React component
}

// Reusable Components
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{subValue}</p>
    </CardContent>
  </Card>
);

interface VolumeCardProps {
  title: string; // Title should be a string
  volume: number; // Volume should be a number
}

const VolumeCard: React.FC<VolumeCardProps> = ({ title, volume }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div>{volume} kg</div>
    </CardContent>
  </Card>
);

// Custom Hooks
const useTransactionData = (endpoint: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(endpoint);
        const text = await response.text();
        const parsedData = JSON.parse(text);

        // Convert dates if needed
        const processedData = parsedData.map((item: any) => ({
          ...item,
          createdat: item.createdat ? new Date(item.createdat) : null,
          lastmodifiedat: item.lastmodifiedat
            ? new Date(item.lastmodifiedat)
            : null,
        }));

        setData(processedData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};

// Utility functions
const formatters = {
  number: new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }),
  currency: new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }),
};

const calculateVolume = (transactions: TransactionTable[]) => {
  return transactions
    .filter((transaction) => transaction.frommilling)
    .reduce(
      (volume, transaction) => {
        transaction.TransactionItem.forEach((item: TransactionItem) => {
          const weightPerItem = SACK_WEIGHTS[item.sackweight] || 0;
          const itemWeight =
            item.unitofmeasurement === "weight"
              ? item.stock
              : item.stock * weightPerItem;

          if (item.itemtype === "palay") {
            volume.palayPurchase += itemWeight;
          } else if (item.itemtype === "bigas") {
            volume.bigasPurchase += itemWeight;
            volume.bigasMilling += itemWeight;
          } else if (item.itemtype === "resico") {
            volume.resicoPurchase += itemWeight;
            volume.resicoMilling += itemWeight;
          }
        });
        return volume;
      },
      {
        palayPurchase: 0,
        bigasPurchase: 0,
        resicoPurchase: 0,
        bigasMilling: 0,
        resicoMilling: 0,
      }
    );
};

export default function Dashboard() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Data fetching
  const { data: sales, loading: salesLoading } = useTransactionData(
    "/api/dashboard/customertransaction"
  );
  const { data: purchases, loading: purchasesLoading } = useTransactionData(
    "/api/dashboard/suppliertransaction"
  );
  const { data: items, loading: itemsLoading } =
    useTransactionData("/api/product");
  const { data: millingPurchases, loading: millingLoading } =
    useTransactionData("/api/dashboard/frommillingpurchases");

  // Memoized calculations
  const totals = useMemo(() => {
    if (!sales?.length) return null;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Assuming you have a way to access the items stock data.
    const totalStock = items.reduce((acc: number, item: ViewItem) => {
      if (item.unitofmeasurement === "weight") {
        return acc + item.stock; // Assuming stock is already in kg
      } else if (item.unitofmeasurement === "quantity") {
        const weightPerItem = SACK_WEIGHTS[item.sackweight || "bag25kg"] || 0; // Default to bag25kg if undefined
        return acc + item.stock * weightPerItem; // Convert quantity to kg
      }
      return acc;
    }, 0);

    return sales.reduce(
      (acc, transaction) => {
        const items = transaction.TransactionItem || [];
        const transactionTotal = items.reduce(
          (sum: number, item: TransactionItem) => sum + (item.totalamount || 0),
          0
        );
        const itemCount = items.reduce(
          (sum: number, item: TransactionItem) => sum + (item.stock || 0),
          0
        );

        return {
          totalSales: acc.totalSales + transactionTotal,
          totalItemsSold: acc.totalItemsSold + itemCount,
          totalTransactions: acc.totalTransactions + 1,
          currentMonth: {
            amount:
              acc.currentMonth.amount +
              (transaction.createdat >= currentMonthStart
                ? transactionTotal
                : 0),
            items:
              acc.currentMonth.items +
              (transaction.createdat >= currentMonthStart ? itemCount : 0),
          },
          lastMonth: {
            amount:
              acc.lastMonth.amount +
              (transaction.createdat >= lastMonthStart &&
              transaction.createdat <= lastMonthEnd
                ? transactionTotal
                : 0),
            items:
              acc.lastMonth.items +
              (transaction.createdat >= lastMonthStart &&
              transaction.createdat <= lastMonthEnd
                ? itemCount
                : 0),
          },
          totalStock, // Add totalStock to the return object
        };
      },
      {
        totalSales: 0,
        totalItemsSold: 0,
        totalTransactions: 0,
        currentMonth: { amount: 0, items: 0 },
        lastMonth: { amount: 0, items: 0 },
        totalStock: 0, // Initialize totalStock
      }
    );
  }, [sales, items]); // Ensure items are included in the dependency array

  const averagePurchaseValue = useMemo(() => {
    if (!purchases?.length) return 0;
    const fromMillingPurchases = purchases.filter(
      (purchase) => purchase.frommilling
    );
    const totalAmount = fromMillingPurchases.reduce(
      (sum, purchase) => sum + (purchase.totalamount || 0),
      0
    );
    return fromMillingPurchases.length
      ? totalAmount / fromMillingPurchases.length
      : 0;
  }, [purchases]);

  const volume = useMemo(() => {
    if (!millingPurchases?.length) return null;
    return calculateVolume(millingPurchases);
  }, [millingPurchases]);

  const { salesChartData, itemNames } = useMemo(() => {
    if (!sales?.length) return { salesChartData: [], itemNames: [] };

    const itemNamesSet = new Set<string>();
    const salesByMonth: Record<string, Record<string, number>> = {};

    sales.forEach((sale) => {
      const month = new Date(sale.createdat).toLocaleString("default", {
        month: "long",
      });
      if (!salesByMonth[month]) salesByMonth[month] = {};

      sale.TransactionItem.forEach((item: TransactionItem) => {
        if (item.Item?.itemname) {
          itemNamesSet.add(item.Item.itemname);
          salesByMonth[month][item.Item.itemname] =
            (salesByMonth[month][item.Item.itemname] || 0) + (item.stock || 1);
        }
      });
    });

    const chartData = ALL_MONTHS.map((month) => ({
      month,
      ...Array.from(itemNamesSet).reduce(
        (acc, name) => ({
          ...acc,
          [name]: salesByMonth[month]?.[name] || 0,
        }),
        {}
      ),
    }));

    return {
      salesChartData: chartData,
      itemNames: Array.from(itemNamesSet),
    };
  }, [sales]);

  const transactionData = useMemo(() => {
    if (!sales?.length && !purchases?.length) return [];

    const combinedData = ALL_MONTHS.map((month) => {
      const salesAmount = sales
        .filter(
          (s) =>
            new Date(s.createdat).toLocaleString("default", {
              month: "long",
            }) === month
        )
        .reduce((sum, s) => sum + (s.totalamount || 0), 0);

      const purchasesAmount = purchases
        .filter(
          (p) =>
            new Date(p.createdat).toLocaleString("default", {
              month: "long",
            }) === month
        )
        .reduce((sum, p) => sum + (p.totalamount || 0), 0);

      return {
        name: month,
        sales: salesAmount,
        purchases: purchasesAmount,
      };
    });

    return combinedData;
  }, [sales, purchases]);

  // Screen size effect
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Loading state
  if (salesLoading || purchasesLoading || itemsLoading || millingLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // Chart configurations
  const salesChartConfig: ChartConfig = {
    month: { label: "Month", color: "var(--chart-0)" },
    ...itemNames.reduce(
      (acc, name, index) => ({
        ...acc,
        [name]: {
          label: name,
          color: `hsl(var(--chart-${index + 1}))`,
        },
      }),
      {}
    ),
  };

  const stocksChartConfig = {
    desktop: {
      label: "Stock Levels",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const transactionChartConfig = {
    desktop: {
      label: "transactions",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">
        <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Inventory"
            value={`${formatters.number.format(totals?.totalStock || 0)} kg`}
            subValue={`Total Items: ${items?.length || 0}`}
            icon={Package}
          />
          <StatCard
            title="Total Sales"
            value={formatters.currency.format(totals?.totalSales || 0)}
            subValue={`Total Items Sold: ${totals?.totalItemsSold || 0}`}
            icon={WalletMoney}
          />
          <StatCard
            title="Avg. Sales Transaction Value"
            value={formatters.currency.format(
              totals?.totalSales / totals?.totalTransactions || 0
            )}
            subValue={`Total Transactions: ${totals?.totalTransactions || 0}`}
            icon={TrendingUp}
          />
          <StatCard
            title="Average Purchase Order Value From Milling"
            value={formatters.currency.format(averagePurchaseValue)}
            subValue={`Total POs from Milling: ${
              purchases?.filter((p) => p.frommilling).length || 0
            }`}
            icon={ShoppingCart}
          />
        </div>

        {/* Volume cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <VolumeCard
            title="Palay Purchase Volume"
            volume={volume?.palayPurchase || 0}
          />
          <VolumeCard
            title="Bigas Purchase Volume"
            volume={volume?.bigasPurchase || 0}
          />
          <VolumeCard
            title="Resico Purchase Volume"
            volume={volume?.resicoPurchase || 0}
          />
          <VolumeCard
            title="Bigas Milling Volume"
            volume={volume?.bigasMilling || 0}
          />
          <VolumeCard
            title="Resico Milling Volume"
            volume={volume?.resicoMilling || 0}
          />
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
              <BarChart data={items}>
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
