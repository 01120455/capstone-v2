"use client";
import { FilterIcon } from "@/components/icons/Icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TransactionItem,
  TransactionTable,
} from "@/schemas/transaction.schema";
import { useEffect, useMemo, useRef, useState } from "react";

interface CombinedTransactionItem {
  documentNumber?: string;
  transactionitemid: number;
  transactionid: number;
  frommilling: boolean;
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
}

export default function PurchaseFromMillingTable() {
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    purordno: "",
    name: "",
    status: "all", // Default to 'all' for status
    dateRange: {
      start: "",
      end: "",
    },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const [purchaseOrderSuggestions, setPurchaseOrderSuggestions] = useState<
    string[]
  >([]);
  const [itemNameSuggestions, setItemNameSuggestions] = useState<string[]>([]);
  const [isPurchaseOrderDropdownVisible, setPurchaseOrderDropdownVisible] =
    useState(false);
  const [isItemDropdownVisible, setItemDropdownVisible] = useState(false);
  const dropdownRefPurchaseOrder = useRef<HTMLDivElement>(null);
  const dropdownRefItem = useRef<HTMLDivElement>(null);
  const [itemInputValue, setItemInputValue] = useState("");
  const [itemFormSuggestions, setItemFormSuggestions] = useState<string[]>([]);
  const [isItemFormDropdownVisible, setItemFormDropdownVisible] =
    useState(false);

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const fetchTransactionData = async (): Promise<CombinedTransactionItem[]> => {
    const transactionsResponse = await fetch("/api/suppliertransaction");
    const transactions: any[] = await transactionsResponse.json();
    console.log("Transactions:", transactions);

    const transactionItemsResponse = await fetch(
      "/api/purchasetransactionitem"
    );
    const transactionItems: TransactionItem[] =
      await transactionItemsResponse.json();
    console.log("Transaction Items:", transactionItems);

    const transactionMap = new Map<number, any>();
    transactions.forEach((transaction) => {
      transactionMap.set(transaction.transactionid, {
        documentNumber: transaction.DocumentNumber?.documentnumber,
        frommilling: transaction.frommilling,
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
          frommilling: transactionInfo.frommilling || false,
          type: transactionInfo.type || "otherType",
          status: transactionInfo.status || "otherStatus",
        };

        console.log("Combined Item:", combinedItem); // Log each combined item
        return combinedItem;
      }
    );

    // Filter out items with undefined documentNumber
    const filteredData = combinedData.filter(
      (item) => item.documentNumber !== undefined
    );
    console.log(
      "Filtered Data (without undefined documentNumber):",
      filteredData
    ); // Log the filtered data

    return filteredData;
  };

  const [transactionItem, setTransactionItem] = useState<
    CombinedTransactionItem[]
  >([]);

  useEffect(() => {
    const getData = async () => {
      const combinedData = await fetchTransactionData();
      setTransactionItem(combinedData);
    };

    getData();
  }, []);

  console.log("Transaction Item:", transactionItem);

  const filteredTransactions = useMemo(() => {
    return transactionItem.filter((purchase) => {
      const purordno = purchase.documentNumber?.toLowerCase() || "";

      // Check if the purchase order number matches the search term
      const purordnoMatches = purordno.includes(searchTerm.toLowerCase());

      // Check if the status matches the selected filter
      const statusMatches =
        filters.status === "all" || purchase.status === filters.status;

      // Check if the item name matches the filter
      const itemNameMatches = purchase.Item?.name
        ? purchase.Item.name.toLowerCase().includes(filters.name.toLowerCase())
        : false;

      // Assuming 'lastmodifiedat' is a property in CombinedTransactionItem
      const createdAt = purchase.lastmodifiedat
        ? new Date(purchase.lastmodifiedat)
        : null;

      const start = filters.dateRange.start
        ? new Date(filters.dateRange.start)
        : null;
      const end = filters.dateRange.end
        ? new Date(filters.dateRange.end)
        : null;

      // Helper function to check date range
      const isWithinDateRange = (
        createdAt: Date | null,
        start: Date | null,
        end: Date | null
      ) => {
        if (!createdAt) return false;
        if (start && end) return createdAt >= start && createdAt <= end;
        if (start) return createdAt >= start;
        if (end) return createdAt <= end;
        return true;
      };

      const dateRangeMatches = isWithinDateRange(createdAt, start, end);

      console.log("Filtering Purchase:", purchase);
      console.log("Matches:", {
        purordnoMatches,
        statusMatches,
        itemNameMatches,
        dateRangeMatches,
      });

      return (
        (!filters.purordno ||
          purordno.includes(filters.purordno.toLowerCase())) &&
        statusMatches &&
        itemNameMatches &&
        dateRangeMatches &&
        (searchTerm === "" || purordnoMatches) // Include search term condition
      );
    });
  }, [filters, transactionItem, searchTerm]);

  const handleClearFilters = () => {
    setFilters({
      purordno: "",
      name: "",
      status: "all",
      dateRange: {
        start: "",
        end: "",
      },
    });
  };

  const handlePurchaseOrderChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, purordno: value }));
    setPurchaseOrderDropdownVisible(e.target.value.length > 0);

    const filtered = transactionItem
      .map((p) => p.documentNumber)
      .filter(
        (purordno): purordno is string =>
          purordno !== undefined &&
          purordno.toLowerCase().includes(value.toLowerCase())
      );
    setPurchaseOrderSuggestions(filtered);
  };

  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, name: value }));
    setItemDropdownVisible(value.length > 0);

    const filtered = transactionItem
      .map((p) => p.Item.name)
      .filter((itemName) =>
        itemName.toLowerCase().includes(value.toLowerCase())
      );

    setItemNameSuggestions(Array.from(new Set(filtered)));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRefPurchaseOrder.current &&
        !dropdownRefPurchaseOrder.current.contains(event.target as Node)
      ) {
        setPurchaseOrderDropdownVisible(false);
      }
      if (
        dropdownRefItem.current &&
        !dropdownRefItem.current.contains(event.target as Node)
      ) {
        setItemDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside as EventListener);
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as EventListener
      );
    };
  }, []);

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value,
    }));
  };

  return (
    <div className="flex-1 overflow-y-hidden w-full">
      <div
        className={`grid gap-6 ${
          showFilter ? "grid-cols-[1fr_220px]" : "auto-cols-fr"
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex  items-center justify-between mb-6 -mr-6">
            <h1 className="text-2xl font-bold ">
              List of Purchase Items from Milling
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-row gap-2">
              <Input
                type="text"
                placeholder="Search purchase order no. ..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full md:w-auto mb-4"
              />
              <Button variant="outline" size="icon" onClick={toggleFilter}>
                <span className="sr-only">Filter</span>
                <FilterIcon className="w-6 h-6" />
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="table-container relative">
              <ScrollArea>
                <Table
                  style={{ width: "100%" }}
                  className="min-w-[600px] rounded-md border-border w-full h-10 overflow-clip relative"
                  divClassname="min-h-[200px] overflow-y-scroll max-h-[400px] overflow-y-auto"
                >
                  <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                    <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
                      <TableHead>Purchase Order No.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Item Type</TableHead>
                      <TableHead>Sack Weight</TableHead>
                      <TableHead>Unit of Measurement</TableHead>
                      <TableHead>Measurement Value</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((purchaseItem) => (
                      <TableRow key={purchaseItem.transactionitemid}>
                        <TableCell>{purchaseItem.documentNumber}</TableCell>
                        <TableCell>
                          <Badge
                            className={`px-2 py-1 rounded-full ${
                              purchaseItem.status === "paid"
                                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                : purchaseItem.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                : purchaseItem.status === "cancelled"
                                ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" // Default case
                            }`}
                          >
                            {purchaseItem.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{purchaseItem.Item.name}</TableCell>
                        <TableCell>{purchaseItem.Item.type}</TableCell>
                        <TableCell>{purchaseItem.sackweight}</TableCell>
                        <TableCell>{purchaseItem.unitofmeasurement}</TableCell>
                        <TableCell>{purchaseItem.measurementvalue}</TableCell>
                        <TableCell>{purchaseItem.unitprice}</TableCell>
                        <TableCell>{purchaseItem.totalamount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>
        </div>
        <div
          className={`bg-customColors-offWhite rounded-lg shadow-lg p-6 ${
            showFilter ? "block" : "hidden"
          }`}
        >
          <h2 className="text-lg font-bold mb-4">Filters</h2>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Button onClick={handleClearFilters}>Clear Filters</Button>
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
              {isPurchaseOrderDropdownVisible &&
                purchaseOrderSuggestions.length > 0 && (
                  <div
                    ref={dropdownRefPurchaseOrder} // Attach ref to the dropdown
                    className="absolute z-10 bg-white border border-gray-300 mt-14 w-44 max-h-60 overflow-y-auto"
                  >
                    {purchaseOrderSuggestions.map((purordno) => (
                      <div
                        key={purordno}
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            purordno: purordno,
                          }))
                        }
                      >
                        {purordno}
                      </div>
                    ))}
                  </div>
                )}
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
              {isItemDropdownVisible && itemNameSuggestions.length > 0 && (
                <div
                  ref={dropdownRefItem} // Attach ref to the dropdown
                  className="absolute z-10 bg-white border border-gray-300 mt-14 w-44 max-h-60 overflow-y-auto"
                >
                  {itemNameSuggestions.map((item) => (
                    <div
                      key={item}
                      className="p-2 cursor-pointer hover:bg-gray-200"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, name: item }))
                      }
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
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
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      start: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.dateRange.end}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      end: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
