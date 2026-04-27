import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import type { NavItem } from "@/types/site";

type NavigationProps = {
  navItems: NavItem[];
};

const RenderNavLink = ({
  href,
  className,
  label,
  onClick,
  children,
}: {
  href: string;
  className: string;
  label: string;
  onClick?: () => void;
  children?: ReactNode;
}) => {
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {label}
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={className} onClick={onClick}>
      {label}
      {children}
    </Link>
  );
};

const Navigation = ({ navItems }: NavigationProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const closeMenus = () => {
    setMobileOpen(false);
    setOpenMenu(null);
  };

  return (
    <nav className="bg-nav relative z-40">
      <div className="w-full max-w-[1600px] mx-auto px-3">
        <div className="flex items-center justify-between md:justify-start">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-nav-text hover:bg-nav-hover rounded"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div
            className={`absolute top-full left-0 right-0 bg-nav md:static md:flex md:flex-row md:items-center md:gap-1 ${
              mobileOpen ? "flex flex-col" : "hidden"
            }`}
          >
            {navItems.map((item) => (
              <div key={item.label || item.href} className="relative group">
                <RenderNavLink
                  href={item.href}
                  label={item.label}
                  className="flex items-center gap-1 px-4 py-3 text-nav-text hover:bg-nav-hover transition-colors whitespace-nowrap"
                  onClick={() => {
                    if (!item.children?.length) {
                      closeMenus();
                      return;
                    }

                    // Mobile: allow expanding submenu instead of navigating.
                    if (mobileOpen) {
                      setOpenMenu((prev) => (prev === item.href ? null : item.href));
                    }
                  }}
                >
                  {item.children?.length ? <ChevronDown size={16} /> : null}
                </RenderNavLink>

                {item.children?.length ? (
                  <div
                    className={`absolute left-0 top-full z-50 mt-1 flex-col rounded-md border border-nav-hover bg-nav shadow-lg ${
                      mobileOpen ? (openMenu === item.href ? "flex" : "hidden") : "hidden group-hover:flex"
                    }`}
                  >
                    {item.children.map((child) => (
                      <RenderNavLink
                        key={child.label || child.href}
                        href={child.href}
                        label={child.label}
                        className="px-4 py-2 text-nav-text hover:bg-nav-hover whitespace-nowrap"
                        onClick={closeMenus}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
