"use client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import SideMenu from "@/components/sidemenu";
import { ChangeEvent, useEffect, useState } from "react";
import { User } from "@/interfaces/user";
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

export default function Component() {
  const [userSession, setUserSession] = useState<AddUser | null>(null);
  const [selectedFile, setSelectedFile] = useState<File>();

  // const userID = userSession?.userid;
  // console.log("User ID:", userID);

  const form = useForm<AddUser>({
    resolver: zodResolver(user),
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

  // const handleEditUser = async (user: AddUser) => {
  //   console.log("Editing user:", user);
  //   form.reset({
  //     imagepath: user.imagepath,
  //     firstname: user.firstname,
  //     middlename: user.middlename,
  //     lastname: user.lastname,
  //     role: user.role,
  //     status: user.status,
  //     username: user.username,
  //     password: "",
  //     userid: user.userid,
  //   });
  // };

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await fetch("/api/auth/session", {
  //         method: "GET",
  //       });
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       const session = await response.json();
  //       setUserSession(session || null);
  //       console.log("User session:", session);
  //     } catch (error) {
  //       console.error("Failed to fetch session", error);
  //     }
  //   };
  //   fetchUser();
  // }, []);

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
        setUserSession(session);

        if (session && user) {
          form.reset({
            imagepath: session.imagepath || "",
            firstname: session.firstname || "",
            middlename: session.middlename || "",
            lastname: session.lastname || "",
            role: session.role || "",
            status: "active",
            username: session.username || "",
            password: "", 
            userid: session.userid || 0,
          });
        }

        console.log("User session:", session);
      } catch (error) {
        console.error("Failed to fetch session", error);
      }
    };
    fetchUser();
  }, []);

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
      if (values.userid) {
        const endpoint = `/api/user/`; 

        formData.append("userid", values.userid.toString()); 

        const uploadRes = await fetch(endpoint, {
          method: "PUT",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json();
          console.log("User updated successfully:", uploadResult);

          if (uploadResult.imagepath) {
            console.log("Image uploaded successfully:", uploadResult.imagepath);
          }

          form.reset(); 
        } else {
          console.error("Error updating user:", uploadRes.status);
        }
      } else {
        console.error("User ID is required for updating.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const fullName =
    userSession?.firstname && userSession?.lastname
      ? `${userSession.firstname} ${
          userSession.middlename ? userSession.middlename + " " : ""
        }${userSession.lastname}`
      : "Guest";

  return (
    <div className="flex h-screen">
      <SideMenu />
      <div className="flex-1 overflow-y-auto p-8">
        <header className="flex flex-col sm:flex-row justify-start items-center mb-8">
          <div className="w-full">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <Avatar className="h-32 w-32 lg:h-52 lg:w-52">
                  <AvatarImage src={userSession?.imagepath} />
                  <AvatarFallback>
                    {userSession?.firstname?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <h2 className="text-4xl font-bold">{fullName || "Guest"}</h2>
                  <p className="text-xl text-muted-foreground">
                    {userSession?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row">
          <aside className="flex flex-col justify-items-start p-4 space-y-4 mb-2 lg:mb-0 lg:w-1/4">
            <div className="p-6 grid gap-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant="secondary"
                    className={`px-2 py-1 rounded-full ${
                      userSession?.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                    }`}
                  >
                    {userSession?.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Username:</span>
                  <span>{userSession?.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Password:</span>
                  <span>********</span>
                </div>
              </div>
              <Separator />
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">First Name:</span>
                  <span>{userSession?.firstname}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Middle Name:</span>
                  <span>{userSession?.middlename}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Name:</span>
                  <span>{userSession?.lastname}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span>{userSession?.role}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Inputs section */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-2">
            <div className="space-y-2 ml-10">
              <Label htmlFor="profilePicture">Profile Picture</Label>
              <Input id="profilePicture" type="file" />
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="" />
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input id="middleName" defaultValue="" />
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="" />
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="" />
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
          </div> */}
          {/* {form.getValues("userid") ? "Edit User" : "Add User"} */}
          <Form {...form}>
            <form
              className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-2"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <div className="space-y-2 ml-10">
                <FormField
                  control={form.control}
                  name="imagepath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="file">Profile Picture</FormLabel>
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
              <div className="space-y-2 ml-10">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="firstName">First Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="firstName"
                          placeholder="John"
                          defaultValue={field.value}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2 ml-10">
                <FormField
                  control={form.control}
                  name="middlename"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="middleName">Middle Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="middleName"
                          placeholder="Doe"
                          defaultValue={field.value}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2 ml-10">
                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="lastName">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="lastName"
                          placeholder="Smith"
                          defaultValue={field.value}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2 ml-10">
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
                          placeholder="johndoe"
                          defaultValue={field.value}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2 ml-10">
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
                          placeholder="********"
                          defaultValue={field.value}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex flex-row-reverse items-end">
                  <Button type="submit" className="mt-10">
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>

        {/* <div className="flex justify-end mt-8">
          <Button>Save Changes</Button>
        </div> */}
      </div>
    </div>
  );
}
