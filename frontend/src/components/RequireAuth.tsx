import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { hasRoleAccess, isLoggedIn } from "@/services/auth";

type Role = "admin" | "editor";

type RequireAuthProps = {
  children?: ReactNode;
  role?: Role;
};

const RequireAuth = ({ children, role }: RequireAuthProps) => {
  const location = useLocation();

  if (!isLoggedIn()) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (role && !hasRoleAccess(role)) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RequireAuth;
