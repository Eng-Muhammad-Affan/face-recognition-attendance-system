export type User = {
  registration_number: string;
  name: string;
  role: "user" | "admin";
  joined_at: string;
  id: string;
  email: string;
  department: "string";
  is_active: boolean;
};
