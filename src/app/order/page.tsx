"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import SideMenu from "@/components/sidemenu";

export default function Component() {
  const [orders, setOrders] = useState([
    {
      id: 1,
      product: "Raw Material A",
      quantity: 100,
      supplier: "Acme Supplies",
      supplierContact: "555-1234",
      paymentStatus: "Pending",
      orderStatus: "Placed",
    },
    {
      id: 2,
      product: "Raw Material B",
      quantity: 50,
      supplier: "Global Goods",
      supplierContact: "555-5678",
      paymentStatus: "Paid",
      orderStatus: "Shipped",
    },
    {
      id: 3,
      product: "Raw Material C",
      quantity: 75,
      supplier: "Apex Distributors",
      supplierContact: "555-9012",
      paymentStatus: "Pending",
      orderStatus: "Placed",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newOrder, setNewOrder] = useState({
    product: "",
    quantity: 0,
    supplier: "",
    supplierContact: "",
    paymentStatus: "Pending",
    orderStatus: "Placed",
  });
  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      order.product.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);
  const handleNewOrder = (field, value) => {
    setNewOrder((prevOrder) => ({
      ...prevOrder,
      [field]: value,
    }));
  };
  const handlePlaceOrder = () => {
    setOrders((prevOrders) => [...prevOrders, newOrder]);
    setNewOrder({
      product: "",
      quantity: 0,
      supplier: "",
      supplierContact: "",
      paymentStatus: "Pending",
      orderStatus: "Placed",
    });
  };
  const handlePayOrder = (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? { ...order, paymentStatus: "Paid", orderStatus: "Shipped" }
          : order
      )
    );
  };

  const handleFinalizeOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, finalized: true } : order
      )
    );
  };
  const handlePaymentStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, paymentStatus: status } : order
      )
    );
  };
  return (
    <div className="flex h-screen">
      <SideMenu />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">Order Management</h1>
          <div className="flex flex-col items-center justify-center gap-6 p-6 ">
            <div>
              <h2 className="text-xl font-bold mb-4">New Order</h2>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Input
                    id="product"
                    value={newOrder.product}
                    onChange={(e) => handleNewOrder("product", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newOrder.quantity}
                    onChange={(e) => handleNewOrder("quantity", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={newOrder.supplier}
                    onChange={(e) => handleNewOrder("supplier", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="supplierContact">Supplier Contact</Label>
                  <Input
                    id="supplierContact"
                    value={newOrder.supplierContact}
                    onChange={(e) =>
                      handleNewOrder("supplierContact", e.target.value)
                    }
                  />
                </div>
                <Button onClick={handlePlaceOrder}>Place Order</Button>
              </form>
            </div>
          </div>
          <div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold mb-4">Current Orders</h2>
              </div>
              <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm p-6 border-2 border-gray-100">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {order.paymentStatus}
                            {order.paymentStatus === "Pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handlePaymentStatus(order.id, "Paid")
                                }
                              >
                                Mark as Paid
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {!order.finalized && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFinalizeOrder(order.id)}
                            >
                              Finalize
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4 mt-5">
              Supplier Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Acme Supplies</CardTitle>
                  <CardDescription>555-1234</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Global Goods</CardTitle>
                  <CardDescription>555-5678</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Apex Distributors</CardTitle>
                  <CardDescription>555-9012</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
