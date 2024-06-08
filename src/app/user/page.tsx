"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function Component() {
  const [users, setUsers] = useState([
    {
      id: 1,
      firstName: "John",
      middleName: "Doe",
      lastName: "Smith",
      role: "Admin",
      status: "Active",
      username: "jsmith",
      password: "password123",
    },
    {
      id: 2,
      firstName: "Jane",
      middleName: "Doe",
      lastName: "Johnson",
      role: "User",
      status: "Active",
      username: "jjohnson",
      password: "password456",
    },
    {
      id: 3,
      firstName: "Bob",
      middleName: "Lee",
      lastName: "Davis",
      role: "Manager",
      status: "Inactive",
      username: "bdavis",
      password: "password789",
    },
  ])
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const handleAddUser = () => {
    setSelectedUser(null)
    setShowModal(true)
  }
  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowModal(true)
  }
  const handleDeleteUser = (userId) => {
    setUsers(users.filter((user) => user.id !== userId))
  }
  const handleSaveUser = (user) => {
    if (selectedUser) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? user : u)))
    } else {
      setUsers([...users, { ...user, id: users.length + 1 }])
    }
    setShowModal(false)
  }
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={handleAddUser}>Add User</Button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Username</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.firstName} {user.middleName} {user.lastName}
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge
                    className={`px-2 py-1 rounded-full ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                    }`}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="icon" onClick={() => handleEditUser(user)}>
                    <FilePenIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDeleteUser(user.id)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {showModal && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{selectedUser ? "Edit User" : "Add User"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={selectedUser?.firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input id="middleName" defaultValue={selectedUser?.middleName} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue={selectedUser?.lastName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select id="role" defaultValue={selectedUser?.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" defaultValue={selectedUser?.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={selectedUser?.username} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" defaultValue={selectedUser?.password} />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="ml-auto"
                onClick={() =>
                  handleSaveUser({
                    firstName: document.getElementById("firstName").value,
                    middleName: document.getElementById("middleName").value,
                    lastName: document.getElementById("lastName").value,
                    role: document.getElementById("role").value,
                    status: document.getElementById("status").value,
                    username: document.getElementById("username").value,
                    password: document.getElementById("password").value,
                  })
                }
              >
                Save
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

function FilePenIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
    </svg>
  )
}


function TrashIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}