import Navigation from "@/app/layout/Navigation";
import Footer from "@/app/layout/Footer";
import Chatbot from "@/shared/components/Chatbot";
import chatbotIcon from "@/assets/chatbot.png";

const BANNER_FOCUS_Y = "30%";

const normalizePath = (value = "/") => {
  const raw = String(value || "").trim();
  if (!raw) {
    return "/";
  }

  const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const compact = withLeadingSlash.replace(/\/{2,}/g, "/");
  const withoutTrailingSlash = compact !== "/" ? compact.replace(/\/+$/, "") : compact;
  return withoutTrailingSlash || "/";
};

const resolveChildHref = (parentHref, childHref) => {
  const parent = normalizePath(parentHref);
  const child = normalizePath(childHref);

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

const getVisibleNavItems = (navItems = []) => {
  return navItems
    .filter((item) => item.visible !== false)
    .map((item) => {
      const normalizedParentHref = normalizePath(item.href);
      const children = (item.children || [])
        .filter((child) => child.visible !== false)
        .map((child) => ({
          ...child,
          href: resolveChildHref(normalizedParentHref, child.href),
        }));

      return {
        ...item,
        href: normalizedParentHref,
        children,
      };
    });
};

const PublicLayout = ({ data, topBarDate, children }) => {
  const navItems = getVisibleNavItems(data.navItems || []);
  const topbarLabel = data?.header?.topbarLabel || data?.header?.title || "";

  return (
    <div id="trang-chu" className="min-h-screen bg-slate-100 text-slate-900">
      <div className="sticky top-0 z-50">
        <div className="bg-topbar text-white">
          <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-3 px-3 py-2 text-sm">
            {topbarLabel ? (
              <span className="font-medium uppercase tracking-[0.14em] text-white/80">{topbarLabel}</span>
            ) : (
              <span />
            )}
            <span className="font-semibold capitalize text-right whitespace-nowrap">{topBarDate}</span>
          </div>
        </div>

        <header className="bg-white border-b border-slate-200">
          <div className="w-full max-w-[1600px] mx-auto px-3 py-3 flex items-center gap-4">
            <img src={data.header.logo} alt="logo" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-4xl font-bold text-primary uppercase">{data.header.title}</h1>
              <p className="text-gold text-lg font-semibold uppercase">{data.header.subtitle}</p>
            </div>
          </div>
        </header>

        <Navigation navItems={navItems} />
      </div>

      <section className="w-full overflow-hidden bg-white">
        <img
          src={data.hero.image}
          alt="hero"
          className="block w-full object-cover h-[240px] md:h-[380px] lg:h-[540px]"
          style={{
            aspectRatio: "1360 / 540",
            objectPosition: `center ${BANNER_FOCUS_Y}`,
          }}
        />
      </section>

      <main className="mt-6">{children}</main>

      <Footer
        logo={data.header.logo}
        title={data.footer?.title}
        descriptionLines={data.footer?.descriptionLines}
        quickLinks={data.footer?.quickLinks}
        navItems={navItems}
        contactLines={data.footer?.contactLines}
        copyright={data.footer?.copyright}
      />

      {data.chatbot && <Chatbot chatbotContent={data.chatbot} emblem={chatbotIcon} />}
    </div>
  );
};

export default PublicLayout;