"use client";

import {
  useEffect,
  useState,
  ChangeEvent,
  useContext,
  useCallback,
  useMemo,
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
import { Badge } from "@/components/ui/badge";
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
import { useForm } from "react-hook-form";
import { user as UserSchema, AddUser } from "@/schemas/User.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  FilePenIcon,
  TrashIcon,
  PlusIcon,
  AlertCircle,
  CheckCircle,
  FilterIcon,
  Lock,
  EyeOff,
  Eye,
} from "@/components/icons/Icons";
import { User } from "@/interfaces/user";
import SideMenu from "@/components/sidemenu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { userSessionContext } from "@/components/sessionContext-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const ROLES = {
  SALES: "sales",
  INVENTORY: "inventory",
  MANAGER: "manager",
  ADMIN: "admin",
};

const USERS_PER_PAGE = 10;

const useFilters = () => {
  const [filters, setFilters] = useState({
    email: "",
    firstname: "",
    middlename: "",
    lastname: "",
    role: "",
    status: "",
  });

  const clear = () => {
    setFilters({
      email: "",
      firstname: "",
      middlename: "",
      lastname: "",
      role: "",
      status: "",
    });
  };

  return {
    filters,
    setFilters,
    clear,
  };
};

const useUsers = () => {
  const [users, setUsers] = useState<AddUser[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { filters, setFilters, clear } = useFilters();

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchUsers = useCallback(
    async (page: number) => {
      if (isNaN(page) || page < 1) return;

      try {
        const params = new URLSearchParams({
          limit: USERS_PER_PAGE.toString(),
          page: page.toString(),
        });

        if (filters.email) {
          params.append("email", filters.email);
        }
        if (filters.firstname) {
          params.append("firstname", filters.firstname);
        }
        if (filters.middlename) {
          params.append("middlename", filters.middlename);
        }
        if (filters.lastname) {
          params.append("lastname", filters.lastname);
        }
        if (filters.role) {
          params.append("role", filters.role);
        }
        if (filters.status) {
          params.append("status", filters.status);
        }

        const response = await fetch(`/api/user/userpagination?${params}`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const totalUsers = await fetch(`/api/user/userpagination`);

        const data = await response.json();
        setUsers(data);
        const totalRowsData = await totalUsers.json();
        setTotalPages(Math.ceil(totalRowsData.length / USERS_PER_PAGE));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    [filters]
  );

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (
      filters.email ||
      filters.firstname ||
      filters.middlename ||
      filters.lastname
    ) {
      const timer = setTimeout(() => fetchUsers(currentPage), 1000);
      setDebounceTimeout(timer);
    } else {
      fetchUsers(currentPage);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [
    filters.email,
    filters.firstname,
    filters.middlename,
    filters.lastname,
    currentPage,
    fetchUsers,
  ]);

  const refreshUsers = () => {
    setFilters({
      email: "",
      firstname: "",
      middlename: "",
      lastname: "",
      role: "",
      status: "",
    });
    fetchUsers(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    clear();
    fetchUsers(1);
  };

  return {
    users,
    currentPage,
    totalPages,
    handlePageChange,
    filters,
    setFilters,
    clearFilters,
    refreshUsers,
  };
};

export default function Component() {
  const user = useContext(userSessionContext);
  const {
    users,
    currentPage,
    totalPages,
    handlePageChange,
    filters,
    setFilters,
    clearFilters,
    refreshUsers,
  } = useUsers();
  const [showModal, setShowModal] = useState(false);
  const [showImage, setShowImage] = useState<AddUser | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AddUser>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      imagepath: "",
      firstname: "",
      middlename: "",
      lastname: "",
      role: "",
      status: "active",
      email: "",
      password: "",
      userid: 0,
      image: undefined,
    },
  });

  // useEffect(() => {
  //   console.log(form.formState.errors);
  // }, [form.formState.errors]);

  const handleAddUser = () => {
    setShowModal(true);

    form.reset({
      imagepath: "",
      firstname: "",
      middlename: "",
      lastname: "",
      role: "",
      status: "active",
      email: "",
      password: "",
      userid: 0,
    });
  };

  const handleEditUser = (user: AddUser) => {
    setShowModal(true);

    form.reset({
      userid: user.userid,
      imagepath: user.imagepath ?? "",
      firstname: user.firstname,
      middlename: user.middlename ?? "",
      lastname: user.lastname,
      role: user.role,
      status: user.status,
      email: user.email,
      password: "",
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    setShowPassword(false);
    form.reset();
  };

  const fileRef = form.register("image");

  const handleSubmit = async (values: AddUser) => {
    // console.log("Form Values:", values);
    const formData = new FormData();

    formData.append("firstname", values.firstname);
    formData.append("middlename", values.middlename ?? "");
    formData.append("lastname", values.lastname);
    formData.append("role", values.role);
    formData.append("status", values.status);
    formData.append("email", values.email ?? "");

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    if (values.password) {
      formData.append("password", values.password);
    }

    try {
      let method = "POST";
      let endpoint = "/api/user";

      if (values.userid) {
        method = "PUT";
        endpoint = `/api/user/`;
        formData.append("userid", values.userid.toString());
      }

      const uploadRes = await fetch(endpoint, {
        method: method,
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadResult = await uploadRes.json();
        if (values.userid) {
          // console.log("User updated successfully:", uploadResult);
          toast.success(
            `User ${form.getValues("firstname")} ${form.getValues(
              "lastname"
            )} has been updated`,
            {
              description: "You have successfully updated the user.",
            }
          );
        } else {
          // console.log("User added successfully:", uploadResult);
          toast.success(
            `User ${form.getValues("firstname")} ${form.getValues(
              "lastname"
            )} has been added`,
            {
              description: "You have successfully added the user.",
            }
          );
        }

        if (uploadResult.imagepath) {
          // console.log("Image uploaded successfully:", uploadResult.imagepath);
        }

        setShowModal(false);
        refreshUsers();
        setShowPassword(false);
        form.reset();
      } else {
        console.error("Error uploading image:", uploadRes.status);
      }
    } catch (error) {
      console.error("Error adding/updating user:", error);
    }
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

  const handleShowImage = async (item: AddUser) => {
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

  const filteredUsers = useMemo(() => {
    return users;
  }, [users]);

  const handleemailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, email: value }));
    handlePageChange(1);
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, firstname: value }));
    handlePageChange(1);
  };

  const handleMiddleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, middlename: value }));
    handlePageChange(1);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, lastname: value }));
    handlePageChange(1);
  };

  const handleUserRoleChange = (value: string) => {
    setFilters((prev) => ({ ...prev, role: value }));
    handlePageChange(1);
  };

  const handleUserStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
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
            <span className="text-sm">User First Name</span>
            <Input
              id="name"
              type="text"
              placeholder="Search user's first name..."
              value={filters.firstname}
              onChange={handleFirstNameChange}
            />
          </div>
          <div className="grid gap-2">
            <span className="text-sm">User Middle Name</span>
            <Input
              id="name"
              type="text"
              placeholder="Search user's middle name..."
              value={filters.middlename}
              onChange={handleMiddleNameChange}
            />
          </div>
          <div className="grid gap-2">
            <span className="text-sm">User Last Name</span>
            <Input
              id="name"
              type="text"
              placeholder="Search user's last name..."
              value={filters.lastname}
              onChange={handleLastNameChange}
            />
          </div>
          <div className="grid gap-2">
            <span className="text-sm">User Role</span>
            <Select value={filters.role} onValueChange={handleUserRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select user's role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <span className="text-sm">User Status</span>
            <Select
              value={filters.status}
              onValueChange={handleUserStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user's status" />
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

  // console.log("User Role: ", user?.role);

  const userData = {
    userid: form.getValues("userid"),
    imagepath: form.getValues("imagepath"),
    firstname: form.getValues("firstname"),
    middlename: form.getValues("middlename"),
    lastname: form.getValues("lastname"),
    role: form.getValues("role"),
    status: form.getValues("status"),
    email: form.getValues("email"),
    password: form.getValues("password"),
  };

  // console.log("Item Data: ", userData);

  const userActionWithAccess = (id: number, role: string, userData: any) => {
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

    const parsedData = UserSchema.safeParse(userData);

    // console.log("Parsed Data: ", parsedData);

    if (parsedData.success) {
      const data = parsedData.data;
      if (data.userid === id) {
        return "edit";
      }
    } else {
      console.error("Error parsing data: ", parsedData.error);
      return "error";
    }
  };

  const userId = form.getValues("userid");

  const action = userActionWithAccess(userId ?? 0, user?.role, userData);

  // console.log("User Action: ", action);

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="grid gap-6 grid-cols-1">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center">
                <div className="w-[1000px]">
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-customColors-eveningSeaGreen">
                      User Management
                    </h1>
                  </div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <Input
                      type="text"
                      placeholder="Search by email..."
                      value={filters.email}
                      onChange={handleemailChange}
                      className="w-full md:w-auto"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleAddUser}>
                        {isSmallScreen ? (
                          <PlusIcon className="w-6 h-6" />
                        ) : (
                          "Add User"
                        )}
                      </Button>
                      {renderFilters()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center overflow-hidden bg-customColors-lightPastelGreen">
                <div className="w-full max-w-[1000px] ">
                  <ScrollArea>
                    <Table
                      style={{ width: "100%" }}
                      className="min-w-[1000px] rounded-md border border-border h-10 overflow-hidden bg-customColors-beigePaper"
                    >
                      <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                        <TableRow className="bg-customColors-screenLightGreen hover:bg-customColors-screenLightGreen">
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers &&
                          filteredUsers.map((user: AddUser, index: number) => (
                            <TableRow
                              key={index}
                              className="hover:bg-customColors-screenLightGreen"
                            >
                              <TableCell>
                                {/* <Image
                          src={user.imagepath ?? ""}
                          alt="User Image"
                          width={250}
                          height={250}
                          className="rounded"
                        /> */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleShowImage(user)}
                                >
                                  View Image
                                </Button>
                              </TableCell>
                              <TableCell>
                                {user.firstname} {user.middlename}{" "}
                                {user.lastname}
                              </TableCell>
                              <TableCell>{user.role}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.status === "active"
                                      ? "default"
                                      : "destructive"
                                  }
                                  className={`px-2 py-1 rounded-full ${
                                    user.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell className="text-right">
                                {canAccessButton(ROLES.ADMIN) && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleEditUser(user)}
                                    >
                                      <FilePenIcon className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                  <div className="flex items-center justify-center mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            className="hover:bg-customColors-screenLightGreen"
                            onClick={() =>
                              handlePageChange(Math.max(1, currentPage - 1))
                            }
                          />
                        </PaginationItem>
                        {currentPage > 3 && (
                          <>
                            <PaginationItem>
                              <PaginationLink
                                className="hover:bg-customColors-screenLightGreen"
                                onClick={() => handlePageChange(1)}
                                isActive={currentPage === 1}
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                            {currentPage > 3 && <PaginationEllipsis />}
                          </>
                        )}

                        {Array.from(
                          { length: Math.min(3, totalPages) },
                          (_, index) => {
                            const pageIndex =
                              Math.max(1, currentPage - 1) + index;
                            if (pageIndex < 1 || pageIndex > totalPages)
                              return null;

                            return (
                              <PaginationItem key={pageIndex}>
                                <PaginationLink
                                  className="hover:bg-customColors-screenLightGreen"
                                  onClick={() => handlePageChange(pageIndex)}
                                  isActive={currentPage === pageIndex}
                                >
                                  {pageIndex}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                        )}

                        {currentPage < totalPages - 2 && (
                          <>
                            {currentPage < totalPages - 3 && (
                              <PaginationEllipsis />
                            )}
                            <PaginationItem>
                              <PaginationLink
                                className="hover:bg-customColors-screenLightGreen"
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
                            className="hover:bg-customColors-screenLightGreen"
                            onClick={() =>
                              handlePageChange(
                                Math.min(totalPages, currentPage + 1)
                              )
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              </div>

              <>
                {showImageModal && showImage && (
                  <Dialog open={showImageModal} onOpenChange={closeImage}>
                    <DialogContent className="fixed flex flex-col transform  max-w-[90%] max-h-[90%] sm:max-w-[800px] sm:max-h-[600px] p-4 bg-customColors-offWhite rounded">
                      <DialogHeader className="mb-2 flex items-start">
                        <DialogTitle className="text-left flex-grow text-customColors-eveningSeaGreen">
                          User Image
                        </DialogTitle>
                      </DialogHeader>
                      <DialogDescription className="mb-4 text-left">
                        <p>You can click outside to close</p>
                      </DialogDescription>
                      <div className="flex-grow flex items-center justify-center overflow-hidden">
                        <div className="relative w-full h-[400px]">
                          {showImage?.imagepath ? (
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
                    </DialogContent>
                  </Dialog>
                )}
              </>
              {showModal && (
                <Dialog open={showModal} onOpenChange={handleCancel}>
                  <DialogContent className="bg-customColors-offWhite">
                    <DialogHeader>
                      <DialogTitle>
                        {form.getValues("userid") ? "Edit User" : "Add User"}
                      </DialogTitle>
                      <DialogDescription>
                        Fill in the form below to{" "}
                        {form.getValues("userid") ? "edit" : "add"} a user.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        className="w-full max-w-4xl mx-auto p-6"
                        onSubmit={form.handleSubmit(handleSubmit)}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          {action === "add" ? (
                            <div className="space-y-2">
                              <FormField
                                control={form.control}
                                name="imagepath"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel htmlFor="file">
                                      Upload Image
                                    </FormLabel>
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
                          ) : null}

                          {action === "add" ? (
                            <div className="space-y-2">
                              <FormField
                                control={form.control}
                                name="firstname"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel htmlFor="firstname">
                                      First Name
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        id="firstname"
                                        placeholder="John"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          ) : null}

                          {action === "add" ? (
                            <div className="space-y-2">
                              <FormField
                                control={form.control}
                                name="middlename"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel htmlFor="middlename">
                                      Middle Name
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        id="middlename"
                                        placeholder="Alcarra"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          ) : null}

                          {action === "add" ? (
                            <div className="space-y-2">
                              <FormField
                                control={form.control}
                                name="lastname"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel htmlFor="lastname">
                                      Last Name
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        id="lastname"
                                        placeholder="Doe"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          ) : null}

                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="role"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel htmlFor="role">Role</FormLabel>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      {...field}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select role">
                                          {field.value}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">
                                          Admin
                                        </SelectItem>
                                        <SelectItem value="manager">
                                          Manager
                                        </SelectItem>
                                        <SelectItem value="sales">
                                          Sales
                                        </SelectItem>
                                        <SelectItem value="inventory">
                                          Inventory
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
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
                                  <FormLabel htmlFor="status">Status</FormLabel>
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
                                        <SelectItem value="active">
                                          Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                          Inactive
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {action === "add" ? (
                            <div className="space-y-2">
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel htmlFor="email">email</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        id="email"
                                        placeholder="JohnDoe@gmail.com"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          ) : null}
                          {action === "add" ? (
                            <div className="space-y-2">
                              <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel htmlFor="password">
                                      Password
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          {...field}
                                          id="password"
                                          type={
                                            showPassword ? "text" : "password"
                                          }
                                          name="password"
                                          placeholder={
                                            form.getValues("userid")
                                              ? "Leave blank if not changing"
                                              : "Enter password"
                                          }
                                          required
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setShowPassword(!showPassword)
                                          }
                                          className="absolute right-3 top-2 text-gray-400"
                                        >
                                          {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                          ) : (
                                            <Eye className="h-5 w-5" />
                                          )}
                                        </button>
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          ) : null}
                        </div>
                        <DialogFooter className="pt-2">
                          <Button variant="outline" onClick={handleCancel}>
                            Cancel
                          </Button>
                          <Button type="submit">Save</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
