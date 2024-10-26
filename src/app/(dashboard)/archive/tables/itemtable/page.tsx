"use client";
import { FilterIcon, RotateCcw } from "@/components/icons/Icons";
import { Badge } from "@/components/ui/badge";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ViewItem } from "@/schemas/item.schema";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const formatStock = (stock: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(stock);
};

interface ItemTableProps {
  items: ViewItem[] | null;
  onRestore: (id: number, type: string) => void;
  filters: any; // Add this line
  setFilters: (filters: any) => void;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  clearFilters: () => void;
}

type ItemFilters = {
  name: string;
  type: string;
  unitofmeasurement: string;
};

export function ItemTable({
  items,
  onRestore,
  filters,
  setFilters,
  currentPage,
  totalPages,
  handlePageChange,
  clearFilters,
}: ItemTableProps) {
  const [showImage, setShowImage] = useState<ViewItem | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const filteredItems = useMemo(() => {
    return items;
  }, [items]);

  console.log("Filtered Items: ", filteredItems);

  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev: ItemFilters) => ({ ...prev, name: value }));
    handlePageChange(1);
  };

  const handleItemTypeChange = (value: string) => {
    setFilters((prev: ItemFilters) => ({ ...prev, type: value }));
    handlePageChange(1);
  };

  const handleUnitOfMeasurementChange = (value: string) => {
    setFilters((prev: ItemFilters) => ({ ...prev, unitofmeasurement: value }));
    handlePageChange(1);
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
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
          <div className="grid gap-2">
            <span className="text-sm">Item Name</span>
            <Input
              id="name"
              type="text"
              placeholder="Search item name..."
              value={filters.name}
              onChange={handleItemNameChange}
            />
          </div>
          <div className="grid gap-2">
            <span className="text-sm">Item Type</span>
            <Select value={filters.type} onValueChange={handleItemTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Item Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="palay">Palay</SelectItem>
                <SelectItem value="bigas">Bigas</SelectItem>
                <SelectItem value="resico">Resico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <span className="text-sm">Unit of Measurement</span>
            <Select
              value={filters.unitofmeasurement}
              onValueChange={handleUnitOfMeasurementChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Unit of Measurement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quantity">Quantity</SelectItem>
                <SelectItem value="weight">Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  const handleShowImage = async (item: ViewItem) => {
    setShowImage(item);
    setShowImageModal(true);
  };

  const closeImage = () => {
    setShowImageModal(false);
    setShowImage(null);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search item name..."
          value={filters.name}
          onChange={handleItemNameChange}
          className="w-full md:w-auto"
        />
        <div className="flex gap-2">{renderFilters()}</div>
      </div>
      <ScrollArea>
        <Table>
          <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
            <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Sack Weight</TableHead>
              <TableHead>Unit of Measurement</TableHead>
              <TableHead>Available Stocks</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Last Modified by</TableHead>
              <TableHead>Last Modified at</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems?.map((item) => (
              <TableRow key={item.itemid}>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowImage(item)}
                  >
                    View Image
                  </Button>
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.sackweight}</TableCell>
                <TableCell>{item.unitofmeasurement}</TableCell>
                <TableCell>{formatStock(item.stock)}</TableCell>
                <TableCell>{formatPrice(item.unitprice)}</TableCell>
                <TableCell>
                  {item.User.firstname} {item.User.lastname}
                </TableCell>
                <TableCell>
                  {item.lastmodifiedat
                    ? new Date(item.lastmodifiedat).toLocaleDateString("en-US")
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRestore(item.itemid ?? 0, "item")}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex items-center justify-center mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => handlePageChange(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {showImageModal && showImage && (
        <Dialog open={showImageModal} onOpenChange={closeImage}>
          <DialogContent className="fixed  transform  max-w-[90%] max-h-[90%] sm:max-w-[800px] sm:max-h-[600px] p-4 bg-white rounded">
            <div className="flex flex-col">
              <DialogHeader className="mb-2 flex items-start">
                <DialogTitle className="text-left flex-grow">
                  Product Image
                </DialogTitle>
              </DialogHeader>
              <DialogDescription className="mb-4 text-left">
                <p>You can click outside to close</p>
              </DialogDescription>
              <div className="flex-grow flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-[400px]">
                  {showImage.itemimage[0]?.imagepath ? (
                    <Image
                      src={showImage.itemimage[0].imagepath}
                      alt="Product Image"
                      fill
                      sizes="(max-width: 600px) 100vw, 50vw"
                      style={{ objectFit: "contain" }}
                      className="absolute"
                    />
                  ) : (
                    <p className="text-center">No image available</p>
                  )}
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button onClick={closeImage}>Close</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
