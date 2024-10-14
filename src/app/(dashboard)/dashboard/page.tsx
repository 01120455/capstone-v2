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
// import Layout from "@/components/layout";
import SideMenu from "@/components/sidemenu";

interface SalesData {
  totalSales: number;
  quantitySold: number;
}

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

  const salesData = purchases.reduce((acc, purchase) => {
    purchase.TransactionItem.forEach((item) => {
      const itemName = item.Item?.name;
      const quantitySold = item.measurementvalue || 1;
      const amount = item.totalamount || 0;

      if (itemName) {
        acc[itemName] = acc[itemName] || { quantitySold: 0, totalSales: 0 };
        acc[itemName].quantitySold += quantitySold;
        acc[itemName].totalSales += amount;
      }
    });

    return acc;
  }, {} as Record<string, { quantitySold: number; totalSales: number }>);

  const chartData = Object.entries(salesData).map(
    ([name, { quantitySold, totalSales }]) => ({
      name,
      quantitySold,
      totalSales,
    })
  );

  console.log("Sales Data:", chartData);

  const chartConfig: ChartConfig = chartData.reduce(
    (acc, { name, quantitySold, totalSales }, index) => {
      (acc[name] = {
        label: name,
        color: `hsl(var(--chart-${index + 1}))`,
      }),
        (acc["quantitySold"] = {
          label: "Quantity Sold",
          color: "hsl(var(--chart-1))",
        }),
        (acc["totalSales"] = {
          label: "TotalSales",
          color: "hsl(var(--chart-2))",
        });
      return acc;
    },
    {} as ChartConfig
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    // Set initial value on mount
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup function to remove event listener on unmount
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
          {/* <LineChart className="w-full h-[300px]" /> */}
          <ChartContainer
            config={chartConfig}
            className="w-full h-[300px] md:h-[400px]"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12, top: 20, bottom: 20 }}
            >
              <CartesianGrid vertical={false} />

              {/* Configure the XAxis */}
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  isSmallScreen && value.length > 3 ? value.slice(0, 4) : value
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-caption-2 border border-cyan-900"
                stroke="var(--gray-60)"
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                dataKey="quantitySold"
                data={chartData}
                type="monotone"
                stroke="var(--color-quantitySold)"
                strokeWidth={2}
                dot={false}
              />
              {/* <Line
                  dataKey="totalSales"
                  type="monotone"
                  stroke="var(--color-totalSales)"
                  strokeWidth={2}
                  dot={false}
                /> */}
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
