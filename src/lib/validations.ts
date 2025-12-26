import { z } from "zod";

// Common validation schemas
export const authSchemas = {
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
};

// Login form schema
export const loginSchema = z.object({
  email: authSchemas.email,
  password: authSchemas.password,
});

// Signup form schema
export const signupSchema = z.object({
  email: authSchemas.email,
  password: authSchemas.password,
  name: authSchemas.name,
});

// Workspace form schema
export const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
  description: z.string().optional(),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type WorkspaceFormData = z.infer<typeof workspaceSchema>;

// Validation helper functions
export const validateEmail = (email: string): string => {
  const result = authSchemas.email.safeParse(email);
  return result.success
    ? ""
    : result.error.errors[0]?.message || "Invalid email";
};

export const validatePassword = (password: string): string => {
  const result = authSchemas.password.safeParse(password);
  return result.success
    ? ""
    : result.error.errors[0]?.message || "Invalid password";
};

export const validateName = (name: string): string => {
  const result = authSchemas.name.safeParse(name);
  return result.success
    ? ""
    : result.error.errors[0]?.message || "Invalid name";
};
