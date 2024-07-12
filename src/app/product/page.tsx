"use client";

import { useEffect, useState, ChangeEvent } from "react";
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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { item, AddItem, ViewItem } from "@/schemas/item.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

export default function Component() {
  const [items, setItems] = useState<ViewItem[] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AddItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File>();

  const form = useForm<AddItem>({
    resolver: zodResolver(item),
    defaultValues: {
      name: "",
      type: "palay",
      quantity: 0,
      unitprice: 0,
      imagepath: "",
      itemid: 0,
      image: undefined,
    },
  });

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

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

  const handleAddProduct = () => {
    setShowModal(true);

    form.reset({
      name: "",
      type: "palay",
      quantity: 0,
      unitprice: 0,
      itemid: 0,
    });
  };

  const handleEdit = (item: AddItem) => {
    setShowModal(true);

    form.reset({
      itemid: item.itemid,
      name: item.name,
      type: item.type,
      quantity: item.quantity,
      unitprice: item.unitprice,
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedFile(undefined);

    form.reset({
      name: "",
      type: "palay",
      quantity: 0,
      unitprice: 0,
      itemid: 0,
    });
  };

  // const handleSubmit = async (values: AddItem) => {
  //   console.log("values", values);
  //   try {
  //     if (values.itemid) {
  //       await axios.put(`/api/product/`, values, {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });
  //     } else {
  //       await axios.post("/api/product", values, {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });
  //     }
  //     setShowModal(false);
  //     refreshItems();
  //     form.reset();

  //     console.log("Item added/updated successfully");
  //   } catch (error) {
  //     console.error("Error adding item:", error);
  //   }
  // };

  const fileRef = form.register("image");

  const handleSubmit = async (values: AddItem) => {
    console.log("Form Values:", values);
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("type", values.type);
    formData.append("quantity", values.quantity.toString());
    formData.append("unitprice", values.unitprice.toString());

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const uploadRes = await fetch("/api/product", {
        method: "POST",
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadResult = await uploadRes.json();
        console.log("Image uploaded:", uploadResult.itemimage.imagepath);

        setShowModal(false);
        refreshItems();
        form.reset();

        console.log("Item added/updated successfully");
      } else {
        console.error("Upload failed", await uploadRes.text());
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleDelete = async (itemid: string) => {
    try {
      const response = await axios.delete(`/api/product-delete/${itemid}`);
      console.log("Item deleted successfully:", response.data);
      refreshItems();
      setShowAlert(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleDeleteItem = (item: AddItem) => {
    setItemToDelete(item);
    setShowAlert(true);
  };

  const handleDeleteCancel = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    setShowAlert(false);
    setItemToDelete(null);
    form.reset();
  };

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button onClick={handleAddProduct}>Add Product</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items &&
              items.map((item, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <Image
                      src={item.itemimage[0]?.imagepath ?? ""}
                      alt="Product Image"
                      width={64}
                      height={64}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unitprice}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <FilePenIcon className="w-4 h-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item)}
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
      {itemToDelete && (
        <AlertDialog open={showAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                item {itemToDelete?.itemid} {itemToDelete?.name}{" "}
                {itemToDelete?.quantity} and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDeleteCancel}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDelete(itemToDelete.itemid)}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {showModal && (
        <Dialog open={showModal} onOpenChange={handleCancel}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {form.getValues("itemid") ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                Fill out the form to{" "}
                {form.getValues("itemid") ? "edit a" : "add a new"} product to
                your inventory.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                className="w-full max-w-4xl mx-auto p-6"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="file">Upload Image</FormLabel>
                          <FormControl>
                            <Input
                              {...fileRef}
                              id="file"
                              type="file"
                              onChange={handleImage}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="name">Name</FormLabel>
                          <FormControl>
                            <Input {...field} id="name" type="text" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="type">Type</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              {...field}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type">
                                  {field.value}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bigas">Bigas</SelectItem>
                                <SelectItem value="palay">Palay</SelectItem>
                                <SelectItem value="resico">Resico</SelectItem>
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
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="quantity">Quantity</FormLabel>
                          <FormControl>
                            <Input {...field} id="quantity" type="number" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="unitprice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="unitprice">Unit Price</FormLabel>
                          <FormControl>
                            <Input {...field} id="unitprice" type="number" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save</Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
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
