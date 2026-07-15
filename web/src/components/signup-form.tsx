import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema } from "@/schema/signup";
import type z from "zod";
import { useState, useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";

type SignupFormData = z.infer<typeof SignupSchema>;
const api_url = process.env.NEXT_PUBLIC_API_URL as string;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignupSchema),
    mode: "onChange",
  });

  const _file = watch("file");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPreviewFileName(file.name);
      // ✅ FIX: Make sure to set the value correctly
      setValue("file", file, { shouldValidate: true }); // Add shouldValidate
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewFileName(null);
    }
    // ✅ FIX: Set to undefined instead of any
    setValue("file", null, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("department", data.department);
    formData.append("image", data.file);

    try {
      const response = await fetch(`${api_url}/auth/signup`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>

        {/* Name Field */}
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            className="bg-background"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </Field>

        {/* Email Field */}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            className="bg-background"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </Field>

        {/* Department Field */}
        <Field>
          <FieldLabel htmlFor="department">Department</FieldLabel>
          <Input
            id="department"
            type="text"
            placeholder="Computer Science"
            className="bg-background"
            {...register("department")}
          />
          {errors.department && (
            <p className="text-sm text-red-500">{errors.department.message}</p>
          )}
        </Field>

        {/* File Upload Field with Preview */}
        <Field>
          <FieldLabel htmlFor="file">Profile Picture</FieldLabel>
          <div className="w-20 h-20">
            {previewUrl ? (
              <div className="relative w-20 h-20">
                <Image
                  width={100}
                  height={100}
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover rounded-sm border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full">
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-2 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-1 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, WEBP (Max 5MB)
                    </p>
                  </div>
                  <Input
                    id="file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    {...register("file")}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
              </div>
            )}
          </div>

          {errors.file && (
            <p className="text-sm text-red-500">{errors.file.message}</p>
          )}
          <FieldDescription>
            {previewFileName && previewFileName}
          </FieldDescription>
          <br />
        </Field>

        {/* Submit Button */}
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
