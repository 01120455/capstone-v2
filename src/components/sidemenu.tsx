"use client";
import { useState } from "react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function SideMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-white shadow-lg lg:w-64">
      <div className="flex items-center justify-between p-4 border-b">
        <button className="lg:hidden text-gray-500" onClick={toggleMenu}>
          <MenuIcon className="w-6 h-6" />
        </button>
        <span className="text-lg font-semibold hidden lg:block">Point of Sale</span>
      </div>
      <div
        className={`flex flex-col flex-grow overflow-auto lg:block ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
      <nav className="mt-4 space-y-1">
        <Link
          className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
          href="#"
          prefetch={false}
        >
          <LayoutDashboardIcon className="inline-block w-6 h-6 mr-3" />
          <span>Dashboard</span>
        </Link>
        <Link
          className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
          href="#"
          prefetch={false}
        >
          <BoxIcon className="inline-block w-6 h-6 mr-3" />
          <span>Product</span>
        </Link>
        <Link
          className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
          href="#"
          prefetch={false}
        >
          <DollarSignIcon className="inline-block w-6 h-6 mr-3" />
          <span>Sales</span>
        </Link>
        <Link
          className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
          href="#"
          prefetch={false}
        >
          <UserIcon className="inline-block w-6 h-6 mr-3" />
          <span>Customer</span>
        </Link>
        <Link
          className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
          href="#"
          prefetch={false}
        >
          <TruckIcon className="inline-block w-6 h-6 mr-3" />
          <span>Supplier</span>
        </Link>
        <Link
          className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
          href="#"
          prefetch={false}
        >
          <CalendarIcon className="inline-block w-6 h-6 mr-3" />
          <span>Sales History</span>
        </Link>
        <Link
          className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
          href="#"
          prefetch={false}
        >
          <UsersIcon className="inline-block w-6 h-6 mr-3" />
          <span>User</span>
        </Link>
        <div className="flex items-center p-3 space-x-3">
          <MoonIcon className="inline-block w-6 h-6" />
          <span>Dark mode</span>
          <Switch id="dark-mode-toggle" className="ml-auto" />
        </div>
      </nav>
      <div className="flex items-center p-4 space-x-3 border-t">
        <Avatar>
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <span className="block text-sm font-medium text-gray-800">
            Username
          </span>
          <span className="block text-xs text-gray-500">
            username@example.com
          </span>
        </div>
      </div>
      </div>
    </div>
  );
}

function BoxIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function CalendarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function DollarSignIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function LayoutDashboardIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function MoonIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function PlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function TruckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function UsersIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
