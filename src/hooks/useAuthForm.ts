import { useState } from "react";
import { emailSchema, passwordSchema, nameSchema } from "@/utils/validation";

export interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
}

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const emailResult = emailSchema.safeParse(email);
    const passwordResult = passwordSchema.safeParse(password);

    const newErrors: FormErrors = {
      email: emailResult.success ? "" : emailResult.error.errors[0].message,
      password: passwordResult.success
        ? ""
        : passwordResult.error.errors[0].message,
    };

    setErrors(newErrors);
    return emailResult.success && passwordResult.success;
  };

  const reset = () => {
    setEmail("");
    setPassword("");
    setErrors({});
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    validate,
    reset,
  };
};

export const useSignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const emailResult = emailSchema.safeParse(email);
    const passwordResult = passwordSchema.safeParse(password);
    const nameResult = nameSchema.safeParse(name);

    const newErrors: FormErrors = {
      email: emailResult.success ? "" : emailResult.error.errors[0].message,
      password: passwordResult.success
        ? ""
        : passwordResult.error.errors[0].message,
      name: nameResult.success ? "" : nameResult.error.errors[0].message,
    };

    setErrors(newErrors);
    return emailResult.success && passwordResult.success && nameResult.success;
  };

  const reset = () => {
    setEmail("");
    setPassword("");
    setName("");
    setErrors({});
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    errors,
    validate,
    reset,
  };
};
