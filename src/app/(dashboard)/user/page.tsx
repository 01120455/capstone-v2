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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
} from "@/components/icons/Icons";
import { User } from "@/interfaces/user";
import SideMenu from "@/components/sidemenu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ROLES = {
  SALES: "sales",
  INVENTORY: "inventory",
  MANAGER: "manager",
  ADMIN: "admin",
};

export default function Component() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<AddUser[] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showImage, setShowImage] = useState<AddUser | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AddUser | null>(null);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const currentUsers = users?.filter(
    (user) =>
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const form = useForm<AddUser>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      imagepath: "",
      firstname: "",
      middlename: "",
      lastname: "",
      role: "",
      status: "active",
      username: "",
      password: "",
      userid: 0,
      image: undefined,
    },
  });

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

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
    async function getUsers() {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const users = await response.json();
          setUsers(users);
        } else {
          console.error("Error fetching users:", response.status);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    getUsers();
  }, []);

  const handleAddUser = () => {
    setShowModal(true);

    form.reset({
      imagepath: "",
      firstname: "",
      middlename: "",
      lastname: "",
      role: "",
      status: "active",
      username: "",
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
      username: user.username,
      password: "",
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    form.reset();
  };

  const fileRef = form.register("image");

  const handleSubmit = async (values: AddUser) => {
    console.log("Form Values:", values);
    const formData = new FormData();

    formData.append("firstname", values.firstname);
    formData.append("middlename", values.middlename ?? "");
    formData.append("lastname", values.lastname);
    formData.append("role", values.role);
    formData.append("status", values.status);
    formData.append("username", values.username);

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
          console.log("User updated successfully:", uploadResult);
        } else {
          console.log("User added successfully:", uploadResult);
        }

        if (uploadResult.imagepath) {
          console.log("Image uploaded successfully:", uploadResult.imagepath);
        }

        setShowModal(false);
        refreshUsers();
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

  const handleDelete = async (userid: number | undefined) => {
    try {
      const response = await fetch(`/api/user/userSD/${userid}`, {
        method: "PUT",
      });
      if (response.ok) {
        console.log("User deleted successfully");
        refreshUsers();
        setShowAlert(false);
        setUserToDelete(null);
      } else {
        console.error("Error deleting user:", response.status);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleDeleteUser = (user: AddUser) => {
    setUserToDelete(user);
    setShowAlert(true);
  };

  const handleDeleteCancel = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    setShowAlert(false);
    setUserToDelete(null);
    form.reset();
  };

  const refreshUsers = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const users = await response.json();
        setUsers(users);
      } else {
        console.error("Error fetching users:", response.status);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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

  const totalPages = Math.ceil((currentUsers?.length || 0) / itemsPerPage);
  const paginatedUsers = (currentUsers || []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="w-full max-w-screen-2xl mx-auto p-4">
          <div className="flex justify-between items-center mb-6 -mr-6">
            <h1 className="text-2xl font-bold">User Management</h1>
            <Button onClick={handleAddUser}>
              {isSmallScreen ? <PlusIcon className="w-6 h-6" /> : "Add User"}
            </Button>
          </div>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full md:w-auto"
            />
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Table
              style={{ width: "100%" }}
              className="min-w-[1000px]  rounded-md border-border w-full h-10 overflow-clip relative"
              divClassname="overflow-y-scroll min-h-[310px] overflow-y-auto"
            >
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers &&
                  paginatedUsers.map((user: AddUser, index: number) => (
                    <TableRow key={index}>
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
                        {user.firstname} {user.middlename} {user.lastname}
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Badge
                          className={`px-2 py-1 rounded-full ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          }`}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
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
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => handlePageChange(index + 1)}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
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
                      <DialogTitle className="text-left flex-grow">
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
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
          {userToDelete && (
            <AlertDialog open={showAlert}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the user {userToDelete?.userid} {userToDelete?.firstname}{" "}
                    {userToDelete?.lastname} and remove their data from our
                    servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={handleDeleteCancel}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(userToDelete.userid)}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {showModal && (
            <Dialog open={showModal} onOpenChange={handleCancel}>
              <DialogContent>
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
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="imagepath"
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
                                  defaultValue={field.value}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
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
                                  defaultValue={field.value}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
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
                                  defaultValue={field.value}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

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
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="manager">
                                      Manager
                                    </SelectItem>
                                    <SelectItem value="sales">Sales</SelectItem>
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

                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="username">Username</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="username"
                                  placeholder="JohnDoe@gmail.com"
                                  defaultValue={field.value}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="password">Password</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="password"
                                  type="password"
                                  defaultValue={field.value}
                                  placeholder={
                                    form.getValues("userid")
                                      ? "Leave blank if not changing"
                                      : "Enter password"
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <DialogFooter className="pt-2">
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