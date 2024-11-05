"use client";
import React, { use, useCallback, useEffect, useMemo, useState } from "react";
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
  CalendarIcon,
} from "@/components/icons/Icons";
import { ViewItem } from "@/schemas/item.schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange as DayPickerDateRange } from "react-day-picker";
import { format } from "date-fns";

const SACK_WEIGHTS = {
  bag5kg: 5,
  bag10kg: 10,
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
// Types for the incoming data
interface InventoryTurnoverData {
  itemname: string;
  stock: number;
  totalSales: number;
  turnoverRate: number;
}

interface InventoryTurnoverBarChartProps {
  data: InventoryTurnoverData[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  subValue?: number | string;
  icon: React.ElementType;
}

interface StockTurnoverRateData {
  stockTurnoverRate: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-md font-bold text-customColors-eveningSeaGreen">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{subValue}</p>
    </CardContent>
  </Card>
);

interface VolumeCardProps {
  title: string;
  volume: number;
}

const VolumeCard: React.FC<VolumeCardProps> = ({ title, volume }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-md font-bold text-customColors-eveningSeaGreen">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div>{volume} kg</div>
    </CardContent>
  </Card>
);

// Define the DateRange interface that matches react-day-picker's DateRange
interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

const useTransactionData = (
  endpoint: string,
  period: string,
  dateRange: DateRange
) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactionData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      // Set default period if it's empty
      const effectivePeriod = period || "7days"; // Use "7d" as the default period if period is empty

      // If dateRange is complete, send start and end date
      if (dateRange.from && dateRange.to) {
        params.append("startDate", dateRange.from.toISOString());
        params.append("endDate", dateRange.to.toISOString());
      } else {
        // If dateRange is incomplete, use period as fallback
        params.append("period", effectivePeriod);
      }

      const response = await fetch(`${endpoint}?${params}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      setData(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("An unknown error occurred"));
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, period, dateRange]);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchTransactionData();
    }
  }, [dateRange, fetchTransactionData]);

  useEffect(() => {
    if (!dateRange.from && !dateRange.to) {
      fetchTransactionData();
    }
  }, [period, fetchTransactionData]);

  return {
    data,
    loading,
    error,
  };
};

interface DateRangePickerProps {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  setDateRange,
}) => {
  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(selectedRange: DayPickerDateRange | undefined) => {
                setDateRange({
                  from: selectedRange?.from ?? undefined,
                  to: selectedRange?.to ?? undefined,
                });
              }}
              numberOfMonths={2}
            />
            <Button
              variant="ghost"
              className="w-full mt-2 text-red-500"
              onClick={() => setDateRange({ from: undefined, to: undefined })}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface PeriodFilterProps {
  period: string;
  setPeriod: (value: string) => void;
}

const PeriodFilter: React.FC<PeriodFilterProps> = ({ period, setPeriod }) => {
  return (
    <div>
      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger>
          <SelectValue placeholder="Select Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7days">Past 7 Days</SelectItem>
          <SelectItem value="1month">Past 1 Month</SelectItem>
          <SelectItem value="6months">Past 6 Months</SelectItem>
          <SelectItem value="1year">Past 1 Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

const formatters = {
  number: new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
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

          if (item.Item.itemtype === "bigas") {
            volume.bigasPurchase += itemWeight;
            volume.bigasMilling += itemWeight;
          } else if (item.Item.itemtype === "resico") {
            volume.resicoPurchase += itemWeight;
            volume.resicoMilling += itemWeight;
          }
        });

        volume.totalMilling = volume.bigasMilling + volume.resicoMilling;
        return volume;
      },
      {
        bigasPurchase: 0,
        resicoPurchase: 0,
        bigasMilling: 0,
        resicoMilling: 0,
        totalMilling: 0,
      }
    );
};

const calculateVolumeOfBigasPalay = (transactions: TransactionTable[]) => {
  return transactions
    .filter((transaction) => transaction)
    .reduce(
      (volume, transaction) => {
        transaction.TransactionItem.forEach((item: TransactionItem) => {
          const weightPerItem = SACK_WEIGHTS[item.sackweight] || 0;
          const itemWeight =
            item.unitofmeasurement === "weight"
              ? item.stock
              : item.stock * weightPerItem;

          if (item.Item.itemtype === "palay") {
            volume.palayPurchase += itemWeight;
          } else if (item.Item.itemtype === "bigas") {
            volume.bigasPurchase += itemWeight;
          }
        });
        return volume;
      },
      {
        palayPurchase: 0,
        bigasPurchase: 0,
      }
    );
};

export default function Dashboard() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [period, setPeriod] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      setPeriod("");
    }
  }, [dateRange]);

  useEffect(() => {
    if (period) {
      setDateRange({ from: undefined, to: undefined });
    }
  }, [period]);

  const { data: sales, loading: salesLoading } = useTransactionData(
    "/api/dashboard/customertransaction",
    period,
    dateRange
  );

  const { data: purchases, loading: purchasesLoading } = useTransactionData(
    "/api/dashboard/suppliertransaction",
    period,
    dateRange
  );
  const { data: items, loading: itemsLoading } = useTransactionData(
    "/api/dashboard/product",
    period,
    dateRange
  );

  const { data: millingPurchases, loading: millingLoading } =
    useTransactionData(
      "/api/dashboard/frommillingpurchases",
      period,
      dateRange
    );

  const { data: bigasPalayPurchases, loading: bigasPalayLoading } =
    useTransactionData("/api/dashboard/palaybigaspurchases", period, dateRange);

  // console.log("bigasPalayPurchases", bigasPalayPurchases);

  const { data: stockTurnOverRate, loading: stockTurnOverRateLoading } =
    useTransactionData("/api/dashboard/stockturnoverrate", period, dateRange);

  // console.log("stockTurnOverRate", stockTurnOverRate);

  const { data: inventoryTurnover, loading: inventoryTurnverRateLoading } =
    useTransactionData("/api/dashboard/inventoryturnover", period, dateRange);

  // console.log("inventoryTurnover", inventoryTurnover);

  const { data: stocktosaleratio, loading: stocktosaleratioLoading } =
    useTransactionData("/api/dashboard/stockstosaleratio", period, dateRange);

  console.log("stocktosaleratio", stocktosaleratio);

  const totals = useMemo(() => {
    if (!sales?.length) return null;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const totalStock = items.reduce((acc: number, item: ViewItem) => {
      if (item.unitofmeasurement === "weight") {
        return acc + item.stock;
      } else if (item.unitofmeasurement === "quantity") {
        const weightPerItem = SACK_WEIGHTS[item.sackweight || "bag25kg"] || 0;
        return acc + item.stock * weightPerItem;
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
          totalStock,
        };
      },
      {
        totalSales: 0,
        totalItemsSold: 0,
        totalTransactions: 0,
        currentMonth: { amount: 0, items: 0 },
        lastMonth: { amount: 0, items: 0 },
        totalStock: 0,
      }
    );
  }, [sales, items]);

  const averagePurchaseMillingValue = useMemo(() => {
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

  const averageNonMillingPurchaseValue = useMemo(() => {
    if (!purchases?.length) return 0;

    const nonMillingPurchases = purchases.filter(
      (purchase) => !purchase.frommilling
    );

    const totalAmount = nonMillingPurchases.reduce(
      (sum, purchase) => sum + (purchase.totalamount || 0),
      0
    );

    return nonMillingPurchases.length
      ? totalAmount / nonMillingPurchases.length
      : 0;
  }, [purchases]);

  const volume = useMemo(() => {
    if (!millingPurchases?.length) return null;
    return calculateVolume(millingPurchases);
  }, [millingPurchases]);

  const volumeOfBigasPalay = useMemo(() => {
    if (!bigasPalayPurchases?.length) return null;
    return calculateVolumeOfBigasPalay(bigasPalayPurchases);
  }, [bigasPalayPurchases]);

  // console.log("volumeOfBigasPalay", volumeOfBigasPalay);

  const stockTurnOverRateData = useMemo(() => {
    // If stockTurnOverRate is an array, return a default structure
    if (!stockTurnOverRate || Array.isArray(stockTurnOverRate)) {
      return { stockTurnoverRate: 0 }; // Provide a default value if no data or array
    }
    return stockTurnOverRate; // Use the data directly if it's valid and an object
  }, [stockTurnOverRate]);

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

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      label: "itemname",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const transactionChartConfig = {
    desktop: {
      label: "transactions",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  // Memoized chart data preparation
  const chartData = useMemo(() => {
    return inventoryTurnover.map((item) => ({
      itemname: item.itemname,
      turnoverRate: item.turnoverRate, // Ensure this is a numeric value
    }));
  }, [inventoryTurnover]);

  // Chart config: Customize colors and labels
  const chartConfig = {
    turnoverRate: {
      label: "Turnover Rate",
      color: "hsl(var(--chart-7))", // Can be changed to any valid CSS color value
    },
  };

  const stockToSalechartData =
    stocktosaleratio?.map((item) => ({
      itemname: item.itemname,
      stockToSalesRatio: item.stockToSalesRatio,
    })) || [];

  // Define chart configuration
  const stockToSalechartConfig: ChartConfig = {
    stockToSalesRatio: {
      label: "Stock to Sales Ratio",
      color: "hsl(var(--chart-1))",
    },
  };

  if (
    salesLoading ||
    purchasesLoading ||
    itemsLoading ||
    millingLoading ||
    bigasPalayLoading ||
    stockTurnOverRateLoading ||
    inventoryTurnverRateLoading ||
    stocktosaleratioLoading
  ) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 pl-12 pr-12 pt-4 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 text-customColors-eveningSeaGreen">
          Dashboard Overview
        </h2>

        <div className="flex gap-4 mb-6">
          <PeriodFilter
            period={period}
            setPeriod={(newPeriod) => {
              setPeriod(newPeriod);
              setDateRange({ from: undefined, to: undefined });
            }}
          />
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
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
            title="Stock Turnover Rate"
            value={formatters.number.format(
              stockTurnOverRateData?.stockTurnoverRate ?? 0 // Access the correct property
            )}
            subValue="Average stock turnover rate"
            icon={ShoppingCart}
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
            title="Avg. Purchase Order Value"
            value={formatters.currency.format(averageNonMillingPurchaseValue)}
            subValue={`Total POs: ${purchases?.length || 0}`}
            icon={ShoppingCart}
          />
          <StatCard
            title="Avg. Purchase Order Value From Milling"
            value={formatters.currency.format(averagePurchaseMillingValue)}
            subValue={`Total POs from Milling: ${
              purchases?.filter((p) => p.frommilling).length || 0
            }`}
            icon={ShoppingCart}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <VolumeCard
            title="Palay Purchase Volume"
            volume={volumeOfBigasPalay?.palayPurchase || 0}
          />
          <VolumeCard
            title="Bigas Purchase Volume"
            volume={volumeOfBigasPalay?.bigasPurchase || 0}
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
          <VolumeCard
            title="Total Milling Volume"
            volume={volume?.totalMilling || 0}
          />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-customColors-eveningSeaGreen">
              Inventory Levels
            </CardTitle>
            <CardDescription>
              Stock Levels of each item in inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={stocksChartConfig}
              className="w-full h-[300px] md:h-[400px]"
            >
              <BarChart data={items}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="itemname"
                  tickLine={true}
                  tickMargin={10}
                  axisLine={true}
                  tickFormatter={(value) => value.slice(0, 10)}
                />
                <YAxis tickLine={false} axisLine={false} />
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
              Showing stock levels for all items
            </div>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-customColors-eveningSeaGreen">
                Sales Performance
              </CardTitle>
              <CardDescription>Sales data graph for each item</CardDescription>
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
                    tickFormatter={(value) => value.slice(0, 3)}
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-customColors-eveningSeaGreen">
                Transaction Trend Values
              </CardTitle>
              <CardDescription>Purchase Value vs. Sales Value</CardDescription>
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
                  <XAxis
                    dataKey="name"
                    tickLine={true}
                    tickMargin={10}
                    axisLine={true}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    content={<ChartTooltipContent indicator="dashed" />}
                    cursor={false}
                  />
                  <Legend />
                  <Bar dataKey="purchases" fill="#8884d8" radius={4} />
                  <Bar dataKey="sales" fill="#82ca9d" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Turnover</CardTitle>
              <CardDescription>
                Visualizing the inventory turnover rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="w-full h-[300px] md:h-[400px]"
              >
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="itemname"
                    tickLine={true}
                    tickMargin={10}
                    axisLine={true}
                    tickFormatter={(value) => value.slice(0, 3)} // Show only the first 3 letters of each item name
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    content={<ChartTooltipContent indicator="dashed" />}
                    cursor={false}
                  />
                  <Bar
                    dataKey="turnoverRate"
                    fill={chartConfig.turnoverRate.color}
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-customColors-eveningSeaGreen">
                Stock to Sales Ratio Trend
              </CardTitle>
              <CardDescription>
                Stock-to-Sales Ratio for the selected items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={stockToSalechartConfig}
                className="w-full h-[300px] md:h-[400px]"
              >
                <LineChart
                  width={600}
                  height={300}
                  data={stockToSalechartData}
                  margin={{
                    left: 12,
                    right: 12,
                    top: 12,
                    bottom: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="itemname"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)} // Shorten the item name if needed
                  />
                  <YAxis />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Line
                    dataKey="stockToSalesRatio"
                    type="monotone"
                    stroke="hsl(var(--chart-8))" // Use the dynamic color for stock-to-sales ratio
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
