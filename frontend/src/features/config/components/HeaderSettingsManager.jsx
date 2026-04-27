import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import MediaUploadField from "@/features/media/components/MediaUploadField";

const HeaderSettingsManager = ({ data, updateSiteData }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    logo: data.header.logo || "",
    title: data.header.title || "",
    subtitle: data.header.subtitle || "",
    bannerImage: data.hero?.image || "",
  });

  useEffect(() => {
    setForm({
      logo: data.header.logo || "",
      title: data.header.title || "",
      subtitle: data.header.subtitle || "",
      bannerImage: data.hero?.image || "",
    });
  }, [data.header.logo, data.header.title, data.header.subtitle, data.hero?.image]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await updateSiteData((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          logo: form.logo,
          title: form.title,
          subtitle: form.subtitle,
        },
        hero: {
          ...prev.hero,
          image: form.bannerImage,
        },
      }));
      toast.success(t("admin.headerSettings.saveSuccess"));
    } catch {
      toast.error(t("admin.headerSettings.saveError"));
    }
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>{t("admin.headerSettings.title")}</CardTitle>
        <CardDescription>{t("admin.headerSettings.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <MediaUploadField
                label={t("admin.headerSettings.fieldLogo")}
                value={form.logo}
                onChange={(nextUrl) => setForm((prev) => ({ ...prev, logo: nextUrl }))}
                previewClassName="h-20 w-20 border border-slate-200 object-contain"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("admin.headerSettings.fieldTitle")}</label>
              <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
              <label className="text-sm font-medium">{t("admin.headerSettings.fieldSubtitle")}</label>
              <Input value={form.subtitle} onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <MediaUploadField
              label={t("admin.headerSettings.fieldBanner")}
              value={form.bannerImage}
              onChange={(nextUrl) => setForm((prev) => ({ ...prev, bannerImage: nextUrl }))}
              placeholder={t("admin.headerSettings.fieldBannerUrlPlaceholder")}
              previewClassName="h-28 w-full max-w-md border border-slate-200 object-cover"
            />
          </div>

          <Button type="submit">{t("admin.headerSettings.save") || t("admin.common.save")}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default HeaderSettingsManager;
