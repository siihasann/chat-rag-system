import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthTabs } from "@/components/auth/AuthTabs";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate("/workspaces");
    return null;
  }

  return (
    <AuthLayout
      title="Welcome"
      description="Sign in to your account or create a new one"
    >
      <AuthTabs />
    </AuthLayout>
  );
};

export default Auth;
