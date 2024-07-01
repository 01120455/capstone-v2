"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        console.log("Authentication successful!");
        router.push("/dashboard");
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      console.error("Error authenticating employee:", error);
      setError("Error authenticating employee");
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
                    <Button>Login</Button>
                  </CardFooter>
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
          {/* <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome to 3R Shane</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </div>
          <form className="space-y-4">
            <div>
              <Label htmlFor="email">Username</Label>
              <Input id="username" type="username" placeholder="" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="#" className="underline" prefetch={false}>
              Sign up
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}
