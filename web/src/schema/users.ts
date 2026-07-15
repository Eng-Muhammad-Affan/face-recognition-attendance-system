import z from "zod";

export const UserTableSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  department: z.string(),
  is_active: z.boolean(),
  joined_at: z.string(),
  role: z.string(),
  status: z.string(),
});
