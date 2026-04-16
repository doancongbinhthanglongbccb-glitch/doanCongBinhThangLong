import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const HeaderSettingsManager = ({ data, updateSiteData }) => {
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

    await updateSiteData((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        logo: form.logo,
        title: form.title,
        subtitle: form.subtitle,
      },
    }));
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Header Settings</CardTitle>
        <CardDescription>Quản lý logo, tiêu đề và khẩu hiệu hiển thị ở đầu trang.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo</label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {form.logo ? <img src={form.logo} alt="Header logo preview" className="h-20 w-20 border border-slate-200 object-contain" /> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề</label>
              <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
              <label className="text-sm font-medium">Khẩu hiệu</label>
              <Input value={form.subtitle} onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))} />
            </div>
          </div>
          <Button type="submit">Lưu Header</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default HeaderSettingsManager;
