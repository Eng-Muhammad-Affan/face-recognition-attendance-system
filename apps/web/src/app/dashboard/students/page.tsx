"use client";

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
import { InputReactHookForm } from "@/components/custom/input-react-hook-form";

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
import { Trash2, UserPlus, Users, Loader2, Pen } from "lucide-react";
import { FormProvider, Controller } from "react-hook-form";
import { useStudents } from "@/features/students/hooks";
import Link from "next/link";

export default function UserManagement() {
  const {
    users,
    loading,
    onSubmit,
    selectedUser,
    toast,
    setSelectedUser,
    isDrawerOpen,
    isDeleteDialogOpen, setIsDeleteDialogOpen,
    formMethods,
    handleDeleteUser, handleToggleStatus,
    getInitials,
    handleEditUser,
    handleCloseDrawer,
    setUsers,
    setIsDrawerOpen,
    statusToggling
  } = useStudents()

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = formMethods;

  // console.log(formMethods.formState)


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
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </CardTitle>
          <Link href={"/"}>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </Link>
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
                    <TableHead className="w-[300px]">Reg. no</TableHead>
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
                          {/* <Avatar className={`h-8 w-8 ${getAvatarColor(user.name)}`}>
                            <AvatarFallback className="text-white text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar> */}
                          <span className="font-medium" onClick={() => handleEditUser(user)}>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.registration_number}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.department}</Badge>
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
                          {statusToggling[user.id] && (
                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {dayjs(user.joined_at).format("MMM D, YYYY")}
                      </TableCell>
                      <TableCell className="text-right">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDrawerOpen(true)
                          }}
                        >
                          <Pen className="h-4 w-4 text-black" />
                        </Button>
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
        {selectedUser ? (<DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit User</DrawerTitle>
            <DrawerDescription>
              Update user information for {selectedUser.name}
            </DrawerDescription>
          </DrawerHeader>

          <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-4 pb-0 space-y-4">
                <InputReactHookForm
                  name="name"
                  type="text"
                  placeholder="Enter user name"
                  label="Name"
                />
                <InputReactHookForm
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Enter email address"
                />
                <InputReactHookForm
                  name="department"
                  label="department"
                  placeholder="Enter department"
                  type="text"
                />

                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <SelectTrigger
                        className={errors.role ? "border-destructive" : ""}
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />

                {/* Active Status Field */}
                <div className="flex items-center space-x-2">
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="is_active"
                      />
                    )}
                  />
                  <Label htmlFor="is_active">Active User</Label>
                </div>

              </div>

              <DrawerFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <DrawerClose type="button" onClick={handleCloseDrawer}>
                  Cancel
                </DrawerClose>
              </DrawerFooter>
            </form>
          </FormProvider>
        </DrawerContent>) : null}
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