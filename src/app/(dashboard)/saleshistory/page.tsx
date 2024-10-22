"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import transactionSchema, {
  TransactionItem,
  TransactionOnly,
  TransactionTable,
} from "@/schemas/transaction.schema";
import { Badge } from "@/components/ui/badge";
import {
  XIcon,
  ArrowRightIcon,
  FilterIcon,
  FilePenIcon,
} from "@/components/icons/Icons";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select } from "@radix-ui/react-select";
import {
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import salesTransactionEditSchema, {
  EditSales,
} from "@/schemas/saleseditstatus.schema";

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
}

export default function Component() {
  const [sales, setSales] = useState<TransactionTable[]>([]);
  const [filters, setFilters] = useState({
    invoiceno: "",
    name: "",
    customer: "",
    walkin: "all",
    frommilling: "all",
    status: "all",
    dateRange: { start: "", end: "" },
  });

  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionTable | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentItemPage, setCurrentItemPage] = useState(1);
  const [transactionItemsPerPage, setTransactionItemsPerPage] = useState(5);
  const [showFilter, setShowFilter] = useState(false);
  const [invoiceSuggestions, setInvoiceSuggestions] = useState<string[]>([]);
  const [itemNameSuggestions, setItemNameSuggestions] = useState<string[]>([]);
  const [isInvoiceDropdownVisible, setInvoiceDropdownVisible] = useState(false);
  const [isItemDropdownVisible, setItemDropdownVisible] = useState(false);
  const dropdownRefInvoice = useRef<HTMLDivElement>(null);
  const dropdownRefItem = useRef<HTMLDivElement>(null);
  const [showModalEditSales, setShowModalEditSales] = useState(false);

  const formSalesOnly = useForm<EditSales>({
    resolver: zodResolver(salesTransactionEditSchema),
    defaultValues: {
      transactionid: 0,
      status: "pending",
      DocumentNumber: {
        documentnumberid: 0,
        documentnumber: "",
      },
    },
  });

  useEffect(() => {
    console.log(formSalesOnly.formState.errors);
  }, [formSalesOnly.formState.errors]);

  const handleEdit = (sales: EditSales) => {
    console.log("Editing sales:", sales);
    setShowModalEditSales(true);

    formSalesOnly.reset({
      transactionid: sales.transactionid,
      status: sales.status,
      DocumentNumber: {
        documentnumberid: sales.DocumentNumber.documentnumberid,
        documentnumber: sales.DocumentNumber.documentnumber,
      },
    });
  };

  const handleCancel = () => {
    setShowModalEditSales(false);

    formSalesOnly.reset({
      transactionid: 0,
      status: "pending",
      DocumentNumber: {
        documentnumberid: 0,
        documentnumber: "",
      },
    });
  };

  const handleSubmit = async (values: EditSales) => {
    console.log("Form Values:", values);
    const formData = new FormData();

    formData.append("status", values.status);

    let method = "put";
    let endpoint = `/api/editsalesstatus/${values.transactionid}`;

    try {
      const uploadRes = await fetch(endpoint, {
        method: method,
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadResult = await uploadRes.json();
        toast.success(
          `Invoice No. ${""} ${formSalesOnly.getValues(
            "DocumentNumber.documentnumber"
          )} ${""} status has been updated`,
          {
            description: "You have successfully edited the purchase.",
          }
        );
        console.log("Purchase updated successfully");
        console.log("Upload Result:", uploadResult);
        // Debugging statement
        console.log("Closing modal...");
        setShowModalEditSales(false);
        refreshSales();
        refreshTransactionItems();
      } else {
        console.error("Upload failed", await uploadRes.text());
      }
    } catch (error) {
      console.error("Error adding/updating purchase:", error);
    }
  };

  useEffect(() => {
    const getSales = async () => {
      try {
        const response = await fetch("/api/customertransaction");
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
      } catch (error) {
        console.error("Error in getSales:", error);
      }
    };

    getSales();
  }, []);

  const refreshSales = async () => {
    try {
      const response = await fetch("/api/customertransaction");
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
    } catch (error) {
      console.error("Error in getSales:", error);
    }
  };

  const filteredTransactions = useMemo(() => {
    return sales.filter((sales) => {
      const invoiceNo =
        sales.DocumentNumber?.documentnumber?.toLowerCase() || "";
      const statusMatches =
        filters.status === "all" || sales.status === filters.status;
      const walkinMatches =
        filters.walkin === "all" ||
        (filters.walkin === "true" && sales.walkin) ||
        (filters.walkin === "false" && !sales.walkin);
      const frommillingMatches =
        filters.frommilling === "all" ||
        (filters.frommilling === "true" && sales.frommilling) ||
        (filters.frommilling === "false" && !sales.frommilling);
      const itemNameMatches = sales.TransactionItem.some((item) => {
        const itemName = item?.Item?.name?.toLowerCase() || "";
        return itemName.includes(filters.name.toLowerCase());
      });

      const createdAt = sales.createdat ? new Date(sales.createdat) : null;
      const start = filters.dateRange.start
        ? new Date(filters.dateRange.start)
        : null;
      const end = filters.dateRange.end
        ? new Date(filters.dateRange.end)
        : null;

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

      console.log("Filtering sales:", sales);
      console.log("Matches:", {
        invoiceNoMatches:
          !filters.invoiceno ||
          invoiceNo.includes(filters.invoiceno.toLowerCase()),
        statusMatches,
        walkinMatches,
        frommillingMatches,
        itemNameMatches,
        dateRangeMatches,
      });

      return (
        (!filters.invoiceno ||
          invoiceNo.includes(filters.invoiceno.toLowerCase())) &&
        statusMatches &&
        walkinMatches &&
        frommillingMatches &&
        itemNameMatches &&
        dateRangeMatches
      );
    });
  }, [filters, sales]);

  const handleClearFilters = () => {
    setFilters({
      invoiceno: "",
      name: "",
      customer: "",
      walkin: "all",
      frommilling: "all",
      status: "all",
      dateRange: { start: "", end: "" },
    });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, invoiceno: value }));
    setInvoiceDropdownVisible(e.target.value.length > 0);

    const filtered = sales
      .map((p) => p.DocumentNumber?.documentnumber)
      .filter(
        (invoice): invoice is string =>
          invoice !== undefined &&
          invoice.toLowerCase().includes(value.toLowerCase())
      );

    setInvoiceSuggestions(filtered);
  };

  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, name: value }));
    setItemDropdownVisible(value.length > 0);

    const filtered = sales
      .flatMap((p) => p.TransactionItem.map((item) => item?.Item?.name))
      .filter((itemName) =>
        itemName?.toLowerCase().includes(value.toLowerCase())
      );

    setItemNameSuggestions(Array.from(new Set(filtered)));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRefInvoice.current &&
        !dropdownRefInvoice.current.contains(event.target as Node)
      ) {
        setInvoiceDropdownVisible(false);
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

  const handleWalkinChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      walkin: value,
    }));
  };

  const handleFromMillingChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      frommilling: value,
    }));
  };

  const fetchTransactionData = async (): Promise<CombinedTransactionItem[]> => {
    const transactionsResponse = await fetch("/api/customertransaction");
    const transactions: any[] = await transactionsResponse.json();
    console.log("Transactions:", transactions);

    const transactionItemsResponse = await fetch("/api/transactionitem");
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

  const refreshTransactionItems = async () => {
    const combinedData = await fetchTransactionData();
    setTransactionItem(combinedData);
  };

  console.log("Transaction Item:", transactionItem);

  const filteredTransactionItems = useMemo(() => {
    return transactionItem.filter((item) => {
      const invoiceno = item.documentNumber?.toLowerCase() || "";
      const statusMatches =
        filters.status === "all" || item.status === filters.status;
      const itemNameMatches = item.Item?.name
        ? item.Item.name.toLowerCase().includes(filters.name.toLowerCase())
        : false;

      const createdAt = item.lastmodifiedat
        ? new Date(item.lastmodifiedat)
        : null;
      const start = filters.dateRange.start
        ? new Date(filters.dateRange.start)
        : null;
      const end = filters.dateRange.end
        ? new Date(filters.dateRange.end)
        : null;

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

      return (
        (!filters.invoiceno ||
          invoiceno.includes(filters.invoiceno.toLowerCase())) &&
        statusMatches &&
        itemNameMatches &&
        dateRangeMatches
      );
    });
  }, [filters, transactionItem]);

  const totalPagesTransactionItems = Math.ceil(
    filteredTransactionItems.length / transactionItemsPerPage
  );
  const paginatedTransactionItems = filteredTransactionItems.slice(
    (currentItemPage - 1) * transactionItemsPerPage,
    currentItemPage * transactionItemsPerPage
  );

  const handleItemPageChange = (page: number) => {
    setCurrentItemPage(page);
  };

  return (
    <div className="flex h-screen w-full bg-customColors-offWhite">
      <div className="flex-1 overflow-y-auto pt-8 pl-4 pr-4 w-full">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <h1 className="text-2xl font-bold mb-6">Sales History</h1>
          <div className="grid gap-6 grid-cols-1">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4"></div>
              {selectedTransaction ? (
                <div className="bg-customColors-offWhite rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Sales Details</h2>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedTransaction(null)}
                    >
                      <XIcon className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>
                  <div className="grid gap-1">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 p-2">
                      <div className="font-medium text-muted-foreground">
                        Sales Date:
                      </div>
                      <div>
                        {selectedTransaction.createdat
                          ? new Date(
                              selectedTransaction.createdat
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </div>
                      <div className="font-medium text-muted-foreground">
                        Sales Created by:
                      </div>
                      <div>
                        {selectedTransaction.User
                          ? `${selectedTransaction.User.firstname} ${selectedTransaction.User.lastname}`
                          : "N/A"}
                      </div>
                    </div>
                    <div className="overflow-y-auto">
                      <div className="table-container relative ">
                        <ScrollArea>
                          <Table
                            style={{ width: "100%" }}
                            className="min-w-[600px]  rounded-md border-border w-full h-10 overflow-clip relative"
                            divClassname="min-h-[200px] overflow-y-scroll max-h-[200px] overflow-y-auto"
                          >
                            <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                              <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
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
                              {selectedTransaction.TransactionItem.map(
                                (item, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{item.Item.name}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{item.sackweight}</TableCell>
                                    <TableCell>
                                      {item.unitofmeasurement}
                                    </TableCell>
                                    <TableCell>
                                      {item.measurementvalue}
                                    </TableCell>
                                    <TableCell>
                                      {formatPrice(item.unitprice)}
                                    </TableCell>
                                    <TableCell>
                                      {formatPrice(item.totalamount)}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="font-medium">Total Items:</div>
                      <div>{selectedTransaction.TransactionItem.length}</div>
                      <div className="font-medium">Total:</div>
                      <div>
                        {formatPrice(selectedTransaction.totalamount ?? 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-4 mb-4">
                      <Popover>
                        <PopoverTrigger>
                          <FilterIcon className="w-6 h-6" />
                        </PopoverTrigger>
                        <PopoverContent className="bg-customColors-offWhite rounded-lg shadow-lg p-6">
                          <h2 className="text-lg font-bold mb-4">Filters</h2>
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Button onClick={handleClearFilters}>
                                Clear Filters
                              </Button>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="document-number">
                                Invoice No.
                              </Label>
                              <Input
                                id="document-number"
                                type="text"
                                placeholder="Enter Purchase Order No."
                                value={filters.invoiceno}
                                onChange={handleInvoiceChange}
                              />
                              {isInvoiceDropdownVisible &&
                                invoiceSuggestions.length > 0 && (
                                  <div
                                    ref={dropdownRefInvoice} // Attach ref to the dropdown
                                    className="absolute z-10 bg-white border border-gray-300 mt-14 w-44 max-h-60 overflow-y-auto"
                                  >
                                    {invoiceSuggestions.map((invoiceno) => (
                                      <div
                                        key={invoiceno}
                                        className="p-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() =>
                                          setFilters((prev) => ({
                                            ...prev,
                                            invoiceno: invoiceno,
                                          }))
                                        }
                                      >
                                        {invoiceno}
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
                              {isItemDropdownVisible &&
                                itemNameSuggestions.length > 0 && (
                                  <div
                                    ref={dropdownRefItem} // Attach ref to the dropdown
                                    className="absolute z-10 bg-white border border-gray-300 mt-14 w-44 max-h-60 overflow-y-auto"
                                  >
                                    {itemNameSuggestions.map((item) => (
                                      <div
                                        key={item}
                                        className="p-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() =>
                                          setFilters((prev) => ({
                                            ...prev,
                                            name: item,
                                          }))
                                        }
                                      >
                                        {item}
                                      </div>
                                    ))}
                                  </div>
                                )}
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
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="true">Yes</SelectItem>
                                    <SelectItem value="false">No</SelectItem>
                                  </SelectContent>
                                </SelectTrigger>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="status">Status</Label>
                              <Select
                                value={filters.status}
                                onValueChange={handleStatusChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                  <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="pending">
                                      Pending
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                      Cancelled
                                    </SelectItem>
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
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="table-container relative  ">
                    <ScrollArea>
                      <Table
                        style={{ width: "100%" }}
                        className="min-w-[600px]  rounded-md border-border w-full h-10 overflow-clip relative"
                        divClassname="min-h-[300px] overflow-y-scroll max-h-[400px] lg:max-h-[600px] xl:max-h-[800px] overflow-y-auto"
                      >
                        <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                          <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
                            <TableHead>Invoice No.</TableHead>
                            <TableHead>Walk-in</TableHead>
                            <TableHead>From Milling</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedTransactions.length > 0 ? (
                            paginatedTransactions.map(
                              (
                                transaction: TransactionTable,
                                index: number
                              ) => (
                                <TableRow
                                  key={index}
                                  className="cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                                >
                                  <TableCell>
                                    {transaction.DocumentNumber.documentnumber}
                                  </TableCell>
                                  <TableCell>
                                    {transaction.walkin ? "True" : "False"}
                                  </TableCell>
                                  <TableCell>
                                    {transaction.frommilling ? "True" : "False"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={`px-2 py-1 rounded-full ${
                                        transaction.status === "paid"
                                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                          : transaction.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                          : transaction.status === "cancelled"
                                          ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" // Default case
                                      }`}
                                    >
                                      {transaction.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {formatPrice(transaction.totalamount ?? 0)}
                                  </TableCell>
                                  <TableCell>
                                    {transaction.createdat
                                      ? new Date(
                                          transaction.createdat
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(transaction)}
                                      >
                                        <FilePenIcon className="h-4 w-4" />
                                        <span className="sr-only">
                                          Edit Transaction
                                        </span>
                                      </Button>

                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          setSelectedTransaction(transaction)
                                        }
                                      >
                                        <ArrowRightIcon className="h-6 w-6" />
                                        <span className="sr-only">
                                          View details
                                        </span>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center">
                                No transactions found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <div className="flex items-center justify-center mt-4">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() =>
                                  handlePageChange(Math.max(1, currentPage - 1))
                                }
                              />
                            </PaginationItem>
                            {currentPage > 3 && (
                              <>
                                <PaginationItem>
                                  <PaginationLink
                                    onClick={() => handlePageChange(1)}
                                    isActive={currentPage === 1}
                                  >
                                    1
                                  </PaginationLink>
                                </PaginationItem>
                                {currentPage > 3 && <PaginationEllipsis />}
                              </>
                            )}

                            {Array.from(
                              { length: Math.min(3, totalPages) },
                              (_, index) => {
                                const pageIndex =
                                  Math.max(1, currentPage - 1) + index;
                                if (pageIndex < 1 || pageIndex > totalPages)
                                  return null;

                                return (
                                  <PaginationItem key={pageIndex}>
                                    <PaginationLink
                                      onClick={() =>
                                        handlePageChange(pageIndex)
                                      }
                                      isActive={currentPage === pageIndex}
                                    >
                                      {pageIndex}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              }
                            )}

                            {currentPage < totalPages - 2 && (
                              <>
                                {currentPage < totalPages - 3 && (
                                  <PaginationEllipsis />
                                )}
                                <PaginationItem>
                                  <PaginationLink
                                    onClick={() => handlePageChange(totalPages)}
                                    isActive={currentPage === totalPages}
                                  >
                                    {totalPages}
                                  </PaginationLink>
                                </PaginationItem>
                              </>
                            )}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() =>
                                  handlePageChange(
                                    Math.min(totalPages, currentPage + 1)
                                  )
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
          </div>
          {showModalEditSales && (
            <Dialog open={showModalEditSales} onOpenChange={handleCancel}>
              <DialogContent className="w-full max-w-full sm:min-w-[400px] md:w-[400px] lg:min-w-[400px] p-4 bg-customColors-offWhite">
                <DialogHeader>
                  <DialogTitle>
                    {formSalesOnly.getValues("transactionid")
                      ? "Edit Sales status"
                      : "Add Sales status"}
                  </DialogTitle>
                  <DialogDescription>
                    Fill out the form to{" "}
                    {formSalesOnly.getValues("transactionid")
                      ? "edit a"
                      : "add a new"}{" "}
                    sales status.
                  </DialogDescription>
                </DialogHeader>
                <Form {...formSalesOnly}>
                  <form
                    className="w-full max-w-full  mx-auto p-4 sm:p-6"
                    onSubmit={formSalesOnly.handleSubmit(handleSubmit)}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-4 py-2">
                      <div className="space-y-2">
                        <FormField
                          control={formSalesOnly.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="status">
                                Payment Status
                              </FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  {...field}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status">
                                      {field.value}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">
                                      Pending
                                    </SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="cancelled">
                                      Cancelled
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <DialogFooter className="pt-2 lg:pt-1">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                      </div>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
          <div className="flex-1 overflow-y-hidden w-full">
            <div className="container">
              <div className="flex flex-col gap-6">
                <div className="flex  items-center justify-between mb-6 -mr-6">
                  <h1 className="text-2xl font-bold ">List of Sales Items</h1>
                </div>
                <div className="flex items-center justify-between"></div>
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
                            <TableHead>Invoice No.</TableHead>
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
                          {paginatedTransactionItems.map((purchaseItem) => (
                            <TableRow key={purchaseItem.transactionitemid}>
                              <TableCell>
                                {purchaseItem.documentNumber}
                              </TableCell>
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
                              <TableCell>
                                {purchaseItem.unitofmeasurement}
                              </TableCell>
                              <TableCell>
                                {purchaseItem.measurementvalue}
                              </TableCell>
                              <TableCell>{purchaseItem.unitprice}</TableCell>
                              <TableCell>{purchaseItem.totalamount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="flex items-center justify-center mt-4 mb-4">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() =>
                                  handleItemPageChange(
                                    Math.max(1, currentItemPage - 1)
                                  )
                                }
                              />
                            </PaginationItem>
                            {[...Array(totalPagesTransactionItems)].map(
                              (_, index) => (
                                <PaginationItem key={index}>
                                  <PaginationLink
                                    onClick={() =>
                                      handleItemPageChange(index + 1)
                                    }
                                    isActive={currentItemPage === index + 1}
                                  >
                                    {index + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            )}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() =>
                                  handleItemPageChange(
                                    Math.min(
                                      totalPagesTransactionItems,
                                      currentItemPage + 1
                                    )
                                  )
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
