"use client";

import { useEffect, useState, ChangeEvent, useRef } from "react";
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
import { TrashIcon } from "@/components/icons/Icons";
import { toast } from "sonner";

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

  const form = useForm<AddSales>({
    resolver: zodResolver(salesTransactionSchema),
    defaultValues: {
      transactionid: 0,
      type: "sales",
      status: "pending",
      walkin: false,
      frommilling: false,
      taxpercentage: 0,
      DocumentNumber: {
        documentnumberid: 0,
        documentnumber: "",
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

    // console.log("Cart updated:", cart);
  }, [cart, form]);

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

  // useEffect(() => {
  //   if (showSuccess) {
  //     setInvoiceExists(false);
  //     setEmptyCart(false);
  //     const timer = setTimeout(() => {
  //       setShowSuccess(false);
  //     }, 5000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [showSuccess]);

  // useEffect(() => {
  //   if (invoiceExists) {
  //     const timer = setTimeout(() => {
  //       setInvoiceExists(false);
  //     }, 5000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [invoiceExists]);

  // useEffect(() => {
  //   if (emptyCart) {
  //     const timer = setTimeout(() => {
  //       setEmptyCart(false);
  //     }, 5000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [emptyCart]);

  const addToCart = (item: ViewItem, quantity: number = 1) => {
    const cartItem = {
      id: item.itemid,
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
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
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
      const response = await fetch(`/api/documentnumber/${invoicenumber}`);
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
      // setEmptyCart(true);
      toast.error("Cart is empty", {
        description: "Please add items to the cart before checkout.",
      });
      return;
    }

    const invoiceExists = await checkInvoiceExists(
      values.DocumentNumber.documentnumber
    );
    // if (invoiceExists) {
    //   // setInvoiceExists(true);
    //   // setInvoiceNumber(values.InvoiceNumber.invoicenumber);
    //   // return;
    //   toast.error("Invoice number already exists", {
    //     description: "Please enter a different invoice number.",
    //   });
    // }
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
    // if (insufficientStock) {
    //   // setInsufficientStock(true);
    //   // setTimeout(() => {
    //   //   setInsufficientStock(false);
    //   // }, 5000);
    //   // console.error("Insufficient stock for one or more items");
    //   // return;
    //   toast.error("Insufficient stock for one or more items", {
    //     description: "Check your item stock and try again.",
    //   });
    // }

    if (invoiceExists && insufficientStock) {
      toast.error(
        "Invoice number already exists and item stock is insufficient",
        {
          description:
            "Please enter a different invoice number and check your item stock.",
        }
      );
    } else if (insufficientStock) {
      toast.error("Item stock is insufficient", {
        description: "Check your item stock and try again.",
      });
    } else if (invoiceExists) {
      toast.error("Invoice number already exists", {
        description: "Please enter a different invoice number.",
      });
    } else if (insufficientStock) {
      toast.error("Item stock is insufficient", {
        description: "Check your item stock and try again.",
      });
    } else if (invoiceExists) {
      toast.error("Invoice number already exists", {
        description: "Please enter a different invoice number.",
      });
    } else {
      null;
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

    formData.append(
      "DocumentNumber[documentnumber]",
      values.DocumentNumber.documentnumber || ""
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
        toast.success(
          `Sales with invoice number ${form.getValues(
            "DocumentNumber.documentnumber"
          )} has been created`,
          { description: "You have successfully added a sale." }
        );

        console.log("Sales added successfully");
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

  const [inputValue, setInputValue] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setDropdownVisible(e.target.value.length > 0); // Show dropdown if there is input
  };

  const handleItemClick = (itemName: string) => {
    setInputValue(itemName);
    setDropdownVisible(false); // Hide dropdown when an item is clicked
  };

  // Hide dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside as EventListener);
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as EventListener
      );
    };
  }, []);

  return (
    <div className="flex h-screen w-full bg-customColors-offWhite">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-2 sm:grid-cols-[1fr_300px] lg:grid-cols-[1fr_400px]">
            <div className="flex-1 overflow-auto p-4 md:p-8">
              <div className="overflow-y-auto  h-[400px] md:h-[600px] lg:h-[600px] w-auto border rounded-lg p-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4 lg:gap-8">
                  {items &&
                    items.map((item) => (
                      <div
                        key={item.itemid}
                        className="bg-white rounded-lg shadow-md p-4 flex flex-col"
                      >
                        <div className="flex items-center justify-center">
                          <Image
                            src={
                              item.itemimage[0]?.imagepath ?? "/no-image.jpg"
                            }
                            alt="Product Image"
                            width={250}
                            height={250}
                            className="rounded-lg mb-4 object-cover sm:h-40 sm:w-40 md:h-32 md:w-32 lg:h-56 lg:w-56"
                            onClick={() => addToCart(item)}
                          />
                        </div>
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
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="bg-customColors-offWhite shadow-t md:p-2">
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
                        name="DocumentNumber.documentnumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="documentnumber">
                              Invoice Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                id="documentnumber"
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
