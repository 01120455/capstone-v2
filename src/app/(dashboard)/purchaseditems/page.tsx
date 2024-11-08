"use client";

import { useContext, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTransactionItems } from "@/hooks/usetransactionitems";
import PurchaseItemsTable from "./tables/purchaseditemtable/purchaseditemstable";
import { userSessionContext } from "@/components/sessionContext-provider";

export default function PurchaseItemsTabs() {
  const user = useContext(userSessionContext);
  const [activeTab, setActiveTab] = useState<"milling" | "non-milling">(
    "milling"
  );
  const {
    transactionItem,
    currentTransactionItemsPage,
    totalTransactionItemsPages,
    handleTransactionItemsPageChange,
    filters,
    setFilters,
    clearFilters,
  } = useTransactionItems();

  const millingItems = transactionItem.filter((item) => item.frommilling);
  const nonMillingItems = transactionItem.filter((item) => !item.frommilling);

  return (
    <div className="flex min-h-screen w-full bg-customColors-lightPastelGreen">
      <div className="flex-1 overflow-y-auto pl-6 pr-6 w-full">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <h1 className="text-2xl font-bold text-customColors-eveningSeaGreen mb-6">
            List of Purchase Items
          </h1>
          <Tabs
            defaultValue="milling"
            onValueChange={(value) =>
              setActiveTab(value as "milling" | "non-milling")
            }
          >
            <TabsList>
              <TabsTrigger value="milling">Milling Items</TabsTrigger>
              <TabsTrigger value="non-milling">Non-Milling Items</TabsTrigger>
            </TabsList>
            <TabsContent value="milling">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <PurchaseItemsTable
                  transactionItems={millingItems}
                  currentPage={currentTransactionItemsPage}
                  totalPages={totalTransactionItemsPages}
                  onPageChange={handleTransactionItemsPageChange}
                  filters={filters}
                  setFilters={setFilters}
                  clearFilters={clearFilters}
                  userRole={user?.role || ""}
                />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="non-milling">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <PurchaseItemsTable
                  transactionItems={nonMillingItems}
                  currentPage={currentTransactionItemsPage}
                  totalPages={totalTransactionItemsPages}
                  onPageChange={handleTransactionItemsPageChange}
                  filters={filters}
                  setFilters={setFilters}
                  clearFilters={clearFilters}
                  userRole={user?.role || ""}
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
