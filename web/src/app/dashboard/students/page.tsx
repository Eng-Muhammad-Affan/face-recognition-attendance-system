// "use client";

// import { DataTable } from "@/components/data-table";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import type { UserTableSchema } from "@/schema";
// import type z from "zod";

// type Data = z.infer<typeof UserTableSchema>;

// const StudentsPage = () => {
//   const [users, setUsers] = useState<Data[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchLogs = async () => {
//       try {
//         const response = await axios.get("/users.json");
//         setUsers(response.data || []);
//       } catch (error) {
//         console.error("Failed to fetch attendance logs:", error);
//         setUsers([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLogs();
//   }, []);

//   if (loading) {
//     return null;
//   }
//   return <DataTable data={users} />;
// };

// export default StudentsPage;

// components/user-management.tsx

// components/user-management.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, UserPlus, Users, Loader2 } from "lucide-react";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  is_active: boolean;
  joined_at: string;
  role: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  department?: string;
  role?: string;
}

// API service
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await axios.get("/users.json");
    return response.data;
  },
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.post(`/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
  toggleUserStatus: async (id: string, is_active: boolean): Promise<User> => {
    const response = await api.patch(`/users/${id}/status`, { is_active });
    return response.data;
  },
};

// Validation functions
const validateForm = (data: Partial<User>): FormErrors => {
  const errors: FormErrors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!data.department || data.department.trim().length === 0) {
    errors.department = "Department is required";
  }

  if (!data.role || data.role.trim().length === 0) {
    errors.role = "Role is required";
  }

  return errors;
};

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusToggling, setStatusToggling] = useState<Record<string, boolean>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    role: "user",
    is_active: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);

    // Mark field as touched
    setTouchedFields({ ...touchedFields, [field]: true });

    // Validate on change if field is touched
    if (touchedFields[field]) {
      const errors = validateForm(updatedFormData);
      setFormErrors(errors);
    }
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      is_active: user.is_active,
    });
    setFormErrors({});
    setTouchedFields({});
    setIsDrawerOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {
      name: true,
      email: true,
      department: true,
      role: true,
    };
    setTouchedFields(allTouched);

    // Validate all fields
    const errors = validateForm(formData);
    setFormErrors(errors);

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form.",
      });
      return;
    }

    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      await userService.updateUser(selectedUser.id, formData);
      
      // Update local state
      setUsers(users.map((user) =>
        user.id === selectedUser.id ? { ...user, ...formData } : user
      ));

      toast({
        title: "Success",
        description: "User has been updated successfully.",
      });

      handleCloseDrawer();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      await userService.deleteUser(selectedUser.id);
      
      // Update local state
      setUsers(users.filter((user) => user.id !== selectedUser.id));

      toast({
        title: "Success",
        description: "User has been deleted successfully.",
      });

      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggle user status
  const handleToggleStatus = async (user: User) => {
    try {
      setStatusToggling((prev) => ({ ...prev, [user.id]: true }));
      
      const newStatus = !user.is_active;
      await userService.toggleUserStatus(user.id, newStatus);
      
      // Update local state
      setUsers(users.map((u) =>
        u.id === user.id ? { ...u, is_active: newStatus } : u
      ));

      toast({
        title: "Success",
        description: `User has been ${newStatus ? "activated" : "deactivated"} successfully.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user status. Please try again.",
      });
    } finally {
      setStatusToggling((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  // Handle close drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      department: "",
      role: "user",
      is_active: false,
    });
    setFormErrors({});
    setTouchedFields({});
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random background color for avatar
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="">
      <Card className="border-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </CardTitle>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                Get started by adding your first user.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.department[0]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={() => handleToggleStatus(user)}
                            disabled={statusToggling[user.id]}
                          />
                          {/* <Badge
                            variant={user.is_active ? "default" : "destructive"}
                            className="w-20 justify-center"
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge> */}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {dayjs(user.joined_at).format("MMM D, YYYY")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={handleCloseDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit User</DrawerTitle>
            <DrawerDescription>
              Update user information for {selectedUser?.name}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 pb-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={formErrors.name && touchedFields.name ? "border-destructive" : ""}
                />
                {formErrors.name && touchedFields.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={formErrors.email && touchedFields.email ? "border-destructive" : ""}
                />
                {formErrors.email && touchedFields.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">
                  Department <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange("department", value)}
                >
                  <SelectTrigger 
                    id="department"
                    className={formErrors.department && touchedFields.department ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.department && touchedFields.department && (
                  <p className="text-sm text-destructive">{formErrors.department}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                >
                  <SelectTrigger 
                    id="role"
                    className={formErrors.role && touchedFields.role ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.role && touchedFields.role && (
                  <p className="text-sm text-destructive">{formErrors.role}</p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle to activate or deactivate this user
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
              </div>

              <DrawerFooter className="px-0">
                <div className="flex gap-3">
                  <DrawerClose className="flex-1">
                      Cancel
                  </DrawerClose>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Avatar className={`h-10 w-10 ${getAvatarColor(selectedUser.name)}`}>
                <AvatarFallback className="text-white">
                  {getInitials(selectedUser.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedUser(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}