
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ResponsivePie } from "@nivo/pie"

export default function Component() {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "555-1234",
      address: "123 Main St, Anytown USA",
      purchases: [
        { id: 1, date: "2023-05-01", items: ["Product A", "Product B"], total: 50.99 },
        { id: 2, date: "2023-03-15", items: ["Product C"], total: 19.99 },
        { id: 3, date: "2022-12-01", items: ["Product D", "Product E"], total: 75.5 },
      ],
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "555-5678",
      address: "456 Oak Rd, Somewhere City",
      purchases: [
        { id: 1, date: "2023-06-01", items: ["Product F"], total: 29.99 },
        { id: 2, date: "2023-04-20", items: ["Product G", "Product H"], total: 45.75 },
        { id: 3, date: "2022-11-10", items: ["Product I"], total: 14.99 },
      ],
    },
  ])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" })
  const [categoryFilter, setCategoryFilter] = useState("")
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer)
    setEditMode(false)
  }
//   const handleCustomerEdit = (customer) => {
//     setSelectedCustomer(customer)
//     setEditMode(true)
//   }
//   const handleCustomerSave = (updatedCustomer) => {
//     const updatedCustomers = customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
//     setCustomers(updatedCustomers)
//     setSelectedCustomer(updatedCustomer)
//     setEditMode(false)
//   }
//   const handleCustomerAdd = (newCustomer) => {
//     setCustomers([...customers, newCustomer])
//     setSelectedCustomer(newCustomer)
//     setEditMode(true)
//   }
  const filteredPurchases = selectedCustomer
    ? selectedCustomer.purchases.filter((purchase) => {
        const purchaseDate = new Date(purchase.date)
        return (
          (!dateFilter.start || purchaseDate >= new Date(dateFilter.start)) &&
          (!dateFilter.end || purchaseDate <= new Date(dateFilter.end)) &&
          (!categoryFilter || purchase.items.some((item) => item.includes(categoryFilter)))
        )
      })
    : []
  const totalSpend = filteredPurchases.reduce((total, purchase) => total + purchase.total, 0)
  const purchaseFrequency = filteredPurchases.length / (selectedCustomer?.purchases.length || 1)
  const categorySpend = filteredPurchases.reduce((categories, purchase) => {
    purchase.items.forEach((item) => {
      if (categories[item]) {
        categories[item] += purchase.total
      } else {
        categories[item] = purchase.total
      }
    })
    return categories
  }, {})
  return (
    <div className="flex flex-col h-full">
      <header className="bg-gray-100 dark:bg-gray-900 py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        {/* <Button
          onClick={() =>
            handleCustomerAdd({
              id: customers.length + 1,
              name: "",
              email: "",
              phone: "",
              address: "",
              purchases: [],
            })
          }
        >
          Add Customer
        </Button> */}
      </header>
      <div className="flex-1 grid grid-cols-3 gap-6 p-6">
        <div className="col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-bold">Customers</h2>
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className={`px-4 py-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedCustomer?.id === customer.id ? "bg-gray-100 dark:bg-gray-700" : ""
                }`}
                onClick={() => handleCustomerSelect(customer)}
              >
                <h3 className="text-lg font-medium">{customer.name}</h3>
                <p className="text-gray-500 dark:text-gray-400">{customer.email}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {selectedCustomer ? (
            <div className="p-4">
              <div className="flex items-center justify-between border-b dark:border-gray-700 pb-4">
                <div>
                  <h2 className="text-lg font-bold">{selectedCustomer.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{selectedCustomer.email}</p>
                  <p className="text-gray-500 dark:text-gray-400">{selectedCustomer.phone}</p>
                  <p className="text-gray-500 dark:text-gray-400">{selectedCustomer.address}</p>
                </div>
                {/* <div>
                  {editMode ? (
                    <Button onClick={() => handleCustomerSave(selectedCustomer)}>Save</Button>
                  ) : (
                    <Button onClick={() => handleCustomerEdit(selectedCustomer)}>Edit</Button>
                  )}
                </div> */}
              </div>
              <div className="mt-4">
                <h2 className="text-lg font-bold">Purchase History</h2>
                <div className="flex items-center gap-4 mb-4">
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                  />
                  <Input
                    type="text"
                    placeholder="Filter by Category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  />
                  <Button onClick={() => setDateFilter({ start: "", end: "" })}>Clear Filters</Button>
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
                        <TableCell>{purchase.date}</TableCell>
                        <TableCell>
                          {purchase.items.map((item, index) => (
                            <div key={index}>{item}</div>
                          ))}
                        </TableCell>
                        <TableCell>${purchase.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">Select a customer to view details</p>
            </div>
          )}
        </div>
        <div className="col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {selectedCustomer && (
            <div className="p-4">
              <h2 className="text-lg font-bold">Customer Analysis</h2>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Spend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">${totalSpend.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Purchase Frequency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">{purchaseFrequency.toFixed(2)}/month</div>
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
                  Based on the customer's purchase history, we can see that they have a strong preference for certain
                  product categories. To better serve this customer, we could recommend similar products or offer
                  personalized promotions in their favorite categories.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PieChart(props) {
  return (
    <div {...props}>
      <ResponsivePie
        data={[
          { id: "Jan", value: 111 },
          { id: "Feb", value: 157 },
          { id: "Mar", value: 129 },
          { id: "Apr", value: 150 },
          { id: "May", value: 119 },
          { id: "Jun", value: 72 },
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
        colors={["#2563eb"]}
        theme={{
          labels: {
            text: {
              fontSize: "18px",
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
  )
}