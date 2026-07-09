import api from "@/lib/api"
import { create } from "zustand"

type DashboardState = {
    logs: []
    setLogs: () => void
    students: []
    setStudents: () => void;
}

export const useDashboard = create<DashboardState>()((set) => (
    {
        logs: [],
        setLogs: async () => {
            try {
                // const {data} = api.get("/")
            } catch (err) {
                
            }
        },
        students: [],
        setStudents: async () => {

        },
    }
))