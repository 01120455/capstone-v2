"use client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SideMenu from "@/components/sidemenu";
import { ChangeEvent, useEffect, useState } from "react";
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
import { toast } from "sonner";
import { Eye, EyeOff } from "@/components/icons/Icons";

export default function Component() {
  const [userSession, setUserSession] = useState<AddUser | null>(null);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AddUser>({
    resolver: zodResolver(user),
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
            email: session.email || "",
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
    formData.append("email", values.email || "");

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
          toast.success(
            `User ${""} ${form.getValues(
              "email"
            )} ${""} your profile has been updated`,
            {
              description: "You have successfully updated your profile.",
            }
          );

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
    <div className="flex min-h-screen w-full">
      <div className="flex-1 overflow-y-auto p-8">
        <header className="flex flex-col sm:flex-row justify-start items-center mb-8">
          <div className="w-full">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row justify-center items-center gap-4">
                <Avatar className="h-32 w-32 lg:h-52 lg:w-52">
                  <AvatarImage src={userSession?.imagepath} />
                  <AvatarFallback>
                    {userSession?.firstname?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col justify-center items-center pt-4">
                <h2 className="text-4xl font-bold text-customColors-darkKnigh">
                  {fullName || "Guest"}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {userSession?.role}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col justify-between items-center lg:flex-row">
          <aside className="flex flex-col justify-items-start space-y-4 mb-2 lg:mb-0 lg:w-1/4 md:w-1/8  ">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    className={`px-2 py-1 rounded-full ${
                      userSession?.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {userSession?.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{userSession?.email}</span>
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
          <div className="ml-10">
            <Form {...form}>
              <form
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2"
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            id="email"
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
                          <div className="relative">
                            <Input
                              {...field}
                              id="password"
                              type={showPassword ? "text" : "password"}
                              name="password"
                              placeholder="********"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
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
                  <div className="flex flex-row-reverse items-end pr-4 lg:pr-1">
                    <Button type="submit" className="mt-10">
                      Save Changes
                    </Button>
                  </div>
                  <div className="p-10"></div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
