"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const user = await response.json();
        setState({ user, loading: false, error: null });
      } else {
        setState({ user: null, loading: false, error: null });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setState({
        user: null,
        loading: false,
        error: "Failed to check authentication",
      });
    }
  }, []);

  // Sign in function
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const user = await response.json();
          setState({ user, loading: false, error: null });
          toast.success("Signed in successfully");
          navigate("/workspaces");
        } else {
          const error = await response.json();
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error.message,
          }));
          toast.error(error.message || "Sign in failed");
        }
      } catch (error) {
        console.error("Sign in error:", error);
        const errorMessage = "Sign in failed";
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        toast.error(errorMessage);
      }
    },
    [navigate]
  );

  // Sign up function
  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        if (response.ok) {
          const user = await response.json();
          setState({ user, loading: false, error: null });
          toast.success("Account created successfully");
          navigate("/workspaces");
        } else {
          const error = await response.json();
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error.message,
          }));
          toast.error(error.message || "Sign up failed");
        }
      } catch (error) {
        console.error("Sign up error:", error);
        const errorMessage = "Sign up failed";
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        toast.error(errorMessage);
      }
    },
    [navigate]
  );

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      setState({ user: null, loading: false, error: null });
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Sign out failed");
    }
  }, [navigate]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    checkAuth,
  };
}
