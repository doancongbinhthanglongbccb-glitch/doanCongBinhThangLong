import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const TrangChuManager = ({ data, updateSiteData }) => {
  const [form, setForm] = useState({
    headerTitle: data.header.title,
    headerSubtitle: data.header.subtitle,
    heroTitle: data.hero.title,
    heroSubtitle: data.hero.subtitle,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    await updateSiteData((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        title: form.headerTitle,
        subtitle: form.headerSubtitle,
      },
      hero: {
        ...prev.hero,
        title: form.heroTitle,
        subtitle: form.heroSubtitle,
      },
    }));
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Trang chủ</CardTitle>
        <CardDescription>Chỉnh sửa nội dung Header và Hero của Trang chủ.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">header.title</label>
              <Input
                value={form.headerTitle}
                onChange={(event) => setForm((prev) => ({ ...prev, headerTitle: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">header.subtitle</label>
              <Input
                value={form.headerSubtitle}
                onChange={(event) => setForm((prev) => ({ ...prev, headerSubtitle: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">hero.title</label>
              <Input
                value={form.heroTitle}
                onChange={(event) => setForm((prev) => ({ ...prev, heroTitle: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">hero.subtitle</label>
              <Input
                value={form.heroSubtitle}
                onChange={(event) => setForm((prev) => ({ ...prev, heroSubtitle: event.target.value }))}
              />
            </div>
          </div>
          <Button type="submit">Lưu Trang chủ</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TrangChuManager;
