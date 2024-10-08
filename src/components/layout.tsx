"use client";
import { useAuth } from "../utils/hooks/auth";
import { useRouter } from "next/navigation";
import SideMenu from "@/components/sidemenu";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { AlertCircle } from "./icons/Icons";
import { Button } from "./ui/button";
import Link from "next/link";
import AccessDenied from "./accessdenied";

export default function Layout() {
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();

  if (isAuthenticated === null) {
    return <p>loading...</p>;
  }

  // if (isAuthenticated) {
  //   return (
  //     <div className="flex items-center justify-center w-full">
  //       <div className="flex justify-center">
  //         <Card className="w-[380px]">
  //           <CardHeader>
  //             <CardTitle className="flex items-center gap-2 text-destructive">
  //               <AlertCircle className="h-5 w-5" />
  //               Access Denied
  //             </CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <p className="text-muted-foreground">
  //               You do not have permission to view this page.
  //             </p>
  //           </CardContent>
  //           <CardFooter>
  //             <Button asChild className="w-full">
  //               <Link href="/login">Go to Login</Link>
  //             </Button>
  //           </CardFooter>
  //         </Card>
  //       </div>
  //     </div>
  //   );
  // }

  if (!isAuthenticated) {
    return <AccessDenied />;
  }

  return (
    <div className="flex h-screen">
      <SideMenu />
    </div>
  );
}
