import { z } from "zod"

const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const SignupSchema = z.object({
    
    file: z
        .custom<FileList>()
        .refine((files) => files && files.length > 0, "File is required.")
        .transform((files) => files[0]) // Transform FileList into a single File object
        .refine((file) => file.size <= MAX_FILE_SIZE, "Max file size is 5MB.")
        .refine(
            (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
            "Only .jpg, .jpeg, .png and .webp formats are supported."
        ),
}).strict()