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
  DialogTrigger,
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
import SideMenu from "@/components/sidemenu";
import { set } from "lodash";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User } from "@/interfaces/user";
import { FilePenIcon, PlusIcon, TrashIcon,  } from "@/components/icons/Icons";
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

const ROLES = {
  SALES: "sales",
  INVENTORY: "inventory",
  MANAGER: "manager",
  ADMIN: "admin",
};

export default function Component() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<ViewItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AddItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [showImage, setShowImage] = useState<ViewItem | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [alertItem, setAlertItem] = useState<ViewItem | null>(null);
  const [showAlertItem, setShowAlertItem] = useState(false);
  const [alertType, setAlertType] = useState<"reorder" | "critical" | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();

  // Filter items based on the search term
  // const filteredItems = items.filter((item) =>
  //   item.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const filteredItems = items.filter((item) => {
    // Convert searchTerm to lower case for case-insensitive comparison
    const searchTermLower = searchTerm.toLowerCase();

    // Check if item name contains the searchTerm
    const nameMatches = item.name.toLowerCase().includes(searchTermLower);

    // Check if item type matches the searchTerm
    const typeMatches = item.type.toLowerCase().includes(searchTermLower);

    // Check if sackweight and unit of measurement match the searchTerm
    const sackweightMatches = item.sackweight
      .toString()
      .includes(searchTermLower);
    const unitMatches = item.unitofmeasurement
      .toLowerCase()
      .includes(searchTermLower);

    // Return true if any of the criteria match
    return nameMatches || typeMatches || sackweightMatches || unitMatches;
  });

  const checkItemLevels = (items: ViewItem[]) => {
    items.forEach((item) => {
      if (item.stock <= item.reorderlevel) {
        setAlertItem(item);
        setAlertType("reorder");
        setShowAlertItem(true);
      } else if (item.stock <= item.criticallevel) {
        setAlertItem(item);
        setAlertType("critical");
        setShowAlertItem(true);
      }
    });
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const session = await response.json();
        setUser(session || null);
      } catch (error) {
        console.error("Failed to fetch session", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/product");
        const data = await response.json();
        setItems(data);
        checkItemLevels(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();

    const intervalId = setInterval(() => {
      fetchItems();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const form = useForm<AddItem>({
    resolver: zodResolver(item),
    defaultValues: {
      name: "",
      type: "palay",
      sackweight: "bag25kg",
      unitofmeasurement: "quantity",
      stock: 0,
      unitprice: 0,
      reorderlevel: 0,
      criticallevel: 0,
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
      sackweight: "bag25kg",
      unitofmeasurement: "quantity",
      stock: 0,
      unitprice: 0,
      reorderlevel: 0,
      criticallevel: 0,
      itemid: 0,
    });
  };

  const handleEdit = (item: ViewItem) => {
    setShowModal(true);

    form.reset({
      itemid: item.itemid,
      name: item.name,
      type: item.type,
      sackweight: item.sackweight,
      unitofmeasurement: item.unitofmeasurement,
      stock: item.stock,
      unitprice: item.unitprice,
      reorderlevel: item.reorderlevel,
      criticallevel: item.criticallevel,
      imagepath: item.itemimage[0]?.imagepath ?? "",
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedFile(undefined);

    form.reset({
      name: "",
      type: "palay",
      sackweight: "bag25kg",
      unitofmeasurement: "quantity",
      stock: 0,
      unitprice: 0,
      reorderlevel: 0,
      criticallevel: 0,
      itemid: 0,
    });
  };

  const fileRef = form.register("image");

  const handleSubmit = async (values: AddItem) => {
    console.log("Form Values:", values);
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("type", values.type);
    formData.append("sackweight", values.sackweight);
    formData.append("unitofmeasurement", values.unitofmeasurement);
    formData.append("stock", values.stock.toString());
    formData.append("unitprice", values.unitprice.toString());
    formData.append("reorderlevel", values.reorderlevel.toString());
    formData.append("criticallevel", values.criticallevel.toString());

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      let method = "POST";
      let endpoint = "/api/product";

      if (values.itemid) {
        method = "PUT";
        endpoint = `/api/product/`;
        formData.append("itemid", values.itemid.toString());
      }

      const uploadRes = await fetch(endpoint, {
        method: method,
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadResult = await uploadRes.json();
        if (values.itemid) {
          console.log("Item updated successfully");
        } else {
          console.log("Item added successfully");
        }

        if (uploadResult.itemimage && uploadResult.itemimage[0]) {
          console.log("Image uploaded:", uploadResult.itemimage[0].imagepath);
        }

        setShowModal(false);
        refreshItems();
        form.reset();
      } else {
        console.error("Upload failed", await uploadRes.text());
      }
    } catch (error) {
      console.error("Error adding/updating item:", error);
    }
  };

  // const handleDelete = async (itemid: number | undefined) => {
  //   try {
  //     const response = await fetch(`/api/product-delete/${itemid}`, {
  //       method: "DELETE",
  //     });

  //     if (response.ok) {
  //       console.log("Item deleted successfully");
  //       setShowAlert(false);
  //       setItemToDelete(null);
  //       refreshItems();
  //     } else {
  //       console.error("Error deleting item:", response.status);
  //     }
  //   } catch (error) {
  //     console.error("Error deleting item:", error);
  //   }
  // };

  const handleDelete = async (itemid: number | undefined) => {
    try {
      const response = await fetch(
        `/api/product/product-soft-delete/${itemid}`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        console.log("Item deleted successfully");
        setShowAlert(false);
        setItemToDelete(null);
        refreshItems();
      } else {
        console.error("Error deleting item:", response.status);
      }
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

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleShowImage = async (item: ViewItem) => {
    setShowImage(item);
    setShowImageModal(true);
  };

  const closeImage = () => {
    setShowImageModal(false);
    setShowImage(null);
  };

  const canAccessButton = (role: String) => {
    if (user?.role === ROLES.ADMIN) return true;
    if (user?.role === ROLES.MANAGER) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.SALES) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.INVENTORY) return role !== ROLES.ADMIN;
    return false;
  };

  if (isAuthenticated === null) {
    // Show a loading state while checking authentication
    return <p>Loading...</p>;
  }

  // if (isAuthenticated === false) {
  //   return null; // Prevent showing the page while redirecting
  // }

  // Role-based access control
  if (userRole === "admin" || userRole === "manager" || userRole === "inventory") {
    return (
      <div className="flex h-screen">
      <SideMenu />
      <div className="flex-1 overflow-y-hidden p-5">
        {showAlertItem && (
          <Alert className="alert-center" variant="destructive">
            <AlertTitle>
              {alertType === "reorder"
                ? "Reorder Level Reached"
                : "Critical Level Reached"}
            </AlertTitle>
            <AlertDescription>
              The stock level Item {alertItem?.name} Type {alertItem?.type} {""}{" "}
              {alertItem?.unitofmeasurement} has reached the{" "}
              {alertType === "reorder" ? "reorder" : "critical"} level. Please
              take necessary action.
            </AlertDescription>
          </Alert>
        )}
        <div className="p-6 md:p-8">
          <div className="flex  items-center justify-between mb-6 -mr-6">
            <h1 className="text-2xl font-bold ">Product Management</h1>
            <Button onClick={handleAddProduct}>
              {isSmallScreen ? <PlusIcon className="w-6 h-6" /> : "Add Product"}
            </Button>
          </div>
          <div>
            <Input
              type="text"
              placeholder="Search item name..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full md:w-auto mb-4"
            />
          </div>
          <div className="overflow-x-auto">
            <div className="table-container relative ">
              <ScrollArea>
                <Table
                  style={{ width: "100%" }}
                  className="min-w-[1000px]  rounded-md border-border w-full h-10 overflow-clip relative"
                  divClassname="min-h-[300px] overflow-y-scroll max-h-[400px] overflow-y-auto"
                >
                  <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Sack Weight</TableHead>
                      <TableHead>Unit of Measurement</TableHead>
                      <TableHead>Available Stocks</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      <TableHead>Critical Level</TableHead>
                      <TableHead>Last Modified by</TableHead>
                      <TableHead>Last Modified at</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.itemid}>
                        {/* <TableCell>
                        <Image
                          src={item.itemimage[0]?.imagepath ?? ""}
                          alt="Product Image"
                          width={250}
                          height={250}
                          className="rounded"
                        />
                      </TableCell> */}
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowImage(item)}
                          >
                            View Image
                          </Button>
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.sackweight}</TableCell>
                        <TableCell>{item.unitofmeasurement}</TableCell>
                        <TableCell>{item.stock}</TableCell>
                        <TableCell>{item.unitprice}</TableCell>
                        <TableCell>{item.reorderlevel}</TableCell>
                        <TableCell>{item.criticallevel}</TableCell>
                        <TableCell>
                          {item.User.firstname} {item.User.lastname}
                        </TableCell>
                        <TableCell>
                          {item.lastmodifiedat
                            ? new Date(item.lastmodifiedat).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "N/A"}
                        </TableCell>
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
                            {canAccessButton(ROLES.ADMIN) && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteItem(item)}
                                >
                                  <TrashIcon className="w-4 h-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </>
                            )}
                            {user?.role === ROLES.MANAGER && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteItem(item)}
                                >
                                  <TrashIcon className="w-4 h-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>
          <>
            {showImageModal && showImage && (
              <Dialog open={showImageModal} onOpenChange={closeImage}>
                <DialogContent className="fixed  transform  max-w-[90%] max-h-[90%] sm:max-w-[800px] sm:max-h-[600px] p-4 bg-white rounded">
                  <div className="flex flex-col">
                    <DialogHeader className="mb-2 flex items-start">
                      <DialogTitle className="text-left flex-grow">
                        Product Image
                      </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="mb-4 text-left">
                      <p>You can click outside to close</p>
                    </DialogDescription>
                    <div className="flex-grow flex items-center justify-center overflow-hidden">
                      <div className="relative w-full h-[400px]">
                        {showImage.itemimage[0]?.imagepath ? (
                          <Image
                            src={showImage.itemimage[0].imagepath}
                            alt="Product Image"
                            fill
                            sizes="(max-width: 600px) 100vw, 50vw"
                            style={{ objectFit: "contain" }}
                            className="absolute"
                          />
                        ) : (
                          <p className="text-center">No image available</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter className="mt-4">
                      <Button onClick={closeImage}>Close</Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
          {itemToDelete && (
            <AlertDialog open={showAlert}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the item name {itemToDelete?.name} {""} which consists of
                    {itemToDelete?.unitofmeasurement}
                    {""}
                    {itemToDelete?.stock} stocks and remove their data from our
                    database.
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
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {form.getValues("itemid")
                      ? "Edit Product"
                      : "Add New Product"}
                  </DialogTitle>
                  <DialogDescription>
                    Fill out the form to{" "}
                    {form.getValues("itemid") ? "edit a" : "add a new"} product
                    to your inventory.
                  </DialogDescription>
                  <DialogClose onClick={handleCancel} />
                </DialogHeader>
                <Form {...form}>
                  <form
                    className="w-full max-w-4xl mx-auto -mt-8 p-6"
                    onSubmit={form.handleSubmit(handleSubmit)}
                  >
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 py-4">
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
                                    <SelectItem value="resico">
                                      Resico
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
                          name="sackweight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="sackweight">
                                Sack Weight
                              </FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  {...field}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Sack Weight">
                                      {field.value}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="bag25kg">
                                      Bag25kg
                                    </SelectItem>
                                    <SelectItem value="cavan50kg">
                                      Cavan50kg
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
                          name="unitofmeasurement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="unitofmeasurement">
                                Unit of Measurement
                              </FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  {...field}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Unit of Measurement">
                                      {field.value}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="quantity">
                                      Quantity
                                    </SelectItem>
                                    <SelectItem value="weight">
                                      Weight
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
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="stock">
                                Measurement Value
                              </FormLabel>
                              <FormControl>
                                <Input {...field} id="stock" type="number" />
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
                              <FormLabel htmlFor="unitprice">
                                Unit Price
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="unitprice"
                                  type="number"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="reorderlevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="reorderlevel">
                                Reorder Level
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="reorderlevel"
                                  type="number"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="criticallevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="criticallevel">
                                Critical Level
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="criticallevel"
                                  type="number"
                                />
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


