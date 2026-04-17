import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { isLoggedIn, login } from "@/services/auth";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn()) {
      const redirect = searchParams.get("redirect") || "/admin";
      navigate(redirect, { replace: true });
    }
  }, [navigate, searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setError("");
      await login({ email, password });
      const redirect = searchParams.get("redirect") || "/admin";
      navigate(redirect, { replace: true });
    } catch {
      setError("Sai email hoặc mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f3f4f6_0%,#fafafa_42%,#ffffff_100%)] px-4 py-8 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(185,28,28,0.08),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.06),_transparent_28%)]" />

      <Card className="relative w-full max-w-[420px] border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-700 shadow-sm">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">Hệ thống quản trị nội dung</CardTitle>
            <CardDescription className="text-sm text-slate-600">Chỉ dành cho cán bộ được phân quyền</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-0 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="admin@example.com"
                aria-invalid={Boolean(error)}
                className={`h-11 rounded-lg bg-white transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 ${
                  error ? "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500" : "border-slate-300"
                }`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  aria-invalid={Boolean(error)}
                  className={`h-11 rounded-lg bg-white pr-11 transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 ${
                    error ? "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500" : "border-slate-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 transition-colors hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              className="h-11 w-full rounded-lg bg-red-700 font-semibold text-white transition-colors hover:bg-red-800 active:bg-red-900"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </Button>

            <div className="flex flex-col items-center gap-3 pt-2 text-sm sm:flex-row sm:justify-between sm:gap-4">
              <Link to="/" className="font-medium text-slate-600 transition-colors hover:text-slate-900">
                Quay về trang chủ
              </Link>

              <span className="text-slate-400">Quên mật khẩu?</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
