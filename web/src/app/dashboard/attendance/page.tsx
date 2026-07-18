"use client";

import { DataTable } from "@/components/data-table";
import { useState, useEffect } from "react";
import axios from "axios";
import type { UserTableSchema } from "@/schema";
import type z from "zod";

type Data = z.infer<typeof UserTableSchema>;

const StudentsPage = () => {
  const [users, setUsers] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get("/users.json");
        setUsers(response.data || []);
      } catch (error) {
        console.error("Failed to fetch attendance logs:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return null;
  }
  return <DataTable data={users} />;
};

export default StudentsPage;
