import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { useSignupForm } from "@/hooks/useAuthForm";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export const SignupForm = () => {
  const { signUp } = useAuth();
  const {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    errors,
    validate,
  } = useSignupForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    await signUp(email, password, name);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="signup-name"
        label="Full Name"
        type="text"
        placeholder="John Doe"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />

      <FormField
        id="signup-email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />

      <FormField
        id="signup-password"
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
};
