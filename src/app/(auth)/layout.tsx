import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster />
      <main className="bg-customColors-lightPastelGreen">{children}</main>
    </>
  );
}
