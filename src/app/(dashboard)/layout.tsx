import { UserProvider } from "@/components/sessionContext-provider";
import SideMenu from "@/components/sidemenu";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <UserProvider>
          <SideMenu />
          <Toaster />
          <main className="w-full bg-customColors-lightPastelGreen">
            <SidebarTrigger className="-ml-1" />
            {children}
          </main>
        </UserProvider>
      </SidebarProvider>
    </>
  );
}
