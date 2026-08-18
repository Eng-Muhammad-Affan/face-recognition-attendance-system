import { create } from "zustand";

type StudentsState = {
  students: [];
  fetchStudents: () => void;
};

export const useStudents = create<StudentsState>()((_set) => ({
  students: [],
  fetchStudents: async () => {
    try {
      const response = await axios.get("/users.json");
      setUsers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch attendance logs:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  },
}));
