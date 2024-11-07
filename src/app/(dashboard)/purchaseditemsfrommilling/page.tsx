"use client";

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  TransactionItem,
  TransactionTable,
} from "@/schemas/transaction.schema";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { XIcon, ArrowRightIcon, FilterIcon } from "@/components/icons/Icons";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "@/interfaces/user";
import { userSessionContext } from "@/components/sessionContext-provider";

const ROLES = {
  SALES: "sales",
  INVENTORY: "inventory",
  MANAGER: "manager",
  ADMIN: "admin",
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
  stock: number;
  unitprice: number;
  totalamount: number;
  lastmodifiedat?: Date;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const ROWS_PER_PAGE = 10;

const useFilters = () => {
  const [filters, setFilters] = useState({
    purordno: "",
    name: "",
    frommilling: "",
    status: "",
    dateRange: { start: "", end: "" },
  });

  const clear = () => {
    setFilters({
      purordno: "",
      name: "",
      frommilling: "",
      status: "",
      dateRange: { start: "", end: "" },
    });
  };

  return {
    filters,
    setFilters,
    clear,
  };
};

const useTransactionItems = () => {
  const { filters, setFilters, clear } = useFilters();
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

        if (filters.purordno) {
          params.append("documentnumber", filters.purordno);
        }
        if (filters.name) {
          params.append("name", filters.name);
        }
        if (filters.status) {
          params.append("status", filters.status);
        }
        if (filters.dateRange.start) {
          params.append("startdate", filters.dateRange.start);
        }
        if (filters.dateRange.end) {
          params.append("enddate", filters.dateRange.end);
        }

        const transactionsResponse = await fetch(
          `/api/suppliertransaction/suppliertransactionpagination?${params}`
        );
        if (!transactionsResponse.ok) {
          throw new Error(`HTTP error! status: ${transactionsResponse.status}`);
        }
        const transactions: any[] = await transactionsResponse.json();

        const transactionItemsResponse = await fetch("/api/transactionitem");
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

        const totalResponse = await fetch(`/api/suppliertransaction`);
        const totalData = await totalResponse.json();
        setTotalTransactionItemsPages(
          Math.ceil(totalData.length / ROWS_PER_PAGE)
        );
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      }
    },
    [filters]
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
  }, [filters, currentTransactionItemsPage, fetchTransactionData]);

  const clearFilters = () => {
    clear();
    fetchTransactionData(1);
  };

  const handleTransactionItemsPageChange = (page: number) => {
    setCurrentTransactionItemsPage(page);
  };

  return {
    transactionItem,
    currentTransactionItemsPage,
    totalTransactionItemsPages,
    handleTransactionItemsPageChange,
    filters,
    setFilters,
    clearFilters,
  };
};

export default function Component() {
  const user = useContext(userSessionContext);
  const {
    transactionItem,
    currentTransactionItemsPage,
    totalTransactionItemsPages,
    handleTransactionItemsPageChange,
    filters,
    setFilters,
    clearFilters,
  } = useTransactionItems();
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionTable | null>(null);

  const handlePurchaseOrderChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, purordno: value }));
  };

  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, name: value }));
  };

  const clearAllFilters = () => {
    clearFilters();
    handleTransactionItemsPageChange(1);
  };

  const renderFilters = () => (
    <Popover>
      <PopoverTrigger>
        <FilterIcon className="w-6 h-6" />
      </PopoverTrigger>
      <PopoverContent className="bg-customColors-offWhite rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4">Filters</h2>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Button onClick={clearAllFilters}>Clear Filters</Button>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="document-number">Purchase Order No.</Label>
            <Input
              id="document-number"
              type="text"
              placeholder="Enter Purchase Order No."
              value={filters.purordno}
              onChange={handlePurchaseOrderChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              type="text"
              placeholder="Enter Item name"
              value={filters.name}
              onChange={handleItemNameChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frommilling">From Milling</Label>
            <Select
              value={filters.frommilling}
              onValueChange={handleFromMillingChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </SelectTrigger>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </SelectTrigger>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => {
                const newValue = e.target.value;

                setFilters((prev) => ({
                  ...prev,
                  dateRange: {
                    ...prev.dateRange,
                    start: newValue,
                  },
                }));
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => {
                const newValue = e.target.value;

                setFilters((prev) => ({
                  ...prev,
                  dateRange: {
                    ...prev.dateRange,
                    end: newValue,
                  },
                }));
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleFromMillingChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      frommilling: value,
    }));
  };

  const filteredTransactionItems = useMemo(() => {
    return transactionItem;
  }, [transactionItem]);

  const canAccessButton = (role: String) => {
    if (user?.role === ROLES.ADMIN) return true;
    if (user?.role === ROLES.MANAGER) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.SALES) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.INVENTORY) return role !== ROLES.ADMIN;
    return false;
  };

  const downloadPurchaseOrder = async () => {
    const response = await fetch("/api/generatepurchaseorder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transactionId: selectedTransaction?.transactionid,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      console.error("Failed to generate purchase order");
    }
  };

  const formatStock = (stock: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(stock);
  };

  return (
    <div className="flex min-h-screen w-full bg-customColors-lightPastelGreen">
      <div className="flex-1 overflow-y-auto pl-6 pr-6 w-full">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col gap-6">
            <div className="flex  items-center justify-between mb-6 -mr-6">
              <h1 className="text-2xl font-bold text-customColors-eveningSeaGreen">
                List of Purchase Items - Milling Only
              </h1>
            </div>
            <div className="flex items-center justify-between"></div>
            <div className="overflow-x-auto">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-4 mb-4">
                  {renderFilters()}
                </div>
              </div>
              <div className="table-container relative">
                <ScrollArea>
                  <Table
                    style={{ width: "100%" }}
                    className="min-w-[600px] rounded-md border-border w-full h-10 overflow-clip relative bg-customColors-beigePaper"
                  >
                    <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                      <TableRow className="bg-customColors-screenLightGreen hover:bg-customColors-screenLightGreen">
                        <TableHead>Purchase Order No.</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Item Type</TableHead>
                        <TableHead>Sack Weight</TableHead>
                        <TableHead>Unit of Measurement</TableHead>
                        <TableHead>Stock</TableHead>
                        {canAccessButton(
                          ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES
                        ) && (
                          <>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total Amount</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactionItems.map((purchaseItem) => (
                        <TableRow
                          key={purchaseItem.transactionitemid}
                          className="hover:bg-customColors-screenLightGreen"
                        >
                          <TableCell>{purchaseItem.documentNumber}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                purchaseItem.status === "paid"
                                  ? "default"
                                  : purchaseItem.status === "pending"
                                  ? "secondary"
                                  : purchaseItem.status === "cancelled"
                                  ? "destructive"
                                  : "outline"
                              }
                              className={`px-2 py-1 rounded-full ${
                                purchaseItem.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : purchaseItem.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 "
                                  : purchaseItem.status === "cancelled"
                                  ? "bg-red-100 text-red-800 "
                                  : "bg-gray-100 text-gray-800 "
                              }`}
                            >
                              {purchaseItem.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{purchaseItem.Item.itemname}</TableCell>
                          <TableCell>{purchaseItem.Item.itemtype}</TableCell>
                          <TableCell>{purchaseItem.sackweight}</TableCell>
                          <TableCell>
                            {purchaseItem.unitofmeasurement}
                          </TableCell>
                          <TableCell>
                            {formatStock(purchaseItem.stock)}
                          </TableCell>
                          {canAccessButton(
                            ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES
                          ) && (
                            <>
                              <TableCell>
                                {formatPrice(purchaseItem.unitprice)}
                              </TableCell>
                              <TableCell>
                                {formatPrice(purchaseItem.totalamount)}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <div className="flex items-center justify-center mt-4 mb-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          className="hover:bg-customColors-beigePaper"
                          onClick={() =>
                            handleTransactionItemsPageChange(
                              Math.max(1, currentTransactionItemsPage - 1)
                            )
                          }
                        />
                      </PaginationItem>
                      {[...Array(totalTransactionItemsPages)].map(
                        (_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink
                              className="hover:bg-customColors-beigePaper"
                              onClick={() =>
                                handleTransactionItemsPageChange(index + 1)
                              }
                              isActive={
                                currentTransactionItemsPage === index + 1
                              }
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          className="hover:bg-customColors-beigePaper"
                          onClick={() =>
                            handleTransactionItemsPageChange(
                              Math.min(
                                totalTransactionItemsPages,
                                currentTransactionItemsPage + 1
                              )
                            )
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
