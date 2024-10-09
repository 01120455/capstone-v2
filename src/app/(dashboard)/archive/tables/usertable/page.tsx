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

export function UserTable({
  users,
  searchTerm,
  onRestore,
}: {
  users: AddUser[] | null;
  searchTerm: string;
  onRestore: (id: number) => void;
}) {
  const filteredUsers = users?.filter((user) =>
    `${user.firstname} ${user.middlename || ""} ${user.lastname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredUsers?.map((user, index) => (
          <TableRow key={index}>
            <TableCell>{`${user.firstname} ${user.middlename || ""} ${
              user.lastname
            }`}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <Badge
                className={
                  user.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>{user.username}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestore(user.userid ?? 0)}
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
