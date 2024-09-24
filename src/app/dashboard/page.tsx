"use client";
import React, { useEffect, useState } from "react";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
  CardFooter,
} from "@/components/ui/card";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import SideMenu from "@/components/sidemenu";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/hooks/auth";
import { AlertCircle } from "@/components/icons/Icons";
import Link from "next/link";
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

interface SalesData {
  totalSales: number;
  quantitySold: number;
}

interface AggregatedSales {
  [key: string]: SalesData;
}

export default function Dashboard() {
  const [purchases, setPurchases] = useState<TransactionTable[]>([]);

  useEffect(() => {
    const getPurchases = async () => {
      try {
        const response = await fetch("/api/customertransaction");
        const text = await response.text();
        console.log("Raw Response Text:", text);

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

        console.log("Parsed Data with Date Conversion:", parsedData);

        console.log("Parsed Data:", parsedData);
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

  // Assuming you still need to set up a chart config
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

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();

  if (isAuthenticated === null) {
    return <p>Loading...</p>;
  }

  // if (isAuthenticated === false) {
  //   return null; // Prevent showing the page while redirecting
  // }

  if (userRole === "admin" || userRole === "manager") {
    return (
      <div className="flex h-screen">
        <SideMenu />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0 sm:mb-4">
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* <Card className="bg-[#57ab5a] text-white">
              <CardHeader>
                <CardTitle>Gross Revenue</CardTitle>
                <CardDescription className="text-white">
                  ₱100,000
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Last Month: ₱100,000</p>
              </CardContent>
            </Card> */}
            <Card className="bg-[#57a0ab] text-white">
              <CardHeader>
                <CardTitle>Gross Sale</CardTitle>
                <CardDescription className="text-white">
                  ₱100,000
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Last Month: ₱100,000</p>
              </CardContent>
            </Card>
            <Card className="bg-[#ab5757] text-white">
              <CardHeader>
                <CardTitle>Items Sold</CardTitle>
                <CardDescription className="text-white">
                  ₱100,000
                </CardDescription>
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
                    isSmallScreen && value.length > 3
                      ? value.slice(0, 4)
                      : value
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-caption-2 border border-cyan-900"
                  stroke="var(--gray-60)"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[380px]">
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
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardFooter>
      </Card>
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

// function LineChart(props: any) {
//   return (
//     <div {...props}>
//       <ResponsiveLine
//         data={[
//           {
//             id: "japan",
//             color: "hsl(142, 70%, 50%)",
//             data: [
//               {
//                 x: "plane",
//                 y: 243,
//               },
//               {
//                 x: "helicopter",
//                 y: 293,
//               },
//               {
//                 x: "boat",
//                 y: 0,
//               },
//               {
//                 x: "train",
//                 y: 168,
//               },
//               {
//                 x: "subway",
//                 y: 7,
//               },
//               {
//                 x: "bus",
//                 y: 22,
//               },
//               {
//                 x: "car",
//                 y: 29,
//               },
//               {
//                 x: "moto",
//                 y: 163,
//               },
//               {
//                 x: "bicycle",
//                 y: 112,
//               },
//               {
//                 x: "horse",
//                 y: 218,
//               },
//               {
//                 x: "skateboard",
//                 y: 159,
//               },
//               {
//                 x: "others",
//                 y: 59,
//               },
//             ],
//           },
//           {
//             id: "france",
//             color: "hsl(242, 70%, 50%)",
//             data: [
//               {
//                 x: "plane",
//                 y: 90,
//               },
//               {
//                 x: "helicopter",
//                 y: 77,
//               },
//               {
//                 x: "boat",
//                 y: 16,
//               },
//               {
//                 x: "train",
//                 y: 295,
//               },
//               {
//                 x: "subway",
//                 y: 50,
//               },
//               {
//                 x: "bus",
//                 y: 182,
//               },
//               {
//                 x: "car",
//                 y: 110,
//               },
//               {
//                 x: "moto",
//                 y: 261,
//               },
//               {
//                 x: "bicycle",
//                 y: 283,
//               },
//               {
//                 x: "horse",
//                 y: 163,
//               },
//               {
//                 x: "skateboard",
//                 y: 262,
//               },
//               {
//                 x: "others",
//                 y: 27,
//               },
//             ],
//           },
//           {
//             id: "us",
//             color: "hsl(286, 70%, 50%)",
//             data: [
//               {
//                 x: "plane",
//                 y: 186,
//               },
//               {
//                 x: "helicopter",
//                 y: 156,
//               },
//               {
//                 x: "boat",
//                 y: 201,
//               },
//               {
//                 x: "train",
//                 y: 28,
//               },
//               {
//                 x: "subway",
//                 y: 58,
//               },
//               {
//                 x: "bus",
//                 y: 50,
//               },
//               {
//                 x: "car",
//                 y: 14,
//               },
//               {
//                 x: "moto",
//                 y: 126,
//               },
//               {
//                 x: "bicycle",
//                 y: 155,
//               },
//               {
//                 x: "horse",
//                 y: 284,
//               },
//               {
//                 x: "skateboard",
//                 y: 192,
//               },
//               {
//                 x: "others",
//                 y: 14,
//               },
//             ],
//           },
//           {
//             id: "germany",
//             color: "hsl(33, 70%, 50%)",
//             data: [
//               {
//                 x: "plane",
//                 y: 15,
//               },
//               {
//                 x: "helicopter",
//                 y: 29,
//               },
//               {
//                 x: "boat",
//                 y: 0,
//               },
//               {
//                 x: "train",
//                 y: 133,
//               },
//               {
//                 x: "subway",
//                 y: 214,
//               },
//               {
//                 x: "bus",
//                 y: 193,
//               },
//               {
//                 x: "car",
//                 y: 56,
//               },
//               {
//                 x: "moto",
//                 y: 202,
//               },
//               {
//                 x: "bicycle",
//                 y: 40,
//               },
//               {
//                 x: "horse",
//                 y: 204,
//               },
//               {
//                 x: "skateboard",
//                 y: 203,
//               },
//               {
//                 x: "others",
//                 y: 112,
//               },
//             ],
//           },
//           {
//             id: "norway",
//             color: "hsl(59, 70%, 50%)",
//             data: [
//               {
//                 x: "plane",
//                 y: 29,
//               },
//               {
//                 x: "helicopter",
//                 y: 19,
//               },
//               {
//                 x: "boat",
//                 y: 271,
//               },
//               {
//                 x: "train",
//                 y: 101,
//               },
//               {
//                 x: "subway",
//                 y: 82,
//               },
//               {
//                 x: "bus",
//                 y: 62,
//               },
//               {
//                 x: "car",
//                 y: 192,
//               },
//               {
//                 x: "moto",
//                 y: 123,
//               },
//               {
//                 x: "bicycle",
//                 y: 81,
//               },
//               {
//                 x: "horse",
//                 y: 260,
//               },
//               {
//                 x: "skateboard",
//                 y: 198,
//               },
//               {
//                 x: "others",
//                 y: 171,
//               },
//             ],
//           },
//         ]}
//         margin={{ top: 10, right: 20, bottom: 40, left: 60 }}
//         xScale={{
//           type: "point",
//         }}
//         yScale={{
//           type: "linear",
//           min: "auto",
//           max: "auto",
//           stacked: true,
//           reverse: false,
//         }}
//         yFormat=" >-.2f"
//         axisTop={null}
//         axisRight={null}
//         axisBottom={{
//           tickSize: 0,
//           tickPadding: 16,
//           tickRotation: 0,
//           legend: "transportation",
//           legendOffset: 36,
//           legendPosition: "middle",
//           truncateTickAt: 0,
//         }}
//         axisLeft={{
//           tickSize: 0,
//           tickValues: 5,
//           tickPadding: 12,
//           tickRotation: 0,
//           legend: "count",
//           legendOffset: -40,
//           legendPosition: "middle",
//           truncateTickAt: 0,
//         }}
//         pointColor={{ theme: "background" }}
//         pointBorderWidth={2}
//         pointBorderColor={{ from: "serieColor" }}
//         pointLabelYOffset={-12}
//         enableTouchCrosshair={true}
//         pointSize={6}
//         useMesh={true}
//         legends={[
//           {
//             anchor: "right",
//             direction: "column",
//             justify: false,
//             translateX: 100,
//             translateY: 0,
//             itemsSpacing: 0,
//             itemDirection: "left-to-right",
//             itemWidth: 80,
//             itemHeight: 20,
//             itemOpacity: 0.75,
//             symbolSize: 12,
//             symbolShape: "circle",
//             symbolBorderColor: "rgba(0, 0, 0, .5)",
//             effects: [
//               {
//                 on: "hover",
//                 style: {
//                   itemBackground: "rgba(0, 0, 0, .03)",
//                   itemOpacity: 1,
//                 },
//               },
//             ],
//           },
//         ]}
//         gridYValues={6}
//         theme={{
//           tooltip: {
//             chip: {
//               borderRadius: "9999px",
//             },
//             container: {
//               fontSize: "12px",
//               textTransform: "capitalize",
//               borderRadius: "6px",
//             },
//           },
//           grid: {
//             line: {
//               stroke: "#f3f4f6",
//             },
//           },
//         }}
//         role="application"
//       />
//     </div>
//   );
// }

function CalendarIcon(props: any) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

export { Dashboard };
