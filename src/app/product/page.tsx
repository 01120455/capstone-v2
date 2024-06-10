"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function Component() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([
    {
      id: 1,
      image: "/placeholder.svg",
      name: "Acme Desk Lamp",
      description: "Adjustable LED desk lamp",
      category: "Lighting",
      price: 49.99,
      inStock: 25,
    },
    {
      id: 2,
      image: "/placeholder.svg",
      name: "Ergonomic Office Chair",
      description: "Comfortable and supportive office chair",
      category: "Furniture",
      price: 199.99,
      inStock: 12,
    },
    {
      id: 3,
      image: "/placeholder.svg",
      name: "Wireless Keyboard",
      description: "Bluetooth keyboard with rechargeable battery",
      category: "Electronics",
      price: 59.99,
      inStock: 35,
    },
    {
      id: 4,
      image: "/placeholder.svg",
      name: "Bamboo Cutting Board",
      description: "Durable and eco-friendly cutting board",
      category: "Kitchen",
      price: 24.99,
      inStock: 18,
    },
  ]);
  const handleAddProduct = (newProduct) => {
    setProducts([...products, newProduct]);
    setIsModalOpen(false);
  };
  const handleDeleteProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id));
  };
  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add Product</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>In Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src="/next.svg"
                    alt={product.name}
                    width={64}
                    height={64}
                    className="rounded"
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.inStock}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <FilePenIcon className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          {/* <Button>Add Product</Button> */}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill out the form to add a new product to your inventory.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newProduct = {
                id: products.length + 1,
                image: formData.get("image") || "/placeholder.svg",
                name: formData.get("name"),
                description: formData.get("description"),
                category: formData.get("category"),
                price: parseFloat(formData.get("price")),
                inStock: parseInt(formData.get("inStock")),
              };
              handleAddProduct(newProduct);
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Label htmlFor="image" className="md:col-span-1">
                  Image
                </Label>
                <div className="md:col-span-3">
                  <Input type="file" id="image" name="image" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Label htmlFor="name" className="md:col-span-1">
                  Name
                </Label>
                <div className="md:col-span-3">
                  <Input type="text" id="name" name="name" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Label htmlFor="description" className="md:col-span-1">
                  Description
                </Label>
                <div className="md:col-span-3">
                  <Textarea id="description" name="description" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Label htmlFor="category" className="md:col-span-1">
                  Category
                </Label>
                <div className="md:col-span-3">
                  <Select id="category" name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lighting">Lighting</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Kitchen">Kitchen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Label htmlFor="price" className="md:col-span-1">
                  Price
                </Label>
                <div className="md:col-span-3">
                  <Input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Label htmlFor="inStock" className="md:col-span-1">
                  In Stock
                </Label>
                <div className="md:col-span-3">
                  <Input
                    type="number"
                    id="inStock"
                    name="inStock"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilePenIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
