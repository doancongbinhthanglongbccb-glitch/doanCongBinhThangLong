import { Navigate, Route, Routes } from "react-router-dom";
import NotFound from "@/apps/public/pages/NotFound";
import Admin from "@/features/admin/pages/AdminPage";
import Dashboard from "@/features/admin/pages/DashboardPage";
import LoginForm from "@/features/auth/components/LoginForm";
import { PublicPostsHomePage, PublicPostsSectionPage, CmsPostsPage } from "@/features/posts";
import { ConfigManagerPage } from "@/features/config";
import { ROUTES } from "@/lib/constants";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<PublicPostsHomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginForm />} />
      <Route element={<ProtectedRoute role="editor" />}>
        <Route path={ROUTES.ADMIN_ROOT} element={<Admin />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="posts" element={<CmsPostsPage />} />
          <Route
            path="config"
            element={(
              <ProtectedRoute role="admin">
                <ConfigManagerPage />
              </ProtectedRoute>
            )}
          />
        </Route>
      </Route>
      <Route path="/:section" element={<PublicPostsSectionPage />} />
      <Route path="/:section/:subsection" element={<PublicPostsSectionPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
export { default as ProtectedRoute } from "./ProtectedRoute";