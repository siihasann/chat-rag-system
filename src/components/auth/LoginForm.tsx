import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { useLoginForm } from "@/hooks/useAuthForm";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export const LoginForm = () => {
  const { signIn } = useAuth();
  const { email, setEmail, password, setPassword, errors, validate } =
    useLoginForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="login-email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />

      <FormField
        id="login-password"
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
};
