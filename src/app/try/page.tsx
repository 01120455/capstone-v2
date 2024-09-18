// pages/protected-page.tsx
"use client";
import { useAuth } from "../../utils/hooks/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "@/components/icons/Icons";
import Link from "next/link";

export default function ProtectedPage() {
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();

  if (isAuthenticated === null) {
    // Show a loading state while checking authentication
    return <p>Loading...</p>;
  }

  // if (isAuthenticated === false) {
  //   return null; // Prevent showing the page while redirecting
  // }

  // Role-based access control
  if (userRole === "admin" || userRole === "manager") {
    return (
      <div>
        <h1>Welcome Admin</h1>
        <p>This is a protected page for admins.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You do not have permission to view this page.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
