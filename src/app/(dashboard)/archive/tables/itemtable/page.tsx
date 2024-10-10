"use client";
import { RotateCcw } from "@/components/icons/Icons";
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
import { useState } from "react";
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

export function ItemTable({
  items,
  searchTerm,
  onRestore,
}: {
  items: ViewItem[] | null;
  searchTerm: string;
  onRestore: (id: number) => void;
}) {
  const [showImage, setShowImage] = useState<ViewItem | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const filteredItems = items?.filter((items) =>
    `${items.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(filteredItems?.length ?? 0 / itemsPerPage);
  const paginatedItems = filteredItems?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  const handleShowImage = async (item: ViewItem) => {
    setShowImage(item);
    setShowImageModal(true);
  };

  const closeImage = () => {
    setShowImageModal(false);
    setShowImage(null);
  };

  return (
    <div className="table-container relative ">
      <Table>
        <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Sack Weight</TableHead>
            <TableHead>Unit of Measurement</TableHead>
            <TableHead>Available Stocks</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Reorder Level</TableHead>
            <TableHead>Critical Level</TableHead>
            <TableHead>Last Modified by</TableHead>
            <TableHead>Last Modified at</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems?.map((item) => (
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
              <TableCell>{item.reorderlevel}</TableCell>
              <TableCell>{item.criticallevel}</TableCell>
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
                  onClick={() => onRestore(item.itemid ?? 0)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
      <>
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
    </div>
  );
}
