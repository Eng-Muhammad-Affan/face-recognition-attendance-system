import z from "zod";

export const UserTableSchema = z.object({
  id: z.string(),
  name: z.string(),
  registration_number: z.string(),
   role: z.string(),
  department: z.string(),
  check_in_time: z.string(),
  date: z.string(),
  status: z.string(),
});
