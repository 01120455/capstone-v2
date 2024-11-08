import { TransactionItem } from "@/schemas/transaction.schema";
import { useCallback, useEffect, useState } from "react";

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

interface Filters {
  purordno: string;
  name: string;
  type: string;
  status: string;
  dateRange: { start: string; end: string };
}

const useFilters = () => {
  const [filters, setFilters] = useState<Filters>({
    purordno: "",
    name: "",
    type: "",
    status: "",
    dateRange: { start: "", end: "" },
  });

  const clear = () => {
    setFilters({
      purordno: "",
      name: "",
      type: "",
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
        if (filters.type) {
          params.append("type", filters.type);
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

export { useTransactionItems, formatPrice, useFilters };
