import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/services/api/errors";
import { ROUTES } from "@/lib/constants";
import { ensureSession, login, loginWithGoogle } from "../services/auth.service";

/** Fixed control height + radius for login actions (44px ≈ h-11, 8px radius). */
const LOGIN_CONTROL_H = "h-11 min-h-[44px]";
const LOGIN_RADIUS = "rounded-lg";

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
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonHostRef = useRef<HTMLDivElement | null>(null);

  const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const onGoogleCredential = useCallback(
    async (response: { credential?: string }) => {
      const credential = response?.credential || "";
      if (!credential) {
        setError(t("auth.login.errorGoogle"));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        await loginWithGoogle(credential);
        const redirect = searchParams.get("redirect") || ROUTES.ADMIN_ROOT;
        navigate(redirect, { replace: true });
      } catch (e) {
        setError(getApiErrorMessage(e, t("auth.login.errorGoogle")));
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, searchParams, t],
  );

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if ((window as any).google?.accounts?.id) {
      setGoogleReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client?hl=vi";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    script.onerror = () => setGoogleReady(false);
    document.head.appendChild(script);

    return () => {
      // keep script cached for subsequent visits
    };
  }, [googleClientId]);

  /** Single Google CTA via renderButton only (no One Tap / duplicate custom button). */
  useEffect(() => {
    // Host mount is inside the card, which only exists after session check — without `isChecking`
    // in deps, this effect can run while `googleReady` is true but `host` is still null and never re-run.
    if (!googleClientId || !googleReady || isChecking) {
      return;
    }

    const gid = (window as any).google?.accounts?.id;
    const host = googleButtonHostRef.current;
    if (!gid || !host) {
      return;
    }

    host.innerHTML = "";

    gid.initialize({
      client_id: googleClientId,
      callback: onGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: false,
    });

    const render = () => {
      const w = Math.max(280, Math.floor(host.getBoundingClientRect().width));
      gid.renderButton(host, {
        type: "standard",
        theme: "filled_blue",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: w,
      });
    };

    requestAnimationFrame(render);

    return () => {
      host.innerHTML = "";
      try {
        gid.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [googleClientId, googleReady, isChecking, onGoogleCredential]);

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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-muted/40 to-background px-8 py-8">
        <div className="text-center" role="status" aria-live="polite">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("auth.login.checking")}</p>
        </div>
      </div>
    );
  }

  const inputFocusClass =
    "transition-[box-shadow,border-color] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-muted/40 to-background px-4 py-8 text-foreground sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.06),_transparent_40%)]" />

      <Card className={`relative w-full max-w-[420px] border border-border bg-card shadow-lg ${LOGIN_RADIUS}`}>
        <CardHeader className="space-y-3 px-8 pb-2 pt-8 text-center">
          <div
            className={`mx-auto flex ${LOGIN_CONTROL_H} w-14 items-center justify-center ${LOGIN_RADIUS} border border-primary/15 bg-primary/5 text-primary`}
          >
            <ShieldCheck className="h-6 w-6" aria-hidden />
          </div>

          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{t("auth.login.title")}</CardTitle>
            <CardDescription className="text-xs font-normal leading-relaxed text-muted-foreground">
              {t("auth.login.subtitle")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 px-8 pb-8 pt-2">
          {googleClientId ? (
            <div className="flex flex-col gap-3">
              <p className="sr-only">{t("auth.login.googleContinue")}</p>
              <div
                ref={googleButtonHostRef}
                className={`flex min-h-[48px] w-full justify-center [&_iframe]:!max-w-full ${!googleReady ? "items-center justify-center" : ""}`}
                aria-label={t("auth.login.googleContinue")}
              />
              {!googleReady ? (
                <div className="flex justify-center py-2" role="status" aria-live="polite">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : null}
            </div>
          ) : null}

          {googleClientId ? (
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs font-medium">
                <span className="bg-card px-3 text-muted-foreground">{t("auth.login.orEmail")}</span>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
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
                disabled={isLoading}
                className={cn(
                  LOGIN_CONTROL_H,
                  LOGIN_RADIUS,
                  "border-input bg-background px-3.5 text-base text-foreground placeholder:text-muted-foreground",
                  inputFocusClass,
                  error ? "border-destructive focus-visible:ring-destructive/25" : "",
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
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
                  disabled={isLoading}
                  className={cn(
                    LOGIN_CONTROL_H,
                    LOGIN_RADIUS,
                    "border-input bg-background px-3.5 pr-12 text-base text-foreground placeholder:text-muted-foreground",
                    inputFocusClass,
                    error ? "border-destructive focus-visible:ring-destructive/25" : "",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className={cn(
                    "absolute right-0 top-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground",
                    LOGIN_CONTROL_H,
                    LOGIN_RADIUS,
                    "rounded-l-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
                  )}
                  aria-label={showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 shrink-0" /> : <Eye className="h-4 w-4 shrink-0" />}
                </button>
              </div>
            </div>

            {error ? (
              <div
                className={`${LOGIN_RADIUS} border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive`}
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-1">
              <Button
                type="submit"
                variant="outline"
                className={cn(
                  LOGIN_CONTROL_H,
                  LOGIN_RADIUS,
                  "w-full border-input font-semibold text-foreground shadow-sm hover:bg-muted/60",
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {t("auth.login.submitting")}
                  </span>
                ) : (
                  t("auth.login.submit")
                )}
              </Button>
            </div>

            <div className="flex flex-col items-center gap-3 border-t border-border pt-4 text-sm sm:flex-row sm:justify-between">
              <a
                href="/"
                className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {t("auth.login.backHome")}
              </a>
              <span className="text-muted-foreground/80">{t("auth.login.forgotPassword")}</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
