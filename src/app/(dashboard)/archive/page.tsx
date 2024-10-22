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
import {
  TransactionItem,
  TransactionTable,
} from "@/schemas/transaction.schema";
import { ViewItem } from "@/schemas/item.schema";
import { UserTable } from "./tables/usertable/page";
import { ItemTable } from "./tables/itemtable/page";
import { SalesTable } from "./tables/salestable/page";
import { PurchaseTable } from "./tables/purchasetable/page";
import { get } from "lodash";
import { PurchaseItemTable } from "./tables/purchaseitemtable/page";
import { toast } from "sonner";

const tables = [
  "Users",
  "Items",
  // "Sales",
  "Purchases",
  "Purchase Items",
];

const tableIcon = {
  Users: <UsersIcon />,
  Items: <BoxIcon />,
  // Sales: <TagIcon />,
  Purchases: <PurchaseIcon />,
  // Customers: <UserIcon />,
  // Suppliers: <TruckIcon />,
};

interface CombinedTransactionItem {
  documentNumber?: string;
  transactionitemid: number;
  transactionid: number;
  status: "pending" | "paid" | "cancelled";
  Item: {
    type: "bigas" | "palay" | "resico";
    name: string;
    sackweight: "bag25kg" | "cavan50kg";
    itemid?: number;
  };
  type: "purchases" | "sales";
  sackweight: "bag25kg" | "cavan50kg";
  unitofmeasurement: string;
  measurementvalue?: number;
  unitprice?: number;
  totalamount: number;
  lastmodifiedat?: Date;
  recentdelete: boolean | undefined;
}

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
        toast.success(`Deleted user has been restored`, {
          description: "You have successfully restore user data.",
        });
        break;
      case "Items":
        endpoint = `/api/archive/product/restore/${id}`;
        toast.success(`Deleted item has been restored`, {
          description: "You have successfully restore item data.",
        });
        break;
      // case "Sales":
      //   endpoint = `/api/archive/customertransaction/restore/${id}`;
      //   break;
      case "Purchases":
        endpoint = `/api/archive/suppliertransaction/restore/${id}`;
        toast.success(`Deleted Purchase Order has been restored`, {
          description: "You have successfully restore Purchase Order data.",
        });
        break;
      // case "Customers":
      //   endpoint = `/api/archive/customer/restore/${id}`;
      //   break;
      // case "Suppliers":
      //   endpoint = `/api/archive/supplier/restore/${id}`;
      //   break;
      case "Purchase Items":
        endpoint = `/api/archive/suppliertransactionitem/restore/${id}`;
        toast.success(`Deleted purchase order item has been restored`, {
          description:
            "You have successfully restore purchase order item data.",
        });
        break;
      default:
        console.error("Invalid active tab");
        return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
      });

      if (response.ok) {
        console.log("Item restored successfully");
      }

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
    <div className="flex h-screen w-full bg-customColors-offWhite">
      <div className="flex-1 overflow-y-hidden p-5 w-full">
        <div className="container mx-auto py-10 bg-customColors-offWhite">
          <h1 className="text-3xl text-customColors-darkKnight font-bold mb-6">
            Archive
          </h1>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {isSmallScreen ? (
              <TabsList className="grid h-12 w-full grid-cols-5">
                {Object.entries(tableIcon).map(([key, Icon]) => (
                  <TabsTrigger key={key} value={key}>
                    {Icon}
                  </TabsTrigger>
                ))}
              </TabsList>
            ) : (
              <TabsList className="grid w-full grid-cols-4">
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
      </div>
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
  // const [sales, setSales] = useState<TransactionTable[]>([]);
  const [purchases, setPurchases] = useState<TransactionTable[]>([]);
  const [transactionItem, setTransactionItem] = useState<
    CombinedTransactionItem[]
  >([]);
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

  // useEffect(() => {
  //   const getSales = async () => {
  //     try {
  //       const response = await fetch("/api/archive/customertransaction");
  //       const text = await response.text();
  //       // console.log("Raw Response Text:", text);

  //       const data = JSON.parse(text);

  //       const parsedData = data.map((item: any) => {
  //         return {
  //           ...item,
  //           createdat: item.createdat ? new Date(item.createdat) : null,
  //           lastmodifiedat: item.lastmodifiedat
  //             ? new Date(item.lastmodifiedat)
  //             : null,
  //           taxamount: item.taxamount ? parseFloat(item.taxamount) : null,
  //         };
  //       });

  //       // console.log("Parsed Data with Date Conversion:", parsedData);

  //       // console.log("Parsed Data:", parsedData);
  //       setSales(parsedData);

  //       console.log("Sales:", parsedData);
  //     } catch (error) {
  //       console.error("Error in getPurchases:", error);
  //     }
  //   };

  //   getSales();
  // }, []);

  useEffect(() => {
    const getPurchases = async () => {
      try {
        const response = await fetch("/api/archive/suppliertransaction");
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
        setPurchases(parsedData);
      } catch (error) {
        console.error("Error in getPurchases:", error);
      }
    };

    getPurchases();
  }, []);

  const fetchTransactionData = async (): Promise<CombinedTransactionItem[]> => {
    const transactionsResponse = await fetch(
      "/api/archive/suppliertransactionitem"
    );
    if (!transactionsResponse.ok)
      throw new Error("Failed to fetch transactions");
    const transactions: any[] = await transactionsResponse.json();
    console.log("Transactions:", transactions);

    const transactionItemsResponse = await fetch(
      "/api/archive/transactionitem"
    );
    if (!transactionItemsResponse.ok)
      throw new Error("Failed to fetch transaction items");
    const transactionItems: TransactionItem[] =
      await transactionItemsResponse.json();
    console.log("Transaction Items:", transactionItems);

    const transactionMap = new Map<number, any>();
    transactions.forEach((transaction) => {
      transactionMap.set(transaction.transactionid, {
        documentNumber: transaction.DocumentNumber?.documentnumber,
        type: transaction.type,
        status: transaction.status,
      });
    });
    console.log("Transaction Map:", Array.from(transactionMap.entries()));

    const combinedData: CombinedTransactionItem[] = transactionItems.map(
      (item) => {
        const transactionInfo = transactionMap.get(item.transactionid) || {};

        const combinedItem = {
          ...item,
          documentNumber: transactionInfo.documentNumber,
          type: transactionInfo.type || "otherType",
          status: transactionInfo.status || "otherStatus",
          // Use the recentdelete attribute directly from the item
          recentdelete: item.recentdelete,
        };

        console.log("Combined Item:", combinedItem); // Log each combined item
        return combinedItem;
      }
    );

    // Filter out items with undefined documentNumber and only include recent deletes
    const filteredData = combinedData.filter(
      (item) => item.documentNumber !== undefined && item.recentdelete == true
    );
    console.log("Filtered Data (recent deletes only):", filteredData); // Log the filtered data

    return filteredData;
  };

  useEffect(() => {
    const getData = async () => {
      const combinedData = await fetchTransactionData();
      setTransactionItem(combinedData);
    };

    getData();
  }, []);

  console.log("Transaction Item:", transactionItem);

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
    // case "sales":
    //   return (
    //     <SalesTable
    //       sales={sales}
    //       searchTerm={searchTerm}
    //       onRestore={onRestore}
    //     />
    //   );
    case "purchases":
      return (
        <PurchaseTable
          purchases={purchases}
          searchTerm={searchTerm}
          onRestore={onRestore}
        />
      );
    case "purchase items":
      return (
        <PurchaseItemTable
          purchases={transactionItem}
          searchTerm={searchTerm}
          onRestore={onRestore}
        />
      );
    default:
      return null;
  }
}
