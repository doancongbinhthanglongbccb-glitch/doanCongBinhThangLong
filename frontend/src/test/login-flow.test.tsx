import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginForm from "@/features/auth/components/LoginForm";

const authMock = vi.hoisted(() => ({
  ensureSession: vi.fn(),
  login: vi.fn(),
}));

// `LoginForm` resolves auth helpers through the feature-local service module.
vi.mock("@/features/auth/services/auth.service", () => ({
  ensureSession: authMock.ensureSession,
  login: authMock.login,
}));

describe("Login flow", () => {
  beforeEach(() => {
    authMock.ensureSession.mockReset();
    authMock.login.mockReset();
  });

  it("logs in and redirects to requested path", async () => {
    authMock.ensureSession.mockResolvedValue(false);
    authMock.login.mockResolvedValue({
      accessToken: "access-token",
      user: { id: "u1", role: "admin", username: "admin" },
    });

    render(
      <MemoryRouter initialEntries={["/login?redirect=%2Fadmin"]}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/admin" element={<div>Admin Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    // `LoginForm` shows a loading spinner while `ensureSession` settles. Wait
    // for the email field to mount before driving the form.
    const emailInput = await screen.findByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "admin@example.com" } });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(screen.getByText("Admin Page")).toBeInTheDocument();
    });

    expect(authMock.login).toHaveBeenCalledWith({
      email: "admin@example.com",
      password: "secret123",
    });
  });
});
