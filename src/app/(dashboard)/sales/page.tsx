"use client";

import { useEffect, useState, ChangeEvent, useRef, useCallback } from "react";
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
import { set } from "lodash";

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

export default function Sales() {
  const [items, setItems] = useState<ViewItem[] | null>(null);
  const [cart, setCart] = useState<
    {
      id: number;
      itemname: string;
      itemtype: "bigas" | "palay" | "resico";
      sackweight: "bag5kg" | "bag10kg" | "bag25kg" | "cavan50kg";
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
      transactiontype: "sales",
      status: "pending",
      walkin: false,
      frommilling: false,
      DocumentNumber: {
        documentnumberid: 0,
        documentnumber: "",
      },
      TransactionItem: cart.map((item) => ({
        transactionitemid: 0,
        Item: {
          itemid: item.id,
          itemname: item.itemname,
          itemtype: item.itemtype,
          sackweight: item.sackweight,
        },
        unitofmeasurement: item.unitofmeasurement,
        stock: item.quantity,
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
          itemname: item.itemname,
          itemtype: item.itemtype,
          sackweight: item.sackweight,
          unitofmeasurement: item.unitofmeasurement,
        },
        unitofmeasurement: item.unitofmeasurement,
        stock: item.quantity,
        unitprice: item.price,
      }))
    );
  }, [cart, form]);

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

  const addToCart = useCallback((item: ViewItem, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (cartItem) => cartItem.id === item.itemid
      );

      if (existingItemIndex > -1) {
        return prevCart.map((cartItem, index) => {
          if (index === existingItemIndex) {
            return { ...cartItem, quantity: cartItem.quantity + quantity };
          }
          return cartItem;
        });
      }

      const cartItem = {
        id: item.itemid,
        itemname: item.itemname,
        itemtype: item.itemtype,
        sackweight: item.sackweight,
        unitofmeasurement: item.unitofmeasurement,
        price: item.unitprice,
        quantity,
        imagepath: item?.imagepath ?? "",
      };

      return [...prevCart, cartItem];
    });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart.splice(index, 1);
      return updatedCart;
    });
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart[index].quantity = quantity;
      return updatedCart;
    });
  }, []);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const checkTransactionInvoice = async (invoicenumber: string) => {
    try {
      const response = await fetch(`/api/checkinvoice/${invoicenumber}`);

      if (response.ok) {
        const data = await response.json();

        if (data.exists) {
          return { exists: true };
        } else {
          return { exists: false };
        }
      } else {
        console.error("Error checking invoice number:", response.status);
        return { exists: false };
      }
    } catch (error) {
      console.error("Error checking invoice number:", error);
      return { exists: false };
    }
  };

  const handleSubmit = async (values: AddSales) => {
    if (cart.length === 0) {
      toast.error("Cart is empty", {
        description: "Please add items to the cart before checkout.",
      });
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

    const { exists } = await checkTransactionInvoice(
      values.DocumentNumber.documentnumber
    );
    if (exists && insufficientStock) {
      toast.error(
        "Invoice number already exists and item stock is insufficient",
        {
          description:
            "Please enter a different invoice number and check your item stock.",
        }
      );
      return;
    } else if (exists) {
      toast.error("Invoice number already exists", {
        description: "Please enter a different invoice number.",
      });
      return;
    } else if (insufficientStock) {
      toast.error("item stock is insufficient", {
        description:
          "Please enter a different invoice number and check your item stock.",
      });
    } else {
      null;
    }

    console.log("Form Values:", values);
    const formData = new FormData();

    formData.append("type", values.transactiontype);
    formData.append("status", values.status);
    formData.append("walkin", values.walkin.toString());
    formData.append("frommilling", values.frommilling.toString());

    formData.append(
      "DocumentNumber[documentnumber]",
      values.DocumentNumber.documentnumber || ""
    );

    values.TransactionItem?.forEach((item, index) => {
      formData.append(
        `TransactionItem[${index}][item][itemname]`,
        item.Item.itemname
      );
      formData.append(
        `TransactionItem[${index}][item][itemtype]`,
        item.Item.itemtype
      );
      formData.append(
        `TransactionItem[${index}][item][sackweight]`,
        item.Item.sackweight
      );
      formData.append(
        `TransactionItem[${index}][stock]`,
        item.stock.toString()
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

  const formatStock = (stock: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(stock);
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pt-4">
          <div className="grid gap-1 sm:grid-cols-[1fr_300px] lg:grid-cols-[1fr_400px]">
            <div className="flex-1 overflow-auto p-4 md:p-4">
              <div className="overflow-y-auto  h-[400px] md:h-[600px] lg:h-[600px] xl:h-[800px] w-auto border rounded-lg p-2 bg-customColors-whiteSmoke">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-4 lg:gap-4">
                  {items &&
                    items.map((item) => (
                      <div
                        key={item.itemid}
                        className="bg-customColors-offWhite rounded-lg shadow-md p-4 flex flex-col"
                        onClick={() => addToCart(item)}
                      >
                        <div className="flex items-center justify-center">
                          <Image
                            src={item?.imagepath ?? "/no-image.jpg"}
                            alt="Product Image"
                            width={250}
                            height={250}
                            className="rounded-lg mb-4 object-cover sm:h-40 sm:w-40 md:h-32 md:w-32 lg:h-56 lg:w-56"
                          />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-customColors-eveningSeaGreen">
                          {item.itemname}
                        </h3>
                        <div className="flex flex-row justify-between">
                          <p className="text-gray-500 mb-4">
                            {formatPrice(item.unitprice)}
                          </p>
                          <p className="text-gray-500 mb-4 text-right">
                            {item.itemtype === "bigas" ? "Rice" : "Palay"}
                          </p>
                          {item.unitofmeasurement === "quantity" && (
                            <p className="text-gray-500 mb-4 text-right">
                              {formatStock(item.stock)} pcs
                            </p>
                          )}
                          {item.unitofmeasurement === "weight" && (
                            <p className="text-gray-500 mb-4 text-right">
                              {formatStock(item.stock)} kg
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="bg-customColors-lightPastelGreen shadow-t pt-2 pr-2 ">
              <h2 className="text-xl font-bold text-customColors-eveningSeaGreen">
                Sale Details
              </h2>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="w-full max-w-full mx-auto pb-4 pl-4 pr-4"
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
                                <SelectTrigger className="bg-customColors-offWhite">
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
                  <div className="mt-6 bg-customColors-offWhite p-4 rounded-md">
                    <h2 className="text-lg font-semibold mb-2 text-customColors-eveningSeaGreen">
                      Order Summary
                    </h2>
                    <div className="overflow-y-auto h-[400px] w-auto border rounded-lg p-2">
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
                              <TableCell>{item.itemname}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min={1}
                                  value={item.quantity}
                                  className="w-24 text-right"
                                  onChange={(e) =>
                                    updateQuantity(
                                      index,
                                      parseInt(e.target.value, 10)
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                {formatPrice(item.price)}
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
                    <p className="text-lg font-semibold text-customColors-eveningSeaGreen">
                      Total: {formatPrice(total)}
                    </p>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button
                        type="submit"
                        className="px-4 py-2 bg-customColors-eveningSeaGreen"
                      >
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
