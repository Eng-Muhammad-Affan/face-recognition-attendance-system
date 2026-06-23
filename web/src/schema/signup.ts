import { z } from "zod"

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const SignupSchema = z.object({
    name: z
        .string("Invalid name")
        .min(7, "Minimum 7 characters required")
        .max(20, "Maximum 20 characters required"),
    email: z.email("Invalid email"),

    department: z.string("Invalid department")
        .min(2, "Minimum 2 characters required")
        .max(100, "Maximum 100 characters required"),
    file: z
        .instanceof(File) // ✅ Changed from custom<FileList>()
        .refine((file) => file.size <= MAX_FILE_SIZE, "Max file size is 5MB.")
        .refine(
            (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
            "Only .jpg, .jpeg, .png and .webp formats are supported."
        )
        .optional() // Make it optional if you want to allow no file
        .refine((file) => file !== undefined, "File is required.") // Add this for required
}).strict()