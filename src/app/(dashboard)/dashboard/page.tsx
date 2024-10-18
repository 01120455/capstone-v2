"use client";
import React, { useEffect, useState } from "react";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import { ResponsiveBar } from "@nivo/bar";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { TransactionTable } from "@/schemas/transaction.schema";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type ChartData = {
  month: string;
  [itemName: string]: number | string;
};

export default function Dashboard() {
  const [purchases, setPurchases] = useState<TransactionTable[]>([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const getPurchases = async () => {
      try {
        const response = await fetch("/api/dashboard/customertransaction");
        const text = await response.text();
        // console.log("Raw Response Text:", text);

        const data = JSON.parse(text);

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

        // console.log("Parsed Data with Date Conversion:", parsedData);

        // console.log("Parsed Data:", parsedData);
        setPurchases(parsedData);
      } catch (error) {
        console.error("Error in getPurchases:", error);
      }
    };

    getPurchases();
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

  purchases.forEach((purchase) => {
    purchase.TransactionItem.forEach((item) => {
      if (item.Item?.name) {
        allItems.add(item.Item.name);
      }
    });
  });

  const itemNames = Array.from(allItems);

  const salesData = purchases.reduce((acc, purchase) => {
    const purchaseDate = new Date(purchase.createdat);
    const month = purchaseDate.toLocaleString("default", { month: "long" });

    acc[month] = acc[month] || {};

    purchase.TransactionItem.forEach((item) => {
      const itemName = item.Item?.name;
      const quantitySold = item.measurementvalue || 1;

      if (itemName) {
        acc[month][itemName] = (acc[month][itemName] || 0) + quantitySold;
      }
    });

    return acc;
  }, {} as Record<string, Record<string, number>>);

  console.log("sales data:", salesData);

  const chartData: ChartData[] = allMonths.map((month) => {
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

  console.log("Chart Data:", chartData);

  const chartConfig: ChartConfig = {
    month: { label: "Month", color: "var(--chart-0)" },
  };

  itemNames.forEach((itemName, index) => {
    chartConfig[itemName] = {
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

  return (
    <div className="flex h-screen w-full bg-customColors-offWhite">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center space-x-4 mb-4  sm:mb-4">
          <h1 className="text-xl font-bold text-customColors-darkKnight">
            Dashboard
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-[#57a0ab] text-white">
            <CardHeader>
              <CardTitle>Gross Sale</CardTitle>
              <CardDescription className="text-white">₱100,000</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Last Month: ₱100,000</p>
            </CardContent>
          </Card>
          <Card className="bg-[#ab5757] text-white">
            <CardHeader>
              <CardTitle>Items Sold</CardTitle>
              <CardDescription className="text-white">₱100,000</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Last Month: ₱100,000</p>
            </CardContent>
          </Card>
        </div>
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Sales</h2>
          <p className="text-sm mb-4">
            Analysis of different items based on their selling performance
          </p>
          <ChartContainer
            config={chartConfig}
            className="w-full h-[300px] md:h-[400px]"
          >
            <LineChart
              data={chartData}
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

              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
        </section>
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Sales per product</h2>
          <p className="text-sm mb-4">Analysis of Sales per product</p>
          <BarChart className="w-full h-[300px]" />
        </section>
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            White Rice Varieties Sales Performance
          </h2>
          <p className="text-sm mb-4">
            Analysis of different rice varieties based on their selling
            performance
          </p>
          <BarChart className="w-full h-[300px]" />
        </section>
      </div>
    </div>
  );
}

function BarChart(props: any) {
  return (
    <div {...props}>
      <ResponsiveBar
        data={[
          { name: "Jan", count: 111 },
          { name: "Feb", count: 157 },
          { name: "Mar", count: 129 },
          { name: "Apr", count: 150 },
          { name: "May", count: 119 },
          { name: "Jun", count: 72 },
        ]}
        keys={["count"]}
        indexBy="name"
        margin={{ top: 0, right: 0, bottom: 40, left: 40 }}
        padding={0.3}
        colors={["#2563eb"]}
        axisBottom={{
          tickSize: 0,
          tickPadding: 16,
        }}
        axisLeft={{
          tickSize: 0,
          tickValues: 4,
          tickPadding: 16,
        }}
        gridYValues={4}
        theme={{
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
          grid: {
            line: {
              stroke: "#f3f4f6",
            },
          },
        }}
        tooltipLabel={({ id }) => `${id}`}
        enableLabel={false}
        role="application"
        ariaLabel="A bar chart showing data"
      />
    </div>
  );
}

export { Dashboard };
