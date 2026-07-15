import axios from "axios";

const api = axios.create({
  // Replace process.env with import.meta.env
  baseURL: process.env.NEXT_PUBLIC_API_URL as string,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;
