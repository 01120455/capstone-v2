// import type { Metadata } from "next";
// import { Inter as FontSans } from "next/font/google";
// import "./globals.css";
// import { cn } from "@/lib/utils";
// import SideMenu from "@/components/sidemenu";
// import Layout from "@/components/layout";

// const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" });

// export const metadata: Metadata = {
//   title: "3R Shane",
//   description: "Rice Mill Inventory Management System",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={cn(
//           "min-h-screen bg-background font-inter antialiased",
//           fontSans.variable
//         )}
//       >
//         <div className="flex h-screen">
//           <SideMenu />
//           {children}
//         </div>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import SideMenu from "@/components/sidemenu";
import { ReactNode } from "react";

const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "3R Shane",
  description: "Rice Mill Inventory Management System",
};

export default function RootLayout({
  children,
  pathname, // Accept pathname as a prop
}: {
  children: ReactNode;
  pathname: string; // Define the type for pathname
}) {
  // Check if the current path is '/accessdenied'
  const isAccessDeniedPage = pathname === "/accessdenied";

  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-inter antialiased",
          fontSans.variable
        )}
      >
        {!isAccessDeniedPage ? (
          <div className="flex h-screen">
            <SideMenu />
            {children}
          </div>
        ) : (
          <div>{children}</div> // Render only children for the access denied page
        )}
      </body>
    </html>
  );
}
