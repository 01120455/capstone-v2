import Link from "next/link";
import { AlertCircle } from "./icons/Icons";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useRouter } from "next/navigation";

export default function AccessDenied() {
    const router = useRouter();
  return (
    <div className="flex h-screen">
      <div className="flex items-center justify-center w-full">
        <div className="flex justify-center">
          <Card className="w-[400px]">
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
            <CardFooter className="flex justify-between">
              <Button
                onClick={() => router.back()}
                variant="secondary"
                className="max-w-lg"
              >
                Go Back
              </Button>
              <Button asChild className="max-w-lg">
                <Link href="/login">Go to Login</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
