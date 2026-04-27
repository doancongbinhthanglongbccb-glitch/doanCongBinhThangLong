import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ensureSession, hasRoleAccess } from "../services/auth.service";
import type { Role } from "../types/auth.types";

type RequireAuthProps = {
  children?: ReactNode;
  role?: Role;
};

const RequireAuth = ({ children, role }: RequireAuthProps) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      const sessionOk = await ensureSession();

      if (!mounted) {
        return;
      }

      setAuthenticated(sessionOk);
      setChecking(false);
    };

    void verify();

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return <div className="container py-10">Dang xac thuc...</div>;
  }

  if (!authenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (role && !hasRoleAccess(role)) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RequireAuth;