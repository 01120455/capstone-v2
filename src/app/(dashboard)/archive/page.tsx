"use client";

import { useCallback, useEffect, useState } from "react";
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
  // "Purchase Items",
];

const tableIcon = {
  Users: <UsersIcon />,
  Items: <BoxIcon />,
  // Sales: <TagIcon />,
  Purchases: <PurchaseIcon />,
  // Customers: <UserIcon />,
  // Suppliers: <TruckIcon />,
};

type ArchiveTableProps = {
  type: string;
  onRestore: (id: number, type: string | undefined) => void;
};

interface CombinedTransactionItem {
  documentNumber?: string;
  transactionitemid: number;
  transactionid: number;
  frommilling: boolean;
  status: "pending" | "paid" | "cancelled";
  Item: {
    itemtype: "bigas" | "palay" | "resico";
    itemname: string;
    sackweight: "bag25kg" | "cavan50kg";
    itemid?: number;
  };
  transactiontype: "purchases" | "sales";
  sackweight: "bag25kg" | "cavan50kg";
  unitofmeasurement: string;
  stock?: number;
  unitprice?: number;
  totalamount: number;
  lastmodifiedat?: Date;
}

const ROWS_PER_PAGE = 10;

const useUserFilters = () => {
  const [userFilters, setUserFilters] = useState({
    username: "",
    firstname: "",
    middlename: "",
    lastname: "",
    role: "",
    status: "",
  });

  const clearUser = () => {
    setUserFilters({
      username: "",
      firstname: "",
      middlename: "",
      lastname: "",
      role: "",
      status: "",
    });
  };

  return {
    userFilters,
    setUserFilters,
    clearUser,
  };
};

const useUsers = () => {
  const [users, setUsers] = useState<AddUser[] | null>(null);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(0);
  const { userFilters, setUserFilters, clearUser } = useUserFilters();

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchUsers = useCallback(
    async (page: number) => {
      if (isNaN(page) || page < 1) return;

      try {
        const params = new URLSearchParams({
          limit: ROWS_PER_PAGE.toString(),
          page: page.toString(),
        });

        if (userFilters.username) {
          params.append("username", userFilters.username);
        }
        if (userFilters.firstname) {
          params.append("firstname", userFilters.firstname);
        }
        if (userFilters.middlename) {
          params.append("midlename", userFilters.middlename);
        }
        if (userFilters.lastname) {
          params.append("lastname", userFilters.lastname);
        }
        if (userFilters.role) {
          params.append("role", userFilters.role);
        }
        if (userFilters.status) {
          params.append("status", userFilters.status);
        }

        const response = await fetch(
          `/api/archive/user/userpagination?${params}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const totalUsers = await fetch(`/api/user/userpagination`);

        const data = await response.json();
        setUsers(data);
        const totalRowsData = await totalUsers.json();
        setTotalUserPages(Math.ceil(totalRowsData.length / ROWS_PER_PAGE));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    [userFilters]
  );

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (
      userFilters.username ||
      userFilters.firstname ||
      userFilters.middlename ||
      userFilters.lastname
    ) {
      const timer = setTimeout(() => fetchUsers(currentUserPage), 1000);
      setDebounceTimeout(timer);
    } else {
      fetchUsers(currentUserPage);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [
    userFilters.username,
    userFilters.firstname,
    userFilters.middlename,
    userFilters.lastname,
    currentUserPage,
    fetchUsers,
  ]);

  const refreshUsers = () => {
    setUserFilters({
      username: "",
      firstname: "",
      middlename: "",
      lastname: "",
      role: "",
      status: "",
    });
    fetchUsers(currentUserPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentUserPage(page);
  };

  const clearUserFilters = () => {
    clearUser();
    fetchUsers(1);
  };

  return {
    users,
    currentUserPage,
    totalUserPages,
    handlePageChange,
    userFilters,
    setUserFilters,
    clearUserFilters,
    refreshUsers,
  };
};

const useItemFilters = () => {
  const [itemFilters, setItemFilters] = useState({
    name: "",
    type: "",
    sackweight: "",
    unitofmeasurement: "",
  });

  const clearItem = () => {
    setItemFilters({
      name: "",
      type: "",
      sackweight: "",
      unitofmeasurement: "",
    });
  };

  return {
    itemFilters,
    setItemFilters,
    clearItem,
  };
};

const useItems = () => {
  const [items, setItems] = useState<ViewItem[]>([]);
  const [currentItemPage, setCurrentItemPage] = useState(1);
  const [totalItemPages, setTotalItemPages] = useState(0);
  const { itemFilters, setItemFilters, clearItem } = useItemFilters();

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchItems = useCallback(
    async (page: number) => {
      if (isNaN(page) || page < 1) return;

      try {
        const params = new URLSearchParams({
          limit: ROWS_PER_PAGE.toString(),
          page: page.toString(),
        });

        if (itemFilters.name) {
          params.append("name", itemFilters.name);
        }
        if (itemFilters.type) {
          params.append("type", itemFilters.type);
        }
        if (itemFilters.sackweight) {
          params.append("sackweight", itemFilters.sackweight);
        }
        if (itemFilters.unitofmeasurement) {
          params.append("unitofmeasurement", itemFilters.unitofmeasurement);
        }

        const response = await fetch(
          `/api/archive/product/productpagination?${params}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const totalItems = await fetch(
          `/api/archive/product/productpagination`
        );

        const data = await response.json();
        setItems(data);
        const totalRowsData = await totalItems.json();
        setTotalItemPages(Math.ceil(totalRowsData.length / ROWS_PER_PAGE));
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    },
    [itemFilters]
  );

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (itemFilters.name) {
      const timer = setTimeout(() => fetchItems(currentItemPage), 1000);
      setDebounceTimeout(timer);
    } else {
      fetchItems(currentItemPage);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [itemFilters.name, currentItemPage, fetchItems]);

  const refreshItems = () => {
    setItemFilters({
      name: "",
      type: "",
      sackweight: "",
      unitofmeasurement: "",
    });
    fetchItems(currentItemPage);
  };

  const handleItemPageChange = (page: number) => {
    setCurrentItemPage(page);
  };

  const clearItemFilters = () => {
    clearItem();
    fetchItems(1);
  };

  return {
    items,
    currentItemPage,
    totalItemPages,
    handleItemPageChange,
    itemFilters,
    setItemFilters,
    clearItemFilters,
    refreshItems,
  };
};

const usePurchaseFilters = () => {
  const [purchaseFilters, setPurchaseFilters] = useState({
    purordno: "",
    name: "",
    frommilling: "",
    status: "",
    dateRange: { start: "", end: "" },
  });

  const clearPurchase = () => {
    setPurchaseFilters({
      purordno: "",
      name: "",
      frommilling: "",
      status: "",
      dateRange: { start: "", end: "" },
    });
  };

  return {
    purchaseFilters,
    setPurchaseFilters,
    clearPurchase,
  };
};

const usePurchases = () => {
  const { purchaseFilters, setPurchaseFilters, clearPurchase } =
    usePurchaseFilters();
  const [purchases, setPurchases] = useState<TransactionTable[]>([]);
  const [currentPurchasesPage, setCurrentPurchasesPage] = useState(1);
  const [totalPurchasesPages, setTotalPurchasesPages] = useState(0);

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchPurchases = useCallback(
    async (page: number) => {
      if (isNaN(page) || page < 1) return;

      try {
        const params = new URLSearchParams({
          limit: ROWS_PER_PAGE.toString(),
          page: page.toString(),
        });

        if (purchaseFilters.purordno) {
          params.append("documentnumber", purchaseFilters.purordno);
        }
        if (purchaseFilters.name) {
          params.append("name", purchaseFilters.name);
        }
        if (purchaseFilters.frommilling) {
          params.append("frommilling", purchaseFilters.frommilling);
        }
        if (purchaseFilters.status) {
          params.append("status", purchaseFilters.status);
        }
        if (purchaseFilters.dateRange.start) {
          params.append("startdate", purchaseFilters.dateRange.start);
        }
        if (purchaseFilters.dateRange.end) {
          params.append("enddate", purchaseFilters.dateRange.end);
        }

        const response = await fetch(
          `/api/archive/suppliertransaction/suppliertransactionpagination?${params}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setPurchases(data);

        const totalPurchasesResponse = await fetch(
          `/api/archive/suppliertransaction/suppliertransactionpagination`
        );
        const totalRowsData = await totalPurchasesResponse.json();
        setTotalPurchasesPages(Math.ceil(totalRowsData.length / ROWS_PER_PAGE));
      } catch (error) {
        console.error("Error fetching purchases:", error);
      }
    },
    [purchaseFilters]
  );

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const shouldDebounce = purchaseFilters.purordno || purchaseFilters.name;

    if (shouldDebounce) {
      const timer = setTimeout(
        () => fetchPurchases(currentPurchasesPage),
        2000
      );
      setDebounceTimeout(timer);
    } else {
      fetchPurchases(currentPurchasesPage);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [
    purchaseFilters.purordno,
    purchaseFilters.name,
    currentPurchasesPage,
    fetchPurchases,
  ]);

  const refreshPurchases = () => {
    setPurchaseFilters({
      purordno: "",
      name: "",
      frommilling: "",
      status: "",
      dateRange: { start: "", end: "" },
    });
    fetchPurchases(currentPurchasesPage);
  };

  const handlePurchasesPageChange = (page: number) => {
    setCurrentPurchasesPage(page);
  };

  const clearPurchasesFilters = () => {
    clearPurchase();
    fetchPurchases(1);
  };

  return {
    purchases,
    currentPurchasesPage,
    totalPurchasesPages,
    handlePurchasesPageChange,
    purchaseFilters,
    setPurchaseFilters,
    refreshPurchases,
    clearPurchasesFilters,
  };
};

const usePurchaseItems = () => {
  const [purchaseItems, setPurchaseItems] = useState<TransactionItem[]>([]);

  const viewPurchaseItems = async (purchaseId: number) => {
    try {
      const response = await fetch(
        `/api/transactionitem/purchaseitem/${purchaseId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const items = await response.json();
      // Assuming you have a setPurchaseItems function to set the items state
      setPurchaseItems(items);
    } catch (error) {
      console.error("Error fetching purchase items:", error);
    }
  };

  return {
    purchaseItems,
    setPurchaseItems,
    viewPurchaseItems,
  };
};

const useTransactionItems = () => {
  const {
    purchaseFilters: filters2,
    setPurchaseFilters: setFilters2,
    clearPurchase: clear2,
  } = usePurchaseFilters();
  const [transactionItem, setTransactionItem] = useState<
    CombinedTransactionItem[]
  >([]);
  const [currentTransactionItemsPage, setCurrentTransactionItemsPage] =
    useState(1);
  const [totalTransactionItemsPages, setTotalTransactionItemsPages] =
    useState(0);

  const fetchTransactionData = useCallback(
    async (page: number) => {
      if (isNaN(page) || page < 1) return;

      try {
        const params = new URLSearchParams({
          limit: ROWS_PER_PAGE.toString(),
          page: page.toString(),
        });

        if (filters2.purordno) {
          params.append("documentnumber", filters2.purordno);
        }
        if (filters2.name) {
          params.append("name", filters2.name);
        }
        if (filters2.status) {
          params.append("status", filters2.status);
        }
        if (filters2.dateRange.start) {
          params.append("startdate", filters2.dateRange.start);
        }
        if (filters2.dateRange.end) {
          params.append("enddate", filters2.dateRange.end);
        }

        const transactionsResponse = await fetch(
          `/api/archive/suppliertransaction/suppliertransactionpagination?${params}`
        );
        if (!transactionsResponse.ok) {
          throw new Error(`HTTP error! status: ${transactionsResponse.status}`);
        }
        const transactions: any[] = await transactionsResponse.json();

        const transactionItemsResponse = await fetch(
          "/api/archive/transactionitem"
        );
        if (!transactionItemsResponse.ok) {
          throw new Error(
            `HTTP error! status: ${transactionItemsResponse.status}`
          );
        }
        const allTransactionItems: TransactionItem[] =
          await transactionItemsResponse.json();

        const transactionMap = new Map<number, any>();
        transactions.forEach((transaction) => {
          transactionMap.set(transaction.transactionid, {
            documentNumber: transaction.DocumentNumber?.documentnumber,
            frommilling: transaction.frommilling,
            transactiontype: transaction.transactiontype,
            status: transaction.status,
          });
        });

        const combinedData: CombinedTransactionItem[] = allTransactionItems
          .map((item) => {
            const transactionInfo =
              transactionMap.get(item.transactionid) || {};
            return {
              ...item,
              documentNumber: transactionInfo.documentNumber,
              frommilling: transactionInfo.frommilling || false,
              transactiontype: transactionInfo.transactiontype || "otherType",
              status: transactionInfo.status || "otherStatus",
            };
          })
          .filter((item) => item.documentNumber !== undefined);

        setTransactionItem(combinedData);

        const totalResponse = await fetch(
          `/api/suppliertransaction/suppliertransactionpagination`
        );
        const totalData = await totalResponse.json();
        setTotalTransactionItemsPages(
          Math.ceil(totalData.length / ROWS_PER_PAGE)
        );
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      }
    },
    [filters2]
  );

  useEffect(() => {
    const fetchData = async () => {
      await fetchTransactionData(currentTransactionItemsPage);
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [filters2, currentTransactionItemsPage, fetchTransactionData]);

  const clearFilters2 = () => {
    clear2();
    fetchTransactionData(1);
  };

  const handleTransactionItemsPageChange = (page: number) => {
    setCurrentTransactionItemsPage(page);
  };

  const refreshTransactionItems = async () => {
    await fetchTransactionData(currentTransactionItemsPage);
  };

  return {
    transactionItem,
    currentTransactionItemsPage,
    totalTransactionItemsPages,
    handleTransactionItemsPageChange,
    filters: filters2,
    setFilters: setFilters2,
    refreshTransactionItems,
    clearFilters2,
  };
};

function ArchiveTable({ type, onRestore }: ArchiveTableProps) {
  const {
    users,
    currentUserPage,
    totalUserPages,
    handlePageChange,
    userFilters,
    setUserFilters,
    clearUserFilters,
    refreshUsers,
  } = useUsers();
  const {
    items,
    currentItemPage,
    totalItemPages,
    handleItemPageChange,
    itemFilters,
    setItemFilters,
    clearItemFilters,
    refreshItems,
  } = useItems();
  const {
    purchases,
    currentPurchasesPage,
    totalPurchasesPages,
    handlePurchasesPageChange,
    purchaseFilters,
    setPurchaseFilters,
    refreshPurchases,
    clearPurchasesFilters,
  } = usePurchases();
  const { purchaseItems, setPurchaseItems, viewPurchaseItems } =
    usePurchaseItems();
  const {
    transactionItem,
    currentTransactionItemsPage,
    totalTransactionItemsPages,
    handleTransactionItemsPageChange,
    filters: filters2,
    setFilters: setFilters2,
    refreshTransactionItems,
    clearFilters2,
  } = useTransactionItems();

  switch (type) {
    case "users":
      return (
        <UserTable
          users={users}
          onRestore={onRestore}
          filters={userFilters}
          setFilters={setUserFilters}
          currentPage={currentUserPage}
          totalPages={totalUserPages}
          handlePageChange={handlePageChange}
          clearFilters={clearUserFilters}
        />
      );
    case "items":
      return (
        <ItemTable
          items={items}
          onRestore={onRestore}
          filters={itemFilters}
          setFilters={setItemFilters}
          currentPage={currentItemPage}
          totalPages={totalItemPages}
          handlePageChange={handleItemPageChange}
          clearFilters={clearItemFilters}
        />
      );
    case "purchases":
      return (
        <PurchaseTable
          purchases={purchases}
          onRestore={onRestore}
          filters={purchaseFilters}
          setFilters={setPurchaseFilters}
          currentPage={currentPurchasesPage}
          totalPages={totalPurchasesPages}
          handlePageChange={handlePurchasesPageChange}
          clearFilters={clearPurchasesFilters}
          transactionItem={transactionItem}
          currentTransactionItemsPage={currentTransactionItemsPage}
          totalTransactionItemsPages={totalTransactionItemsPages}
          handleTransactionItemsPageChange={handleTransactionItemsPageChange}
          filters2={filters2}
          setFilters2={setFilters2}
          clearFilters2={clearFilters2}
        />
      );
    default:
      return null;
  }
}

export default function ArchivePage() {
  const [activeTab, setActiveTab] = useState("Users");
  const { users, refreshUsers } = useUsers();
  const { items, refreshItems } = useItems();
  const { purchases, refreshPurchases } = usePurchases();
  const { transactionItem, refreshTransactionItems } = useTransactionItems();

  const handleRestore = async (id: number, type: string | undefined) => {
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
      case "Purchases":
        if (type === "purchase") {
          endpoint = `/api/archive/suppliertransaction/restore/${id}`;
        } else if (type === "purchaseItem") {
          endpoint = `/api/archive/suppliertransactionitem/restore/${id}`;
        } else {
          console.error("Invalid type for Purchases");
          return;
        }
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

      if (response.ok && activeTab === "Users") {
        refreshUsers();
        toast.success(
          `Deleted user ${""} ${
            users?.find((u) => u.userid === id)?.username
          } ${""} has been restored`,
          {
            description: "You have successfully restored user data.",
          }
        );
      }

      if (response.ok && activeTab === "Items") {
        refreshItems();
        toast.success(
          `Deleted item ${""} ${
            items?.find((u) => u.itemid === id)?.itemname
          } ${""} has been restored`,
          {
            description: "You have successfully restored item data.",
          }
        );
      }

      if (response.ok && activeTab === "Purchases" && type === "purchase") {
        refreshPurchases();
        toast.success(
          `Deleted Purchase Order No. ${""} ${
            purchases?.find((u) => u.transactionid === id)?.DocumentNumber
              .documentnumber
          } ${""} has been restored`,
          {
            description: "You have successfully restored Purchase Order data.",
          }
        );
      }

      if (response.ok && activeTab === "Purchases" && type === "purchaseItem") {
        refreshTransactionItems();
        toast.success(
          `Deleted Purchase Item ${""} ${
            transactionItem?.find((u) => u.Item.itemid === id)?.Item.itemname
          } ${""} has been restored`,
          {
            description: "You have successfully restored Purchase Item data.",
          }
        );
      }

      const data = await response.json();
      console.log(`${activeTab} restored:`, data);
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
              <TabsList className="grid h-12 w-full grid-cols-3">
                {Object.entries(tableIcon).map(([key, Icon]) => (
                  <TabsTrigger key={key} value={key}>
                    {Icon}
                  </TabsTrigger>
                ))}
              </TabsList>
            ) : (
              <TabsList className="grid w-full grid-cols-3">
                {tables.map((table) => (
                  <TabsTrigger key={table} value={table}>
                    {table}
                  </TabsTrigger>
                ))}
              </TabsList>
            )}
            <div className="mt-4 mb-4"></div>

            {tables.map((table) => (
              <TabsContent key={table} value={table}>
                <ArchiveTable
                  type={table.toLowerCase()}
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
