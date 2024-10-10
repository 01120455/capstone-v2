"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PurchaseIcon,
  TagIcon,
  TruckIcon,
  UserIcon,
  BoxIcon,
  UsersIcon,
} from "@/components/icons/Icons";
import { AddUser, user } from "@/schemas/User.schema";
import { Entity } from "@/schemas/entity.schema";
import { TransactionTable } from "@/schemas/transaction.schema";
import { ViewItem } from "@/schemas/item.schema";
import { UserTable } from "./tables/usertable/page";
import { ItemTable } from "./tables/itemtable/page";
import { SalesTable } from "./tables/salestable/page";
import { PurchaseTable } from "./tables/purchasetable/page";
import { CustomersTable } from "./tables/customertable/page";
import { SuppliersTable } from "./tables/suppliertable/page";
import { get } from "lodash";

const tables = [
  "Users",
  "Items",
  "Sales",
  "Purchases",
  "Customers",
  "Suppliers",
];

const tableIcon = {
  Users: <UsersIcon />,
  Items: <BoxIcon />,
  Sales: <TagIcon />,
  Purchases: <PurchaseIcon />,
  Customers: <UserIcon />,
  Suppliers: <TruckIcon />,
};

export default function ArchivePage() {
  const [activeTab, setActiveTab] = useState("Users");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRestore = async (id: number) => {
    console.log(`Restore item with id: ${id} in tab: ${activeTab}`);

    if (id <= 0) {
      console.error("Invalid ID");
      return;
    }

    let endpoint = "";

    switch (activeTab) {
      case "Users":
        endpoint = `/api/archive/user/restore/${id}`;
        break;
      case "Items":
        endpoint = `/api/archive/product/restore/${id}`;
        break;
      case "Sales":
        endpoint = `/api/archive/customertransaction/restore/${id}`;
        break;
      case "Purchases":
        endpoint = `/api/archive/suppliertransaction/restore/${id}`;
        break;
      case "Customers":
        endpoint = `/api/archive/customer/restore/${id}`;
        break;
      case "Suppliers":
        endpoint = `/api/archive/supplier/restore/${id}`;
        break;
      default:
        console.error("Invalid active tab");
        return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to restore item");
      }

      const data = await response.json();
      console.log(`${activeTab} restored:`, data);
      // Optionally, update local state or UI
    } catch (error) {
      console.error("Error restoring item:", error);
    }
  };

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 576);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Archive</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {isSmallScreen ? (
          <TabsList className="grid h-12 w-full grid-cols-6">
            {Object.entries(tableIcon).map(([key, Icon]) => (
              <TabsTrigger key={key} value={key}>
                {Icon}
              </TabsTrigger>
            ))}
          </TabsList>
        ) : (
          <TabsList className="grid w-full grid-cols-6">
            {tables.map((table) => (
              <TabsTrigger key={table} value={table}>
                {table}
              </TabsTrigger>
            ))}
          </TabsList>
        )}
        <div className="mt-4 mb-4">
          <div className="relative w-full">
            <Input
              placeholder="Search archived items..."
              value={searchTerm}
              onChange={handleSearch}
              className="max-w-sm"
            />
          </div>
        </div>

        {tables.map((table) => (
          <TabsContent key={table} value={table}>
            <ArchiveTable
              type={table.toLowerCase()}
              searchTerm={searchTerm}
              onRestore={handleRestore}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

type ArchiveTableProps = {
  type: string;
  searchTerm: string;
  onRestore: (id: number) => void;
};

function ArchiveTable({ type, searchTerm, onRestore }: ArchiveTableProps) {
  const [users, setUsers] = useState<AddUser[] | null>(null);
  const [customers, setCustomers] = useState<Entity[]>([]);
  const [suppliers, setSuppliers] = useState<Entity[]>([]);
  const [sales, setSales] = useState<TransactionTable[]>([]);
  const [purchases, setPurchases] = useState<TransactionTable[]>([]);
  const [items, setItems] = useState<ViewItem[]>([]);

  useEffect(() => {
    async function getUsers() {
      try {
        const response = await fetch("/api/archive/user");
        if (response.ok) {
          const users = await response.json();
          setUsers(users); // Set the fetched users
        } else {
          console.error("Error fetching users:", response.status);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    getUsers();
  }, []);

  useEffect(() => {
    const getCustomers = async () => {
      try {
        const response = await fetch("/api/archive/customer");
        const text = await response.text();
        console.log("Raw Response Text:", text);

        const data = JSON.parse(text);

        // Convert date strings to Date objects
        const parsedData = data.map((item: any) => {
          return {
            ...item,
            createdat: item.createdat ? new Date(item.createdat) : null,
            lastmodifiedat: item.lastmodifiedat
              ? new Date(item.lastmodifiedat)
              : null,
            taxamount: item.taxamount ? parseFloat(item.taxamount) : null,
          };
        });

        console.log("Parsed Data with Date Conversion:", parsedData);

        setCustomers(parsedData);
      } catch (error) {
        console.error("Error in getPurchases:", error);
      }
    };

    getCustomers();
  }, []);

  useEffect(() => {
    const getSuppliers = async () => {
      try {
        const response = await fetch("/api/archive/supplier");
        const text = await response.text();
        console.log("Raw Response Text:", text);

        const data = JSON.parse(text);

        const parsedData = data.map((item: any) => {
          return {
            ...item,
            createdat: item.createdat ? new Date(item.createdat) : null,
            lastmodifiedat: item.lastmodifiedat
              ? new Date(item.lastmodifiedat)
              : null,
            taxamount: item.taxamount ? parseFloat(item.taxamount) : null,
          };
        });

        console.log("Parsed Data with Date Conversion:", parsedData);

        setSuppliers(parsedData);
      } catch (error) {
        console.error("Error in getPurchases:", error);
      }
    };

    getSuppliers();
  }, []);

  useEffect(() => {
    const getSales = async () => {
      try {
        const response = await fetch("/api/archive/customertransaction");
        const text = await response.text();
        // console.log("Raw Response Text:", text);

        const data = JSON.parse(text);

        const parsedData = data.map((item: any) => {
          return {
            ...item,
            createdat: item.createdat ? new Date(item.createdat) : null,
            lastmodifiedat: item.lastmodifiedat
              ? new Date(item.lastmodifiedat)
              : null,
            taxamount: item.taxamount ? parseFloat(item.taxamount) : null,
          };
        });

        // console.log("Parsed Data with Date Conversion:", parsedData);

        // console.log("Parsed Data:", parsedData);
        setSales(parsedData);

        console.log("Sales:", parsedData);
      } catch (error) {
        console.error("Error in getPurchases:", error);
      }
    };

    getSales();
  }, []);

  useEffect(() => {
    const getPurchases = async () => {
      try {
        const response = await fetch("/api/archive/suppliertransaction");
        const text = await response.text();
        // console.log("Raw Response Text:", text);

        const data = JSON.parse(text);

        // Convert date strings to Date objects
        const parsedData = data.map((item: any) => {
          return {
            ...item,
            createdat: item.createdat ? new Date(item.createdat) : null,
            lastmodifiedat: item.lastmodifiedat
              ? new Date(item.lastmodifiedat)
              : null,
            taxamount: item.taxamount ? parseFloat(item.taxamount) : null,
          };
        });

        // console.log("Parsed Data with Date Conversion:", parsedData);

        // console.log("Parsed Data:", parsedData);
        setPurchases(parsedData);
      } catch (error) {
        console.error("Error in getPurchases:", error);
      }
    };

    getPurchases();
  }, []);

  useEffect(() => {
    async function getItems() {
      try {
        const response = await fetch("/api/archive/product");
        if (response.ok) {
          const items = await response.json();
          setItems(items);
        } else {
          console.error("Error fetching items:", response.status);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    }
    getItems();
  }, []);

  // Render the corresponding table based on the type
  switch (type) {
    case "users":
      return (
        <UserTable
          users={users}
          searchTerm={searchTerm}
          onRestore={onRestore}
        />
      );
    case "items":
      return (
        <ItemTable
          items={items}
          searchTerm={searchTerm}
          onRestore={onRestore}
        />
      );
    case "sales":
      return (
        <SalesTable
          sales={sales}
          searchTerm={searchTerm}
          onRestore={onRestore}
        />
      );
    case "purchases":
      return (
        <PurchaseTable
          purchases={purchases}
          searchTerm={searchTerm}
          onRestore={onRestore}
        />
      );
    case "customers":
      return (
        <CustomersTable
          customers={customers}
          searchTerm={searchTerm}
          onRestore={onRestore}
        />
      );
    case "suppliers":
      return (
        <SuppliersTable
          suppliers={suppliers}
          searchTerm={searchTerm}
          onRestore={onRestore}
        />
      );
    default:
      return null;
  }
}
