import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { logout } from "../services/auth.service";

type LogoutButtonProps = {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  redirectTo?: string;
  onClick?: () => void;
  className?: string;
};

const LogoutButton = ({
  variant = "ghost",
  size = "sm",
  showLabel = true,
  redirectTo = ROUTES.LOGIN,
  onClick,
  className,
}: LogoutButtonProps) => {
  const handleLogout = async () => {
    if (onClick) {
      onClick();
    }
    await logout(redirectTo);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
      title="Đăng xuất"
    >
      <LogOut className="h-4 w-4" />
      {showLabel && <span className="ml-2">Đăng xuất</span>}
    </Button>
  );
};

export default LogoutButton;
