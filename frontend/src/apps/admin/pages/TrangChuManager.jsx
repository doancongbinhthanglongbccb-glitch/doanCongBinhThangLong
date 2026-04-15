import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const TrangChuManager = ({ data, updateSiteData }) => {
  const [form, setForm] = useState({
    headerLogo: data.header.logo,
    heroImage: data.hero.image,
  });

  const handleImageUpload = (field) => (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, [field]: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await updateSiteData((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        logo: form.headerLogo,
      },
      hero: {
        ...prev.hero,
        image: form.heroImage,
      },
    }));
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Trang chủ</CardTitle>
        <CardDescription>Chỉnh sửa logo đơn vị và ảnh banner (không có nhập tiêu đề banner vì public đã tắt phần chữ).</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo đơn vị</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload("headerLogo")}
              />
              {form.headerLogo ? <img src={form.headerLogo} alt="Logo preview" className="h-20 w-20 border border-slate-200 object-contain" /> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ảnh banner trang chủ</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload("heroImage")}
              />
              {form.heroImage ? <img src={form.heroImage} alt="Banner preview" className="h-20 w-36 border border-slate-200 object-cover" /> : null}
            </div>
          </div>
          <Button type="submit">Lưu Trang chủ</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TrangChuManager;
