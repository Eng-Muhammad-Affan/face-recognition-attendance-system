import api from "@/lib/api";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "../../hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StudentsFormSchema } from "./validations";
import { z } from "zod"

type UserData = z.infer<typeof StudentsFormSchema> & {
    registration_number: string;
}

const userService = {
    getUsers: async (): Promise<UserData[]> => {
        const response = await api.get("/users");
        return response.data;
    },
    updateUser: async (id: string, data: Partial<UserData>): Promise<UserData> => {
        const response = await api.post(`/users/${id}`, data);
        return response.data;
    },
    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },
    toggleUserStatus: async (id: string, is_active: boolean): Promise<UserData> => {
        const response = await api.patch(`/users/${id}/status`, { is_active });
        return response.data;
    },
};

export const useStudents = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [statusToggling, setStatusToggling] = useState<Record<string, boolean>>({});

    // Initialize react-hook-form
    const formMethods = useForm<UserData>({
        resolver: zodResolver(StudentsFormSchema),
        mode: "onChange",
        defaultValues: {
            id: selectedUser?.id,
            name: selectedUser?.name,
            email: selectedUser?.email,
            role: selectedUser?.role,
            is_active: selectedUser?.is_active,
            department: selectedUser?.department,
            joined_at: selectedUser?.joined_at,
            registration_number: selectedUser?.registration_number,
        }
    });

    useEffect(() => {
        const { setValue } = formMethods;
        if (selectedUser) {
            Object.entries(selectedUser).forEach(([key, value]) => {
                setValue(key as keyof UserData, value)
            })
        }
    }, [selectedUser])

    const { toast } = useToast();
    const { reset } = formMethods;

    // Fetch users
    const fetchUsers = useCallback(async () => {
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
    }, []);

    // Handle form submission
    const onSubmit = async (data: UserData) => {
        if (!selectedUser) return;

        try {
            await userService.updateUser(selectedUser.id, data);

            // Update local state
            setUsers(users.map((user) =>
                user.id === selectedUser.id ? { ...user, ...data } : user
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
        }
    };

    // Handle delete user
    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
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
        }
    };

    // Handle toggle user status
    const handleToggleStatus = async (user: UserData) => {
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

    // Handle edit user
    const handleEditUser = (user: UserData) => {
        setSelectedUser(user);
        reset({
            name: user.name,
            email: user.email,
            department: user.department,
            role: user.role,
            is_active: user.is_active,
        });
        setIsDrawerOpen(true);
    };


    // Handle close drawer
    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedUser(null);
        reset({
            name: "",
            email: "",
            department: "",
            role: "user",
            is_active: false,
        });
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

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        users,
        setUsers,
        loading, setLoading,
        onSubmit,
        selectedUser,
        setSelectedUser,
        isDrawerOpen,
        setIsDrawerOpen,
        isDeleteDialogOpen, setIsDeleteDialogOpen,
        formMethods,
        handleDeleteUser, handleToggleStatus,
        getInitials,
        handleEditUser,
        handleCloseDrawer,
        toast,
        statusToggling
    }
}