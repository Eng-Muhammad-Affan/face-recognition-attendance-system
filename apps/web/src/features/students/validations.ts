import {z} from "zod";

export const StudentsFormSchema = z.object({
    id:z.string(),
    name: z.string(),
    email: z.email(),
    department: z.string(),
    is_active: z.boolean(),
    joined_at:z.string(),
    role: z.enum(["admin", "user"]),
    registration_number: z.string(),
}).strict()