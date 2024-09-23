"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SideMenu from "@/components/sidemenu";
import { ViewItem } from "@/schemas/item.schema";
import Image from "next/image";
import { useForm } from "react-hook-form";
import transactionSchema, { Transaction } from "@/schemas/transaction.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { useAuth } from "../../utils/hooks/auth";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "@/components/icons/Icons";
import Link from "next/link";

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
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();

  const form = useForm<AddSales>({
    resolver: zodResolver(salesTransactionSchema),
    defaultValues: {
      transactionid: 0,
      type: "sales",
      status: "pending",
      walkin: false,
      frommilling: false,
      taxpercentage: 0,
      Entity: {
        entityid: 0,
        firstname: "",
        middlename: "",
        lastname: "",
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

  const addToCart = (item: ViewItem, quantity: number = 1) => {
    // Transform the item to match the cart structure
    const cartItem = {
      id: item.itemid, // Assuming itemid is the unique identifier
      name: item.name,
      price: item.unitprice,
      type: item.type,
      sackweight: item.sackweight,
      unitofmeasurement: item.unitofmeasurement,
      quantity,
      imagepath: item.itemimage[0]?.imagepath ?? "",
    };

    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.itemid
    );

    if (existingItemIndex > -1) {
      // Update quantity if item already exists in the cart
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
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

  // const handleSubmit = async (values: AddSales) => {
  //   console.log("Form Values:", values);
  //   const formData = new FormData();

  //   // Append general purchase data
  //   formData.append("type", values.type);
  //   formData.append("status", values.status);
  //   formData.append("walkin", values.walkin.toString());
  //   formData.append("frommilling", values.frommilling.toString());
  //   formData.append(
  //     "taxpercentage",
  //     values.taxpercentage !== undefined ? values.taxpercentage.toString() : ""
  //   );
  //   formData.append("Entity[firstname]", values.Entity.firstname);
  //   formData.append("Entity[middlename]", values.Entity.middlename ?? "");
  //   formData.append("Entity[lastname]", values.Entity.lastname);
  //   formData.append(
  //     "Entity[contactnumber]",
  //     values.Entity?.contactnumber?.toString() ?? ""
  //   );
  //   formData.append("invoicenumber", values.InvoiceNumber.invoicenumber || "");

  //   // Loop through each Transaction item and append its data
  //   values.TransactionItem !== undefined
  //     ? values.TransactionItem.forEach((item, index) => {
  //         formData.append(
  //           `TransactionItem[${index}][item][name]`,
  //           item.Item.name
  //         );
  //         formData.append(
  //           `TransactionItem[${index}][item][type]`,
  //           item.Item.type
  //         );
  //         formData.append(
  //           `TransactionItem[${index}][item][sackweight]`,
  //           item.Item.sackweight
  //         );
  //         formData.append(
  //           `TransactionItem[${index}][unitofmeasurement]`,
  //           item?.unitofmeasurement?.toString() ?? ""
  //         );
  //         formData.append(
  //           `TransactionItem[${index}][measurementvalue]`,
  //           item.measurementvalue.toString()
  //         );
  //         formData.append(
  //           `TransactionItem[${index}][unitprice]`,
  //           item.unitprice.toString()
  //         );
  //       })
  //     : null;

  //   try {
  //     let method = "POST";
  //     let endpoint = "/api/sales";

  //     if (values.transactionid) {
  //       method = "PUT";
  //       endpoint = `/api/purchase/purchaseedit/${values.transactionid}`;
  //       formData.append("transactionid", values.transactionid.toString());
  //     }

  //     const uploadRes = await fetch(endpoint, {
  //       method: method,
  //       body: formData,
  //     });

  //     if (uploadRes.ok) {
  //       if (values.transactionid) {
  //         console.log("Purchase updated successfully");
  //       } else {
  //         console.log("Purchase added successfully");
  //       }
  //       form.reset();
  //     } else {
  //       console.error("Upload failed", await uploadRes.text());
  //     }
  //   } catch (error) {
  //     console.error("Error adding/updating purchase:", error);
  //   }
  // };

  const handleSubmit = async (values: AddSales) => {
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

    formData.append("Entity[firstname]", values.Entity.firstname);
    formData.append("Entity[middlename]", values.Entity.middlename ?? "");
    formData.append("Entity[lastname]", values.Entity.lastname);
    formData.append("Entity[contactnumber]", values.Entity.contactnumber ?? "");

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
        console.log("Purchase added successfully");
        form.reset(); 
        setCart([]);
      } else {
        const errorText = await uploadRes.text();
        console.error("Upload failed:", errorText);
      }
    } catch (error) {
      console.error("Error adding purchase:", error);
    }
  };

  if (isAuthenticated === null) {
    return <p>Loading...</p>;
  }

  // if (isAuthenticated === false) {
  //   return null; // Prevent showing the page while redirecting
  // }

  if (userRole === "admin" || userRole === "manager" || userRole === "sales") {
    return (
      <div className="flex h-screen">
        <SideMenu />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid gap-6 md:grid-cols-[1fr_600px]">
              <div className="flex-1 overflow-auto p-4 md:p-8">
                <div className="overflow-y-auto h-[750px] border rounded-lg p-2">
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
                          />
                          <h3 className="text-lg font-semibold mb-2">
                            {item.name}
                          </h3>
                          <p className="text-gray-500 mb-4">
                            ₱{item.unitprice}
                          </p>
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

              {/* Cart Section */}
              <div className="bg-white shadow-t md:p-8">
                <h2 className="text-xl font-bold">Sale Details</h2>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="w-full max-w-full mx-auto p-4 sm:p-6"
                  >
                    <div className="grid grid-cols-2 gap-2 py-2">
                      {/* Invoice Number */}
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
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="Entity.firstname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="firstname">
                                Supplier First Name
                              </FormLabel>
                              <FormControl>
                                <Input {...field} id="firstname" type="text" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="Entity.middlename"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="middlename">
                                Supplier Middle Name
                              </FormLabel>
                              <FormControl>
                                <Input {...field} id="middlename" type="text" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="Entity.lastname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="lastname">
                                Supplier Last Name
                              </FormLabel>
                              <FormControl>
                                <Input {...field} id="lastname" type="text" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="Entity.contactnumber"
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
                    {/* Cart Details */}
                    <div className="mt-6 bg-gray-100 p-4 rounded-md">
                      <h2 className="text-lg font-semibold mb-2">
                        Order Summary
                      </h2>
                      <div className="overflow-y-auto h-[200px] border rounded-lg p-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead className="text-right">
                                Price
                              </TableHead>
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
                                    className="w-20 text-right"
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
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Total and Checkout */}
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-lg font-semibold">
                        Total: ₱{total.toFixed(2)}
                      </p>
                      <Button type="submit" className="px-4 py-2">
                        Checkout
                      </Button>
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
