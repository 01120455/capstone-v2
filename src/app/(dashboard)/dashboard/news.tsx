const salesData = purchases.reduce((acc, purchase) => {
  const purchaseDate = new Date(purchase.createdat);
  const month = purchaseDate.toLocaleString("default", { month: "long" });

  purchase.TransactionItem.forEach((item) => {
    const itemName = item.Item?.name;
    const quantitySold = item.measurementvalue || 1; // Default to 1 if measurement value is not provided

    if (itemName) {
      acc[itemName] = acc[itemName] || {};
      acc[itemName][month] = (acc[itemName][month] || 0) + quantitySold;
    }
  });

  return acc;
}, {} as Record<string, Record<string, number>>);

// Log the salesData to see the new structure
console.log("Sales Data Structure:", salesData);

// Month names

const chartData: ChartData[] = [
  {
    month: "January",
    ...Object.keys(salesData).reduce((acc, itemName) => {
      acc[itemName] = salesData[itemName]?.["January"] || 0; // Sum sales for January
      return acc;
    }, {} as Record<string, number>),
  },
  {
    month: "February",
    ...Object.keys(salesData).reduce((acc, itemName) => {
      acc[itemName] = salesData[itemName]?.["February"] || 0; // Sum sales for February
      return acc;
    }, {} as Record<string, number>),
  },
  {
    month: "March",
    ...Object.keys(salesData).reduce((acc, itemName) => {
      acc[itemName] = salesData[itemName]?.["March"] || 0; // Sum sales for March
      return acc;
    }, {} as Record<string, number>),
  },
  // Continue this for other months...
  {
    month: "April",
    ...Object.keys(salesData).reduce((acc, itemName) => {
      acc[itemName] = salesData[itemName]?.["April"] || 0;
      return acc;
    }, {} as Record<string, number>),
  },
  {
    month: "May",
    ...Object.keys(salesData).reduce((acc, itemName) => {
      acc[itemName] = salesData[itemName]?.["May"] || 0;
      return acc;
    }, {} as Record<string, number>),
  },
  {
    month: "June",
    ...Object.keys(salesData).reduce((acc, itemName) => {
      acc[itemName] = salesData[itemName]?.["June"] || 0;
      return acc;
    }, {} as Record<string, number>),
  },
  {
    month: "July",
    ...Object.keys(salesData).reduce((acc, itemName) => {
      acc[itemName] = salesData[itemName]?.["July"] || 0;
      return acc;
    }, {} as Record<string, number>),
  },
  {
    month: "August",
    ...Object.keys(salesData).reduce((acc, itemName) => {
      acc[itemName] = salesData[itemName]?.["August"] || 0;
      return acc;
    }, {} as Record<string, number>),
  },
  {
    month: "September",
    ...Object.keys(salesData).reduce((acc, itemName) => {
      acc[itemName] = salesData[itemName]?.["September"] || 0;
      return acc;
    }, {} as Record<string, number>),
  },
  {
    month: "October",
    ...Object.keys(salesData).reduce((acc, itemName) => {
      acc[itemName] = salesData[itemName]?.["October"] || 0;
      return acc;
    }, {} as Record<string, number>),
  },
  {
    month: "November",
    ...Object.keys(salesData).reduce((acc, itemName) => {
      acc[itemName] = salesData[itemName]?.["November"] || 0;
      return acc;
    }, {} as Record<string, number>),
  },
  {
    month: "December",
    ...Object.keys(salesData).reduce((acc, itemName) => {
      acc[itemName] = salesData[itemName]?.["December"] || 0;
      return acc;
    }, {} as Record<string, number>),
  },
];

// Check output
console.log("Chart Data:", chartData);

// Check output
console.log("Sales Data Structure:", salesData);

// Create chartConfig for lines
const chartConfig: ChartConfig = Object.keys(salesData).reduce<ChartConfig>(
  (acc, itemName, index) => {
    acc[itemName] = {
      label: itemName,
      color: `hsl(var(--chart-${index + 1}))`, // Ensure this is a string
    };
    return acc;
  },
  {
    month: { label: "Month", color: "var(--chart-0)" }, // X-axis
  }
);
