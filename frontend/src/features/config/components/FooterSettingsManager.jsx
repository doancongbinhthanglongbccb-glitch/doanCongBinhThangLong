import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

const composeChildPath = (parentHref, childHref) => {
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

const buildQuickLinksFromMenu = (navItems = []) => {
  const links = [];

  navItems.forEach((item) => {
    if (item.visible === false) {
      return;
    }

    if (item.href) {
      links.push({ label: item.label, href: normalizePath(item.href) });
    }

    (item.children || []).forEach((child) => {
      if (child.visible === false) {
        return;
      }

      links.push({
        label: child.label,
        href: composeChildPath(item.href, child.href),
      });
    });
  });

  return Array.from(new Map(links.map((link) => [`${link.label}-${link.href}`, link])).values());
};

const FooterSettingsManager = ({ data, updateSiteData }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState(data.footer);
  const autoMappedLinks = buildQuickLinksFromMenu(data.navItems || []);

  useEffect(() => {
    setForm(data.footer);
  }, [data.footer]);

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      await updateSiteData((prev) => ({
        ...prev,
        footer: {
          ...form,
          quickLinks: buildQuickLinksFromMenu(prev.navItems || []),
        },
      }));
      toast.success(t("admin.footerSettings.saveSuccess"));
    } catch {
      toast.error(t("admin.footerSettings.saveError"));
    }
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>{t("admin.footerSettings.title")}</CardTitle>
        <CardDescription>{t("admin.footerSettings.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("admin.footerSettings.fieldTitle")}</label>
            <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("admin.footerSettings.fieldDescriptionLines")}</label>
            <textarea
              className="min-h-24 w-full border border-slate-200 p-3 text-sm"
              value={form.descriptionLines.join("\n")}
              onChange={(event) => setForm((prev) => ({ ...prev, descriptionLines: event.target.value.split("\n") }))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium">{t("admin.footerSettings.quickLinks")}</label>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                <p>{t("admin.footerSettings.syncFromMenuNote")}</p>
              </div>
              <div className="mt-3 space-y-1.5">
                {autoMappedLinks.length > 0 ? (
                  autoMappedLinks.map((item) => (
                    <div key={`${item.label}-${item.href}`} className="flex items-center gap-2 text-slate-700">
                      <Link2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="font-medium">{item.label}</span>
                      <span className="text-slate-400">·</span>
                      <span className="truncate text-slate-500">{item.href}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">{t("admin.footerSettings.noMenuToSync")}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("admin.footerSettings.contactLines")}</label>
            <textarea
              className="min-h-24 w-full border border-slate-200 p-3 text-sm"
              value={form.contactLines.join("\n")}
              onChange={(event) => setForm((prev) => ({ ...prev, contactLines: event.target.value.split("\n") }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("admin.footerSettings.copyright")}</label>
            <Input value={form.copyright} onChange={(event) => setForm((prev) => ({ ...prev, copyright: event.target.value }))} />
          </div>

          <Button type="submit">{t("admin.footerSettings.save")}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FooterSettingsManager;
