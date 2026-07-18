import {
  LayoutDashboardIcon,
  ListIcon,
  UsersIcon,
  Table
} from "lucide-react";
import React from "react";

export const dashboardNavLinks = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Attendance",
    url: "/dashboard/attendance",
    icon: Table,
  },
  {
    title: "Logs",
    url: "/dashboard/logs",
    icon: ListIcon,
  },
  {
    title: "Students",
    url: "/dashboard/students",
    icon: UsersIcon,
  },

]