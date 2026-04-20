import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RequireAuth from "@/components/RequireAuth";

const authMock = vi.hoisted(() => ({
  ensureSession: vi.fn(),
  hasRoleAccess: vi.fn(),
}));

vi.mock("@/services/auth", () => ({
  ensureSession: authMock.ensureSession,
  hasRoleAccess: authMock.hasRoleAccess,
}));

describe("RequireAuth", () => {
  beforeEach(() => {
    authMock.ensureSession.mockReset();
    authMock.hasRoleAccess.mockReset();
  });

  it("redirects unauthenticated users to login", async () => {
    authMock.ensureSession.mockResolvedValue(false);

    render(
      <MemoryRouter initialEntries={["/admin/posts"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<RequireAuth role="editor" />}>
            <Route path="/admin/posts" element={<div>Protected Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });

  it("renders content for authenticated user with valid role", async () => {
    authMock.ensureSession.mockResolvedValue(true);
    authMock.hasRoleAccess.mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={["/admin/posts"]}>
        <Routes>
          <Route element={<RequireAuth role="editor" />}>
            <Route path="/admin/posts" element={<div>Protected Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Protected Page")).toBeInTheDocument();
    });
  });
});
