"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Login, loginSchema } from "@/schemas/User.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [alert, setAlert] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const router = useRouter();

  const form = useForm<Login>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleAlertDismiss = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      setAlert(null);
      setFadeOut(false); // Reset fadeOut for the next alert
    }, 1000); // 1000ms matches the fade-out duration
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => handleAlertDismiss(), 10000);

      return () => clearTimeout(timer);
    }
  }, [alert, handleAlertDismiss]);

  const handleSubmit = async (values: Login) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setAlert({
          message: data.message || "Invalid username or password",
          type: "error",
        });
        return;
      }

      if (response.ok) {
        setAlert({
          message: data.message,
          type: "success",
        });
      }

      setAlert(null);

      switch (data.role) {
        case "admin":
        case "manager":
          router.push("/dashboard");
          break;
        case "sales":
          router.push("/sales");
          break;
        case "inventory":
          router.push("/product");
          break;
        default:
          throw new Error("Unknown role");
      }
    } catch (error) {
      console.error("Error authenticating user:", error);
      setAlert({ message: "An unexpected error occurred", type: "error" });
    }
  };

  return (
    <div className="grid lg:grid-cols-2 min-h-screen w-full">
      <div className="bg-gray-100 dark:bg-gray-800 flex items-center justify-center hidden lg:flex">
        <Image
          src="/login.jpg"
          alt="Login Image"
          width={1000}
          height={1000}
          className="w-full lg:w-1/2, xl:w-full object-contain"
        />
      </div>
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="max-w-md w-full space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome to 3R Shane</h1>
          </div>
          <div className="flex justify-center">
            <Tabs defaultValue="login" className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                {/* <TabsTrigger value="register">Register</TabsTrigger> */}
              </TabsList>
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                      Login in to your account to continue
                    </CardDescription>
                  </CardHeader>
                  <Form {...form}>
                    <form
                      className="w-full max-w-4xl mx-auto p-6"
                      onSubmit={form.handleSubmit(handleSubmit)}
                    >
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="username">
                                  Username
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    id="username"
                                    type="text"
                                    required
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="space-y-1">
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="password">
                                  Password
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    id="password"
                                    type="password"
                                    required
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="submit">Login</Button>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
              </TabsContent>
              {/* <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Register</CardTitle>
                    <CardDescription>
                      Register to create an account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" type="text" required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" required />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Register</Button>
                  </CardFooter>
                </Card>
              </TabsContent> */}
            </Tabs>
          </div>
          {alert && (
            <div
              className={`fixed-alert ${fadeOut ? "fade-out" : ""} ${
                alert.type === "error" ? "alert-error" : "alert-success"
              }`}
            >
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>
                  {alert.type === "error" ? "Error" : "Success"}
                </AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Terminal(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  );
}
