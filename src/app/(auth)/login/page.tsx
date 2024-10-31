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
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "@/components/icons/Icons";

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
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Login
                </CardTitle>
                <CardDescription className="text-center">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <Form {...form}>
                <form
                  className="w-full max-w-4xl mx-auto p-6"
                  onSubmit={form.handleSubmit(handleSubmit)}
                >
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="email">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                                <Input
                                  {...field}
                                  id="email"
                                  type="email"
                                  placeholder="karadavid@example.com"
                                  className="pl-10 pr-10"
                                  required
                                />
                              </div>
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
                              <div className="relative">
                                <Lock className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                                <Input
                                  {...field}
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  name="password"
                                  className="pl-10 pr-10"
                                  required
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
                    </div>
                    {/* <div className="flex items-center mt-2">
                      <Checkbox
                        id="showpassword"
                        onCheckedChange={() => setShowPassword((prev) => !prev)}
                      />
                      <Label htmlFor="showpassword" className="ml-2">
                        Show Password
                      </Label>
                    </div> */}
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full">
                      Login
                    </Button>
                    <div className="text-sm text-center">
                      <Link
                        href="/forgotpassword"
                        className="text-primary hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
