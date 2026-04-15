import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import type { NavItem } from "@/types/site";

type NavBarProps = {
  navItems: NavItem[];
};

const RenderNavLink = ({
  href,
  className,
  label,
  onClick,
}: {
  href: string;
  className: string;
  label: string;
  onClick?: () => void;
}) => {
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {label}
      </a>
    );
  }

  return (
    <Link to={href} className={className} onClick={onClick}>
      {label}
    </Link>
  );
};

const NavBar = ({ navItems }: NavBarProps) => {
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
          <button className="md:hidden p-3 text-primary-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <ul className="hidden md:flex items-stretch">
            {navItems.map((item) => {
              const hasChildren = Boolean(item.children?.length);

              if (!hasChildren) {
                return (
                  <li key={item.label}>
                    <RenderNavLink
                      href={item.href ?? "#"}
                      label={item.label}
                      className={`block px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-nav-hover ${
                        item.active ? "bg-nav-hover" : ""
                      }`}
                    />
                  </li>
                );
              }

              return (
                <li
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => setOpenMenu(item.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    type="button"
                    onClick={() => setOpenMenu((current) => (current === item.label ? null : item.label))}
                    className={`flex items-center gap-1 px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-nav-hover ${
                      openMenu === item.label ? "bg-nav-hover" : ""
                    }`}
                    aria-expanded={openMenu === item.label}
                  >
                    {item.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div
                    className={`absolute left-0 top-full min-w-72 rounded-b-lg border border-border/20 bg-nav shadow-xl overflow-hidden transition-all duration-150 ${
                      openMenu === item.label ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-1 pointer-events-none"
                    }`}
                  >
                    {item.children?.map((child) => (
                      <RenderNavLink
                        key={child.label}
                        href={child.href}
                        label={child.label}
                        className="block px-4 py-3 text-sm text-primary-foreground/90 hover:bg-nav-hover hover:text-primary-foreground"
                      />
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        {mobileOpen && (
          <ul className="md:hidden border-t border-primary-foreground/20 pb-2">
            {navItems.map((item) => {
              const hasChildren = Boolean(item.children?.length);

              if (!hasChildren) {
                return (
                  <li key={item.label}>
                    <RenderNavLink
                      href={item.href ?? "#"}
                      label={item.label}
                      className="block px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-nav-hover"
                      onClick={closeMenus}
                    />
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-nav-hover"
                    onClick={() => setOpenMenu((current) => (current === item.label ? null : item.label))}
                    aria-expanded={openMenu === item.label}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === item.label ? "rotate-180" : ""}`} />
                  </button>
                  {openMenu === item.label && (
                    <ul className="bg-nav-hover/40 border-t border-primary-foreground/10">
                      {item.children?.map((child) => (
                        <li key={child.label}>
                          <RenderNavLink
                            href={child.href}
                            label={child.label}
                            className="block px-8 py-2.5 text-sm text-primary-foreground/90 hover:bg-nav-hover"
                            onClick={closeMenus}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
