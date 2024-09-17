"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SideMenu from "@/components/sidemenu";
import { ViewItem } from "@/schemas/item.schema";
import Image from "next/image";

export default function Component() {
  const [items, setItems] = useState<ViewItem[] | null>(null);
  const [cart, setCart] = useState<
    {
      id: number;
      name: string;
      price: number;
      quantity: number;
      imagepath: string;
    }[]
  >([]);

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

  const addToCart = (item: ViewItem, quantity: number = 1) => {
    // Transform the item to match the cart structure
    const cartItem = {
      id: item.itemid, // Assuming itemid is the unique identifier
      name: item.name,
      price: item.unitprice,
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

  return (
    <div className="flex h-screen">
      <SideMenu />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col h-screen">
          <header className="bg-white shadow-sm p-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Point of Sale</h1>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-8">
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
                      className="rounded-lg mb-4 object-cover h-52 w-52"
                    />
                    <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                    <p className="text-gray-500 mb-4">₱{item.unitprice}</p>
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
          <div className="bg-white shadow-t p-4 md:p-8">
            <h2 className="text-xl font-bold mb-4">Cart</h2>
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-gray-100 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={item.imagepath}
                      alt={item.name}
                      width={160}
                      height={160}
                      className="rounded-lg object-cover h-32 lg:w-32"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-gray-500">₱{item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      className="w-20 text-right"
                      onChange={(e) =>
                        updateQuantity(index, parseInt(e.target.value, 10))
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-2 py-1"
                      onClick={() => removeFromCart(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-lg font-semibold">
                Total: ${total.toFixed(2)}
              </p>
              <Button className="px-4 py-2">Checkout</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
