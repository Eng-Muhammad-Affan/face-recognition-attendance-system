import { create } from "zustand";

type DashboardState = {
  logs: [];
  setLogs: () => void;
  students: [];
  setStudents: () => void;
};

export const useDashboard = create<DashboardState>()((_set) => ({
  logs: [],
  setLogs: async () => {
    try {
      // const {data} = api.get("/")
    } catch (_err) {}
  },
  students: [],
  setStudents: async () => {},
}));
