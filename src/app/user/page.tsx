"use client";

import { useEffect, useState } from "react";
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
import { user, AddUser } from "@/schemas/User.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
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
import SideMenu from "@/components/sidemenu";

export default function Component() {
  const [users, setUsers] = useState<AddUser[] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AddUser | null>(null);

  const form = useForm<AddUser>({
    resolver: zodResolver(user),
    defaultValues: {
      firstname: "",
      middlename: "",
      lastname: "",
      role: "",
      status: "active",
      username: "",
      password: "",
      userid: 0,
    },
  });

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
      firstname: user.firstname,
      middlename: user.middlename,
      lastname: user.lastname,
      role: user.role,
      status: user.status,
      username: user.username,
      password: user.password,
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    form.reset();
  };

  const handleSubmit = async (values: AddUser) => {
    console.log("values", values);
    try {
      if (values.userid) {
        await axios.put(`/api/user/`, values, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        await axios.post("/api/user", values, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      setShowModal(false);
      form.reset();
      refreshUsers();
      console.log("User added/updated successfully");
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // const handleDelete = async (values: AddUser) => {
  //   try {
  //     if (!values.userid) {
  //       console.error("User ID is undefined or null.");
  //       return;
  //     }

  //     const response = await axios.delete(`/api/user/` + values.userid);

  //     setShowAlert(false);
  //     form.reset();
  //     refreshUsers();
  //     console.log("User deleted successfully");
  //   } catch (error) {
  //     console.error("Error deleting user:", error);
  //   }
  // };

  const handleDelete = async (userid: string) => {
    try {
      const response = await axios.delete(`/api/user-delete/${userid}`);
      console.log("User deleted successfully:", response.data);
      refreshUsers();
      setShowAlert(false);
      setUserToDelete(null);
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

  return (
    <div className="flex h-screen">
      <SideMenu />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">User Management</h1>
            <Button onClick={handleAddUser}>Add User</Button>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users &&
                  users.map((user: AddUser, index: number) => (
                    <TableRow key={index}>
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
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
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
                    </div>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="lastname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="lastname">Last Name</FormLabel>
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
                                  <SelectItem value="active">Active</SelectItem>
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
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
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

function FilePenIcon(props: React.SVGProps<SVGSVGElement>) {
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

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
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

{
  /* <Card>
              <CardHeader>
                <CardTitle>
                  {form.getValues("userid") ? "Edit User" : "Add User"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="firstname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="firstname">First Name</FormLabel>
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
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="lastname">Last Name</FormLabel>
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
                              <SelectItem value="manager">Manager</SelectItem>
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
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
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
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto" type="submit">
                  Save
                </Button>
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </CardFooter>
            </Card> */
}
