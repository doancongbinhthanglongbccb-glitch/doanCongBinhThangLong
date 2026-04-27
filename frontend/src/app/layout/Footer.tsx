import type { NavItem } from "@/shared/types/cms";

type FooterProps = {
  logo?: string;
  title?: string;
  descriptionLines?: string[];
  quickLinks?: Array<{ label: string; href: string }>;
  navItems?: NavItem[];
  contactLines?: string[];
  copyright?: string;
};

const normalizePath = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const compact = withLeadingSlash.replace(/\/{2,}/g, "/");
  const withoutTrailingSlash = compact !== "/" ? compact.replace(/\/+$/, "") : compact;
  return withoutTrailingSlash || "/";
};

const resolveChildHref = (parentHref: string, childHref: string) => {
  const parent = normalizePath(parentHref);
  const child = normalizePath(childHref);

  if (!child) {
    return parent;
  }

  if (child === "/") {
    return parent;
  }

  if (parent === "/" || child.startsWith(`${parent}/`)) {
    return child;
  }

  const childSegments = child.split("/").filter(Boolean);
  if (childSegments.length === 1) {
    return `${parent}/${childSegments[0]}`.replace(/\/{2,}/g, "/");
  }

  return child;
};

const collectNavLinks = (navItems: NavItem[] = [], parentHref = ""): Array<{ label: string; href: string }> => {
  const links: Array<{ label: string; href: string }> = [];

  for (const item of navItems) {
    if (item.visible === false) {
      continue;
    }

    const normalizedHref = normalizePath(item.href || parentHref);
    if (item.href) {
      links.push({
        label: item.label,
        href: normalizedHref,
      });
    }
  }

  return Array.from(new Map(links.map((item) => [`${item.label}-${item.href}`, item])).values());
};

const Footer = ({
  logo,
  title,
  descriptionLines = [],
  quickLinks = [],
  contactLines = [],
  copyright,
  navItems = [],
}: FooterProps) => {
  const mappedLinks = collectNavLinks(navItems);
  const linksToRender = mappedLinks.length > 0 ? mappedLinks : quickLinks;

  return (
    <footer className="mt-10 bg-olive text-accent-foreground">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.25fr_1fr_1fr] md:gap-10 lg:gap-14">
          <div>
            <div className="flex items-center gap-3">
              {logo && <img src={logo} alt="logo" className="h-14 w-14 shrink-0 object-contain md:h-16 md:w-16" />}
              {title ? (
                <h2 className="text-xl md:text-2xl font-bold uppercase leading-tight tracking-wide text-gold">{title}</h2>
              ) : null}
            </div>
            {descriptionLines.length > 0 ? (
              <div className="mt-4 space-y-1 text-base md:text-lg leading-relaxed text-accent-foreground/85">
                {descriptionLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}
          </div>

          {linksToRender.length > 0 ? (
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-accent-foreground">Liên kết</h3>
              <ul className="mt-4 space-y-1.5 text-base md:text-lg leading-relaxed text-accent-foreground/85">
                {linksToRender.map((item) => (
                  <li key={`${item.label}-${item.href}`}>
                    <a href={item.href} className="hover:text-gold transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {contactLines.length > 0 ? (
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-accent-foreground">Liên hệ</h3>
              <ul className="mt-4 space-y-1.5 text-base md:text-lg leading-relaxed text-accent-foreground/85">
                {contactLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {copyright ? (
          <div className="mt-10 border-t border-accent-foreground/20 pt-6 text-center text-sm text-accent-foreground/70">
            {copyright}
          </div>
        ) : null}
      </div>
    </footer>
  );
};

export default Footer;
