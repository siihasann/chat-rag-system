"use client";

import { ReactNode } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div className="text-center">
        <div
          className={`animate-spin border-4 border-primary border-t-transparent rounded-full mx-auto mb-4 ${sizeClasses[size]}`}
        ></div>
        {message && <p className="text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}

interface FullPageLoadingProps {
  message?: string;
}

export function FullPageLoading({
  message = "Loading...",
}: FullPageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" message={message} />
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  // This is a simplified error boundary
  // In a real app, you'd want to use a proper error boundary component
  return <>{children}</>;
}
