import { RotateCcw } from "@/components/icons/Icons";
import { Badge } from "@/components/ui/badge";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddUser } from "@/schemas/User.schema";
import { Button } from "@/components/ui/button";
import { Entity } from "@/schemas/entity.schema";

export function SuppliersTable({
  suppliers,
  searchTerm,
  onRestore,
}: {
  suppliers: Entity[] | null;
  searchTerm: string;
  onRestore: (id: number) => void;
}) {
  const filteredSuppliers = suppliers?.filter((suppliers) =>
    `${suppliers.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredSuppliers?.map((customer, index) => (
          <TableRow key={index}>
            <TableCell>{customer.name}</TableCell>
            <TableCell>{customer.contactnumber}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestore(customer.entityid ?? 0)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
