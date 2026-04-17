import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UI_TEXT } from "@/constants/uiText";

const HeaderSettingsManager = ({ data, updateSiteData }) => {
  const text = UI_TEXT.vi.admin.headerSettings;
  const commonText = UI_TEXT.vi.admin.common;
  const [form, setForm] = useState({
    logo: data.header.logo || "",
    title: data.header.title || "",
    subtitle: data.header.subtitle || "",
  });

  useEffect(() => {
    setForm({
      logo: data.header.logo || "",
      title: data.header.title || "",
      subtitle: data.header.subtitle || "",
    });
  }, [data.header.logo, data.header.title, data.header.subtitle]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, logo: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

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
      }));
      toast.success(text.saveSuccess);
    } catch {
      toast.error(text.saveError);
    }
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{text.fieldLogo}</label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {form.logo ? <img src={form.logo} alt={text.logoPreviewAlt} className="h-20 w-20 border border-slate-200 object-contain" /> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{text.fieldTitle}</label>
              <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
              <label className="text-sm font-medium">{text.fieldSubtitle}</label>
              <Input value={form.subtitle} onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))} />
            </div>
          </div>
          <Button type="submit">{text.save || commonText.save}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default HeaderSettingsManager;
