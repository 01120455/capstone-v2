"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
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
import { toast } from "sonner";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<Login>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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
        toast.error(`Error: ${data.message}`);
        return;
      }

      toast.success(`Welcome back, ${data.email}!`);

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
    }
  };

  return (
    <div className="grid lg:grid-cols-2 min-h-screen w-full">
      <div className="bg-gray-100 dark:bg-gray-800 items-center justify-center hidden lg:flex">
        <Image
          src="/login.jpg"
          alt="Login Image"
          width={1000}
          height={1000}
          className="w-full lg:w-1/2 xl:w-full object-contain"
        />
      </div>
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="max-w-md w-full space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome to 3R Shane</h1>
          </div>
          <div className="flex justify-center">
            <Tabs defaultValue="login" className="w-[400px]">
              <TabsList className="w-full grid-cols-1 hidden">
                <TabsTrigger value="login">Login</TabsTrigger>
              </TabsList>
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Login to your account to continue
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
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="email">Email</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="email"
                                  type="email"
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
                              <FormLabel htmlFor="password">Password</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  name="password"
                                  required
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center mt-2">
                        <Checkbox
                          id="showpassword"
                          onCheckedChange={() =>
                            setShowPassword((prev) => !prev)
                          }
                        />
                        <Label htmlFor="showpassword" className="ml-2">
                          Show Password
                        </Label>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit">Login</Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
