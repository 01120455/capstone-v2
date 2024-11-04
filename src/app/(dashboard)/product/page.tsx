"use client";

import {
  useEffect,
  useState,
  ChangeEvent,
  useMemo,
  useCallback,
  useContext,
} from "react";
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
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { item, AddItem, ViewItem } from "@/schemas/item.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FilePenIcon, PlusIcon, FilterIcon } from "@/components/icons/Icons";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { userSessionContext } from "@/components/sessionContext-provider";
import { Badge } from "@/components/ui/badge";

const ROLES = {
  SALES: "sales",
  INVENTORY: "inventory",
  MANAGER: "manager",
  ADMIN: "admin",
} as const;

const ITEMS_PER_PAGE = 10;

const useFilters = () => {
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    sackweight: "",
    unitofmeasurement: "",
    active: "",
  });

  const clear = () => {
    setFilters({
      name: "",
      type: "",
      sackweight: "",
      unitofmeasurement: "",
      active: "",
    });
  };

  return {
    filters,
    setFilters,
    clear,
  };
};

const useItems = () => {
  const [items, setItems] = useState<ViewItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { filters, setFilters, clear } = useFilters();

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchItems = useCallback(
    async (page: number) => {
      if (isNaN(page) || page < 1) return;

      try {
        const params = new URLSearchParams({
          limit: ITEMS_PER_PAGE.toString(),
          page: page.toString(),
        });

        if (filters.name) {
          params.append("name", filters.name);
        }
        if (filters.type) {
          params.append("type", filters.type);
        }
        if (filters.sackweight) {
          params.append("sackweight", filters.sackweight);
        }
        if (filters.unitofmeasurement) {
          params.append("unitofmeasurement", filters.unitofmeasurement);
        }
        if (filters.active) {
          params.append("active", filters.active);
        }

        const response = await fetch(
          `/api/product/productpagination?${params}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const totalItems = await fetch(`/api/product`);

        const data = await response.json();
        setItems(data);
        const totalRowsData = await totalItems.json();
        setTotalPages(Math.ceil(totalRowsData.length / ITEMS_PER_PAGE));

        console.log("total pages: ", totalPages);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    },
    [filters]
  );

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (filters.name) {
      const timer = setTimeout(() => fetchItems(currentPage), 1000);
      setDebounceTimeout(timer);
    } else {
      fetchItems(currentPage);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [filters.name, currentPage, fetchItems]);

  const refreshItems = () => {
    setFilters({
      name: "",
      type: "",
      sackweight: "",
      unitofmeasurement: "",
      active: "",
    });
    fetchItems(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    clear();
    fetchItems(1);
  };

  return {
    items,
    currentPage,
    totalPages,
    handlePageChange,
    filters,
    setFilters,
    clearFilters,
    refreshItems,
  };
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const formatStock = (stock: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(stock);
};

export default function ProductManagement() {
  const user = useContext(userSessionContext);
  const {
    items,
    currentPage,
    totalPages,
    handlePageChange,
    filters,
    setFilters,
    clearFilters,
    refreshItems,
  } = useItems();
  const form = useForm<AddItem>({
    resolver: zodResolver(item),
    defaultValues: {
      itemname: "",
      itemtype: "bigas",
      sackweight: "bag25kg",
      status: "active",
      unitofmeasurement: "quantity",
      stock: 0,
      unitprice: 0,
      imagepath: "",
      itemid: 0,
      image: undefined,
    },
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [showImage, setShowImage] = useState<ViewItem | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const fileRef = form.register("image");

  const filteredItems = useMemo(() => {
    return items;
  }, [items]);

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

  console.log("Filtered Items: ", filteredItems);

  const handleSubmit = async (values: AddItem) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && key !== "image") {
        formData.append(key, value.toString());
      }
    });

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const method = values.itemid ? "PUT" : "POST";
      const endpoint = "/api/product";

      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to save item");

      const result = await response.json();
      const action = values.itemid ? "updated" : "added";

      toast.success(`Item ${values.itemname} has been ${action}`, {
        description: `You have successfully ${action} the item.`,
      });

      setShowModal(false);
      refreshItems();
      resetForm();
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Failed to save item");
    }
  };
  const resetForm = () => {
    form.reset();
    setSelectedFile(undefined);
  };

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, name: value }));
    handlePageChange(1);
  };

  const handleItemTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, type: value }));
    handlePageChange(1);
  };

  const handleUnitOfMeasurementChange = (value: string) => {
    setFilters((prev) => ({ ...prev, unitofmeasurement: value }));
    handlePageChange(1);
  };

  const renderFilters = () => (
    <Popover>
      <PopoverTrigger>
        <FilterIcon className="w-6 h-6" />
      </PopoverTrigger>
      <PopoverContent className="bg-customColors-offWhite rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4">Filters</h2>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
          <div className="grid gap-2">
            <span className="text-sm">Item Name</span>
            <Input
              id="name"
              type="text"
              placeholder="Search item name..."
              value={filters.name}
              onChange={handleItemNameChange}
            />
            {/* {isItemDropdownVisible && itemNameSuggestions.length > 0 && (
              <div
                ref={dropdownRefItem}
                className="absolute z-10 bg-white border border-gray-300 mt-14 w-44 max-h-60 overflow-y-auto"
              >
                {itemNameSuggestions.map((item) => (
                  <div
                    key={item}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        name: item,
                      }))
                    }
                  >
                    {item}
                  </div>
                ))}
              </div>
            )} */}
          </div>
          <div className="grid gap-2">
            <span className="text-sm">Item Type</span>
            <Select value={filters.type} onValueChange={handleItemTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Item Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="palay">Palay</SelectItem>
                <SelectItem value="bigas">Bigas</SelectItem>
                <SelectItem value="resico">Resico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <span className="text-sm">Sack Weight</span>
            <Select
              value={filters.sackweight}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, sackweight: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Sack Weight" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bag5kg">Bag5kg</SelectItem>
                <SelectItem value="bag10kg">Bag10kg</SelectItem>
                <SelectItem value="bag25kg">Bag25kg</SelectItem>
                <SelectItem value="cavan50kg">Cavan50kg</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <span className="text-sm">Unit of Measurement</span>
            <Select
              value={filters.unitofmeasurement}
              onValueChange={handleUnitOfMeasurementChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Unit of Measurement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quantity">Quantity</SelectItem>
                <SelectItem value="weight">Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <span className="text-sm">Active</span>
            <Select
              value={filters.active}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, active: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Active" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  const closeImage = () => {
    setShowImageModal(false);
    setShowImage(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedFile(undefined);

    form.reset({
      itemname: "",
      itemtype: "bigas",
      sackweight: "bag25kg",
      status: "active",
      unitofmeasurement: "quantity",
      stock: 0,
      unitprice: 0,
      itemid: 0,
    });
  };

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleShowImage = async (item: ViewItem) => {
    setShowImage(item);
    setShowImageModal(true);
  };

  const handleEdit = (item: ViewItem) => {
    setShowModal(true);

    console.log(item);

    form.reset({
      itemid: item.itemid,
      itemname: item.itemname,
      itemtype: item.itemtype,
      sackweight: item.sackweight,
      status: item.status,
      unitofmeasurement: item.unitofmeasurement,
      stock: item.stock,
      unitprice: item.unitprice,
      imagepath: item.imagepath || "",
    });
  };

  const canAccessButton = (role: string) => {
    if (!user) return false;
    if (user.role === ROLES.ADMIN) return true;
    if (user.role === ROLES.MANAGER) return role !== ROLES.ADMIN;
    return (
      [ROLES.SALES, ROLES.INVENTORY].includes(user.role as any) &&
      role !== ROLES.ADMIN
    );
  };

  console.log("User Role: ", user?.role);

  const itemData = {
    itemid: form.getValues("itemid") || 0,
    itemname: form.getValues("itemname") || "",
    itemtype: form.getValues("itemtype"),
    sackweight: form.getValues("sackweight") || "bag25kg",
    status: form.getValues("status") || "active",
    unitofmeasurement: form.getValues("unitofmeasurement") || "quantity",
    stock: form.getValues("stock") || 0,
    unitprice: form.getValues("unitprice") || 0,
    imagepath: form.getValues("imagepath"),
  };

  console.log("Item Data: ", itemData);

  const userActionWithAccess = (id: number, role: string, itemData: any) => {
    if (!role) {
      return "access denied";
    }

    const canAccessInput = () => {
      if (user?.role === ROLES.ADMIN) return true;
      if (user?.role === ROLES.MANAGER) return role !== ROLES.ADMIN;
      if (user?.role === ROLES.SALES) return role !== ROLES.ADMIN;
      if (user?.role === ROLES.INVENTORY) return role !== ROLES.ADMIN;
      return false;
    };

    if (!canAccessInput()) {
      return "access denied";
    }

    if (id === 0) {
      return "add";
    }

    const parsedData = item.safeParse(itemData);

    console.log("Parsed Data: ", parsedData);

    if (parsedData.success) {
      const data = parsedData.data;
      if (data.itemid === id) {
        return "edit";
      }
    } else {
      console.error("Error parsing data: ", parsedData.error);
      return "error";
    }
  };

  const itemId = form.getValues("itemid");

  const action = userActionWithAccess(itemId ?? 0, user?.role, itemData);

  console.log("User Action: ", action);

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 overflow-y-hidden pl-6 pr-6 w-full">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-customColors-eveningSeaGreen">
              Product Management
            </h1>
          </div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <Input
              type="text"
              placeholder="Search item name..."
              value={filters.name}
              onChange={handleItemNameChange}
              className="w-full md:w-auto"
            />
            <div className="flex gap-2">
              <Button onClick={() => setShowModal(true)}>
                {isSmallScreen ? (
                  <PlusIcon className="w-6 h-6" />
                ) : (
                  "Add Product"
                )}
              </Button>
              {renderFilters()}
            </div>
          </div>
          <ScrollArea>
            <Table
              style={{ width: "100%" }}
              className="min-w-[1000px]  rounded-md border-border w-full h-10 overflow-clip relative bg-customColors-beigePaper"
              // divClassname="min-h-[300px] overflow-y-scroll max-h-[400px] overflow-y-auto bg-customColors-offWhite rounded-md"
            >
              <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                <TableRow className="bg-customColors-screenLightGreen hover:bg-customColors-screenLightGreen">
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sack Weight</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Unit of Measurement</TableHead>
                  <TableHead>Available Stocks</TableHead>
                  {canAccessButton(ROLES.ADMIN || ROLES.MANAGER) && (
                    <TableHead>Unit Price</TableHead>
                  )}
                  {canAccessButton(ROLES.ADMIN) && (
                    <TableHead>Last Modified by</TableHead>
                  )}
                  {canAccessButton(ROLES.ADMIN) && (
                    <TableHead>Last Modified at</TableHead>
                  )}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems?.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow
                      key={item.itemid}
                      className="hover:bg-customColors-screenLightGreen"
                    >
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowImage(item)}
                        >
                          View Image
                        </Button>
                      </TableCell>
                      <TableCell>{item.itemname}</TableCell>
                      <TableCell>{item.itemtype}</TableCell>
                      <TableCell>{item.sackweight}</TableCell>
                      <TableCell>
                        <Badge
                          className={`px-2 py-1 rounded-full ${
                            item.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.unitofmeasurement}</TableCell>
                      <TableCell>{formatStock(item.stock)}</TableCell>
                      {canAccessButton(ROLES.ADMIN || ROLES.MANAGER) && (
                        <TableCell>{formatPrice(item.unitprice)}</TableCell>
                      )}
                      {canAccessButton(ROLES.ADMIN) && (
                        <TableCell>
                          {item.User.firstname} {item.User.lastname}
                        </TableCell>
                      )}
                      {canAccessButton(ROLES.ADMIN) && (
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
                      )}
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
                          {/* {canAccessButton(ROLES.ADMIN) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteItem(item)}
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          )} */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell>No items found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="flex items-center justify-center mt-4 mb-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className="hover:bg-customColors-beigePaper"
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                  />
                </PaginationItem>
                {currentPage > 3 && (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        className="hover:bg-customColors-beigePaper"
                        onClick={() => handlePageChange(1)}
                        isActive={currentPage === 1}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    {currentPage > 3 && <PaginationEllipsis />}
                  </>
                )}

                {Array.from({ length: Math.min(3, totalPages) }, (_, index) => {
                  const pageIndex = Math.max(1, currentPage - 1) + index;
                  if (pageIndex < 1 || pageIndex > totalPages) return null;

                  return (
                    <PaginationItem key={pageIndex}>
                      <PaginationLink
                        className="hover:bg-customColors-beigePaper"
                        onClick={() => handlePageChange(pageIndex)}
                        isActive={currentPage === pageIndex}
                      >
                        {pageIndex}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <PaginationEllipsis />}
                    <PaginationItem>
                      <PaginationLink
                        className="hover:bg-customColors-beigePaper"
                        onClick={() => handlePageChange(totalPages)}
                        isActive={currentPage === totalPages}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                <PaginationItem>
                  <PaginationNext
                    className="hover:bg-customColors-beigePaper"
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          <>
            {showImageModal && showImage && (
              <Dialog open={showImageModal} onOpenChange={closeImage}>
                <DialogContent className="fixed  transform  max-w-[90%] max-h-[90%] sm:max-w-[800px] sm:max-h-[600px] p-4 bg-white rounded">
                  <div className="flex flex-col">
                    <DialogHeader className="mb-2 flex items-start">
                      <DialogTitle className="text-xl text-left flex-grow text-customColors-eveningSeaGreen">
                        Product Image
                      </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="mb-4 text-left">
                      <p>You can click outside to close</p>
                    </DialogDescription>
                    <div className="flex-grow flex items-center justify-center overflow-hidden">
                      <div className="relative w-full h-[400px]">
                        {showImage.imagepath ? (
                          <Image
                            src={showImage.imagepath}
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
          {/* {itemToDelete && (
            <AlertDialog open={showAlert}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the item name {itemToDelete?.itemname} {""} which consists
                    of
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
                    onClick={() => handleDeleteWithToast(itemToDelete.itemid)}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )} */}
          {showModal && (
            <Dialog open={showModal} onOpenChange={handleCancel}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="text-customColors-eveningSeaGreen">
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
                          name="itemname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="itemname">Name</FormLabel>
                              <FormControl>
                                <Input {...field} id="itemname" type="text" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="itemtype"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="itemtype">Type</FormLabel>
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
                      {(action === "edit" && user?.role === ROLES.ADMIN) ||
                      user?.role === ROLES.MANAGER ? (
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="status">Status</FormLabel>
                                <FormControl>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    {...field}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Status">
                                        {field.value}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">
                                        Active
                                      </SelectItem>
                                      <SelectItem value="inactive">
                                        Inactive
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      ) : null}
                      {/* <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="status">Status</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  {...field}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Status">
                                      {field.value}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">
                                      Active
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                      Inactive
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div> */}
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
                              <FormLabel htmlFor="stock">Stock</FormLabel>
                              <FormControl>
                                <Input {...field} id="stock" type="number" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      {canAccessButton(ROLES.ADMIN || ROLES.MANAGER) && (
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
                      )}
                    </div>
                    <DialogFooter className="pt-2 lg:pt-1">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                        >
                          Save
                        </Button>
                      </div>
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
