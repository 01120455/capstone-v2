import { UserProvider } from "@/components/sessionContext-provider";
import SideMenu from "@/components/sidemenu";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UserProvider>
        <SideMenu />
        <Toaster />
        <main className="ml-16 lg:ml-52">{children}</main>
      </UserProvider>
    </>
  );
}
