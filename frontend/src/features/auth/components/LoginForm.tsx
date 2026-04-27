import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { getApiErrorMessage } from "@/services/api/errors";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "../hooks/useAuth";
import { ensureSession, login } from "../services/auth.service";

const LoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const sessionOk = await ensureSession();
      if (!mounted || !sessionOk) {
        setIsChecking(false);
        return;
      }

      const redirect = searchParams.get("redirect") || ROUTES.ADMIN_ROOT;
      navigate(redirect, { replace: true });
    };

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, [navigate, searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setError("");
      await login({ email, password });
      const redirect = searchParams.get("redirect") || ROUTES.ADMIN_ROOT;
      navigate(redirect, { replace: true });
    } catch (err: any) {
      setError(getApiErrorMessage(err, t("auth.login.errorInvalid")));
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f3f4f6_0%,#fafafa_42%,#ffffff_100%)]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-red-700" />
          <p className="text-slate-600">{t("auth.login.checking")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f3f4f6_0%,#fafafa_42%,#ffffff_100%)] px-4 py-8 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(185,28,28,0.08),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.06),_transparent_28%)]" />

      <Card className="relative w-full max-w-[420px] border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-700 shadow-sm">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">{t("auth.login.title")}</CardTitle>
            <CardDescription className="text-sm text-slate-600">{t("auth.login.subtitle")}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-0 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                {t("auth.login.email")}
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
                {t("auth.login.password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder={t("auth.login.passwordPlaceholder")}
                  aria-invalid={Boolean(error)}
                  className={`h-11 rounded-lg bg-white pr-11 transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 ${
                    error ? "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500" : "border-slate-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 transition-colors hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  aria-label={showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")}
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
                  {t("auth.login.submitting")}
                </span>
              ) : (
                t("auth.login.submit")
              )}
            </Button>

            <div className="flex flex-col items-center gap-3 pt-2 text-sm sm:flex-row sm:justify-between sm:gap-4">
              <a href="/" className="font-medium text-slate-600 transition-colors hover:text-slate-900">
                {t("auth.login.backHome")}
              </a>

              <span className="text-slate-400">{t("auth.login.forgotPassword")}</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
