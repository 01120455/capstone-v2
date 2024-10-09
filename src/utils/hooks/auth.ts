// hooks/useAuth.ts
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  // const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simulate a request to your API or check localStorage/cookies for auth
        const session = await fetch("/api/auth/session");
        const data = await session.json();

        // Check if the user is logged in and has a valid role
        if (
          data?.isLoggedIn &&
          ["admin", "manager", "sales", "inventory"].includes(data.role)
        ) {
          setIsAuthenticated(true);
          // setIsLoggedIn(true);
          setUserRole(data.role);
        } else {
          setIsAuthenticated(false);
          // setIsLoggedIn(false);
          // router.push("/login"); // Redirect to login if not authenticated
        }
      } catch (error) {
        console.error("Error checking authentication", error);
        setIsAuthenticated(false);
        // setIsLoggedIn(false);
        // router.push("/login"); // Redirect on error
      }
    };

    checkAuth();
  }, [router]);

  return { isAuthenticated, userRole };
}
