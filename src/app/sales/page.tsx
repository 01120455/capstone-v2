"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SideMenu from "@/components/sidemenu";

export default function Component() {
  const products = [
    {
      id: 1,
      name: "mais",
      price: 4.99,
      image: "/placeholder.svg",
    },
    {
      id: 2,
      name: "mangga",
      price: 2.99,
      image: "/placeholder.svg",
    },
    {
      id: 3,
      name: "Avocado",
      price: 6.99,
      image: "/placeholder.svg",
    },
    {
      id: 4,
      name: "Lata",
      price: 3.99,
      image: "/placeholder.svg",
    },
    {
      id: 5,
      name: "Bagang ng baka",
      price: 2.49,
      image: "/placeholder.svg",
    },
  ];
  const [cart, setCart] = useState([]);
  const addToCart = (product, quantity = 1) => {
    setCart([...cart, { ...product, quantity }]);
  };
  const removeFromCart = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };
  const updateQuantity = (index, quantity) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = quantity;
    setCart(updatedCart);
  };
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    // <div className="flex h-screen">
    //   <SideMenu />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col h-screen">
          <header className="bg-white shadow-sm p-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Point of Sale</h1>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm p-4 flex flex-col"
                >
                  <img
                    src="/placeholder.svg"
                    alt={product.name}
                    width={200}
                    height={200}
                    className="rounded-lg mb-4 object-cover"
                  />
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-500 mb-4">
                    ${product.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2">
                    {/* <Input
                  type="number"
                  min={1}
                  defaultValue={1}
                  className="w-20 text-right"
                  onChange={(e) =>
                    addToCart(product, parseInt(e.target.value, 10))
                  }
                /> */}
                    <Button
                      variant="outline"
                      className="px-4 py-2"
                      onClick={() => addToCart(product)}
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
                  key={index}
                  className="bg-gray-100 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src="/placeholder.svg"
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-gray-500">${item.price.toFixed(2)}</p>
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
    // </div>
  );
}
