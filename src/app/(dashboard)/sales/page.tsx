"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ViewItem } from "@/schemas/item.schema";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import salesTransactionSchema, { AddSales } from "@/schemas/sales.schema";
import { AlertCircle, CheckCircle, TrashIcon } from "@/components/icons/Icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SideMenu from "@/components/sidemenu";

export default function Component() {
  const [items, setItems] = useState<ViewItem[] | null>(null);
  const [cart, setCart] = useState<
    {
      id: number;
      name: string;
      type: "bigas" | "palay" | "resico";
      sackweight: "bag25kg" | "cavan50kg";
      unitofmeasurement: "quantity" | "weight";
      price: number;
      quantity: number;
      imagepath: string;
    }[]
  >([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successItem, setSuccessItem] = useState<AddSales | null>(null);
  const [invoiceExists, setInvoiceExists] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [emptyCart, setEmptyCart] = useState(false);
  const [insufficientStock, setInsufficientStock] = useState(false);

  const form = useForm<AddSales>({
    resolver: zodResolver(salesTransactionSchema),
    defaultValues: {
      transactionid: 0,
      type: "sales",
      status: "pending",
      walkin: false,
      frommilling: false,
      taxpercentage: 0,
      Customer: {
        entityid: 0,
        name: "",
        contactnumber: "",
      },
      InvoiceNumber: {
        invoicenumberid: 0,
        invoicenumber: "",
      },
      TransactionItem: cart.map((item) => ({
        transactionitemid: 0,
        Item: {
          itemid: item.id,
          name: item.name,
          type: item.type,
          sackweight: item.sackweight,
        },
        unitofmeasurement: item.unitofmeasurement,
        measurementvalue: item.quantity,
        unitprice: item.price,
      })),
    },
  });

  useEffect(() => {
    async function getItems() {
      try {
        const response = await fetch("/api/product");
        if (response.ok) {
          const items = await response.json();
          setItems(items);
        } else {
          console.error("Error fetching items:", response.status);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    }
    getItems();
  }, []);

  const refreshItems = async () => {
    try {
      const response = await fetch("/api/product");
      if (response.ok) {
        const items = await response.json();
        setItems(items);
      } else {
        console.error("Error fetching items:", response.status);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    form.setValue(
      "TransactionItem",
      cart.map((item) => ({
        transactionitemid: 0,
        Item: {
          itemid: item.id,
          name: item.name,
          type: item.type,
          sackweight: item.sackweight,
          unitofmeasurement: item.unitofmeasurement,
        },
        unitofmeasurement: item.unitofmeasurement,
        measurementvalue: item.quantity,
        unitprice: item.price,
      }))
    );

    console.log("Cart updated:", cart);
  }, [cart, form]);

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

  useEffect(() => {
    if (showSuccess) {
      setInvoiceExists(false);
      setEmptyCart(false);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  useEffect(() => {
    if (invoiceExists) {
      const timer = setTimeout(() => {
        setInvoiceExists(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [invoiceExists]);

  useEffect(() => {
    if (emptyCart) {
      const timer = setTimeout(() => {
        setEmptyCart(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [emptyCart]);

  const addToCart = (item: ViewItem, quantity: number = 1) => {
    // Transform the item to match the cart structure
    const cartItem = {
      id: item.itemid, // Assuming itemid is the unique identifier
      name: item.name,
      price: item.unitprice,
      type: item.type,
      sackweight: item.sackweight,
      unitofmeasurement: item.unitofmeasurement,
      quantity, // Use the provided quantity here
      imagepath: item.itemimage[0]?.imagepath ?? "",
    };

    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.itemid
    );

    if (existingItemIndex > -1) {
      // Update quantity if item already exists in the cart
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity; // Increment by the specified quantity
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart([...cart, cartItem]);
    }
  };

  const removeFromCart = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const updateQuantity = (index: number, quantity: number) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = quantity;
    setCart(updatedCart);
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const checkInvoiceExists = async (invoicenumber: string) => {
    try {
      const response = await fetch(`/api/invoicenumber/${invoicenumber}`);
      if (response.ok) {
        const data = await response.json();
        return data.exists;
      } else {
        console.error("Error checking invoice number:", response.status);
        return false;
      }
    } catch (error) {
      console.error("Error checking invoice number:", error);
      return false;
    }
  };

  const handleSubmit = async (values: AddSales) => {
    if (cart.length === 0) {
      setEmptyCart(true);
      return;
    }

    const invoiceExists = await checkInvoiceExists(
      values.InvoiceNumber.invoicenumber
    );
    if (invoiceExists) {
      setInvoiceExists(true);
      setInvoiceNumber(values.InvoiceNumber.invoicenumber);
      return;
    }
    const checkItemStock = async (itemid: number, quantity: number) => {
      try {
        const response = await fetch(`/api/item/${itemid}`);
        if (response.ok) {
          const item = await response.json();
          return item.stock >= quantity;
        } else {
          console.error("Error fetching item:", response.status);
          return false;
        }
      } catch (error) {
        console.error("Error fetching item:", error);
        return false;
      }
    };

    const stockCheckPromises = cart.map((item) =>
      checkItemStock(item.id, item.quantity)
    );
    const stockCheckResults = await Promise.all(stockCheckPromises);
    const insufficientStock = stockCheckResults.some((result) => !result);
    if (insufficientStock) {
      setInsufficientStock(true);
      setTimeout(() => {
        setInsufficientStock(false);
      }, 5000);
      console.error("Insufficient stock for one or more items");
      return;
    }

    console.log("Form Values:", values);
    const formData = new FormData();

    formData.append("type", values.type);
    formData.append("status", values.status);
    formData.append("walkin", values.walkin.toString());
    formData.append("frommilling", values.frommilling.toString());
    formData.append(
      "taxpercentage",
      values.taxpercentage !== undefined ? values.taxpercentage.toString() : ""
    );

    formData.append("Entity[name]", values.Customer.name);
    formData.append(
      "Entity[contactnumber]",
      values.Customer.contactnumber ?? ""
    );

    formData.append(
      "InvoiceNumber[invoicenumber]",
      values.InvoiceNumber.invoicenumber || ""
    );

    values.TransactionItem?.forEach((item, index) => {
      formData.append(`TransactionItem[${index}][item][name]`, item.Item.name);
      formData.append(`TransactionItem[${index}][item][type]`, item.Item.type);
      formData.append(
        `TransactionItem[${index}][item][sackweight]`,
        item.Item.sackweight
      );
      formData.append(
        `TransactionItem[${index}][measurementvalue]`,
        item.measurementvalue.toString()
      );
      formData.append(
        `TransactionItem[${index}][unitprice]`,
        item.unitprice.toString()
      );
    });

    try {
      const method = "POST";
      const endpoint = "/api/sales";

      const uploadRes = await fetch(endpoint, {
        method: method,
        body: formData,
      });

      if (uploadRes.ok) {
        console.log("Sales added successfully");
        setSuccessItem(values);
        setShowSuccess(true);
        form.reset();
        setCart([]);
        refreshItems();
      } else {
        const errorText = await uploadRes.text();
        console.error("Upload failed:", errorText);
        throw new Error(errorText);
      }
    } catch (error) {
      console.error("Error adding purchase:", error);
    }
  };

  return (
    <div className="flex h-screen w-full">
      <SideMenu />
      <div className="flex-1 flex flex-col overflow-hidden">
        {showSuccess && (
          <Alert className="alert-center">
            <AlertTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Sales added successfully.
            </AlertTitle>
            <AlertDescription>
              Invoice Number {successItem?.InvoiceNumber.invoicenumber} {""}
              for {""} {successItem?.Customer.name} {""} has been successfully
              added to the system.
            </AlertDescription>
          </Alert>
        )}
        {invoiceExists && (
          <Alert className="alert-center">
            <AlertTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              Invoice Number already exists.
            </AlertTitle>
            <AlertDescription>
              Invoice Number {invoiceNumber} already exists in the system.
            </AlertDescription>
          </Alert>
        )}
        {emptyCart && (
          <Alert className="alert-center">
            <AlertTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              Empty Cart Detected
            </AlertTitle>
            <AlertDescription>
              Please add items to the cart before checkout.
            </AlertDescription>
          </Alert>
        )}
        {insufficientStock && (
          <Alert className="alert-center">
            <AlertTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              Insufficient Stock
            </AlertTitle>
            <AlertDescription>
              One or more items in the cart have insufficient stock.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-2 md:grid-cols-[1fr_400px]">
            <div className="flex-1 overflow-auto p-4 md:p-8">
              <div className="overflow-y-auto h-[400px] lg:h-[600px] w-auto border rounded-lg p-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                  {items &&
                    items.map((item) => (
                      <div
                        key={item.itemid}
                        className="bg-white rounded-lg shadow-sm p-4 flex flex-col"
                      >
                        <Image
                          src={item.itemimage[0]?.imagepath ?? ""}
                          alt="Product Image"
                          width={250}
                          height={250}
                          className="rounded-lg mb-4 object-cover h-32 w-32 lg:h-48 lg:w-48"
                          onClick={() => addToCart(item)}
                        />

                        <h3 className="text-lg font-semibold mb-2">
                          {item.name}
                        </h3>
                        <div className="flex flex-row justify-between">
                          <p className="text-gray-500 mb-4">
                            ₱{item.unitprice}
                          </p>
                          <p className="text-gray-500 mb-4 text-right">
                            {item.type === "bigas" ? "Rice" : "Palay"}
                          </p>
                          {item.unitofmeasurement === "quantity" && (
                            <p className="text-gray-500 mb-4 text-right">
                              {item.stock} pcs
                            </p>
                          )}
                          {item.unitofmeasurement === "weight" && (
                            <p className="text-gray-500 mb-4 text-right">
                              {item.stock} kg
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            className="px-4 py-2"
                            onClick={() => addToCart(item)}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="bg-white shadow-t md:p-2">
              <h2 className="text-xl font-bold">Sale Details</h2>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="w-full max-w-full mx-auto p-4 sm:p-6"
                >
                  <div className="grid grid-cols-2 gap-2 py-2">
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="InvoiceNumber.invoicenumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="invoicenumber">
                              Invoice Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                id="invoicenumber"
                                type="text"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="Customer.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="name">Customer Name</FormLabel>
                            <FormControl>
                              <Input {...field} id="name" type="text" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="Customer.contactnumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="contactnumber">
                              Contact Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                id="contactnumber"
                                type="text"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="status">
                              Payment Status
                            </FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                {...field}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status">
                                    {field.value}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="paid">Paid</SelectItem>
                                  <SelectItem value="cancelled">
                                    Cancelled
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="walkin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="walkin">Walk-in</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value ? "true" : "false"}
                                onValueChange={(value) => {
                                  field.onChange(value === "true");
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Value">
                                    {field.value ? "Yes" : "No"}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Yes</SelectItem>
                                  <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="taxpercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="taxpercentage">
                              Tax Percentage
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                id="taxpercentage"
                                type="number"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="mt-6 bg-gray-100 p-4 rounded-md">
                    <h2 className="text-lg font-semibold mb-2">
                      Order Summary
                    </h2>
                    <div className="overflow-y-auto h-[200px] w-auto border rounded-lg p-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cart.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min={1}
                                  value={item.quantity}
                                  className="w-14 text-right"
                                  onChange={(e) =>
                                    updateQuantity(
                                      index,
                                      parseInt(e.target.value, 10)
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                ₱{item.price.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="px-2 py-1"
                                  onClick={() => removeFromCart(index)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-semibold">
                      Total: ₱{total.toFixed(2)}
                    </p>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button type="submit" className="px-4 py-2">
                        Checkout
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
