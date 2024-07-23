"use client";
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

export default function Home() {
  const router = useRouter();

  const form = useForm<Login>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleSubmit = async (values: Login) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          data: JSON.stringify(values),
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error authenticating user:", error);
      return new Response(
        JSON.stringify({ error: "Error authenticating user" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
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
                <TabsTrigger value="register">Register</TabsTrigger>
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
                                    type="username"
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
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Register</CardTitle>
                    <CardDescription>
                      Register to create an account
                    </CardDescription>
                  </CardHeader>
                  {/* <Form> */}
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" type="username" required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" required />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Register</Button>
                  </CardFooter>
                  {/* </Form> */}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
