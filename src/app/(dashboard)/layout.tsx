import SideMenu from "@/components/sidemenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SideMenu />
      <main className="ml-16 lg:ml-52">{children}</main>
    </>
  );
}
