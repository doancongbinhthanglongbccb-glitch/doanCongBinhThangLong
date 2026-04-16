import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const FooterSettingsManager = ({ data, updateSiteData }) => {
  const [form, setForm] = useState(data.footer);

  useEffect(() => {
    setForm(data.footer);
  }, [data.footer]);

  const updateQuickLink = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      quickLinks: prev.quickLinks.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    await updateSiteData((prev) => ({ ...prev, footer: form }));
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Footer Settings</CardTitle>
        <CardDescription>Quản lý nội dung footer: liên hệ, liên kết và bản quyền.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tiêu đề</label>
            <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả (mỗi dòng một mục)</label>
            <textarea
              className="min-h-24 w-full border border-slate-200 p-3 text-sm"
              value={form.descriptionLines.join("\n")}
              onChange={(event) => setForm((prev) => ({ ...prev, descriptionLines: event.target.value.split("\n") }))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Liên kết nhanh</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForm((prev) => ({ ...prev, quickLinks: [...prev.quickLinks, { label: "", href: "" }] }))}
              >
                <Plus className="mr-1 h-4 w-4" />
                Thêm link
              </Button>
            </div>
            <div className="space-y-2">
              {form.quickLinks.map((item, index) => (
                <div key={`${item.label}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input value={item.label} placeholder="Nhãn" onChange={(event) => updateQuickLink(index, "label", event.target.value)} />
                  <Input value={item.href} placeholder="Đường dẫn" onChange={(event) => updateQuickLink(index, "href", event.target.value)} />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        quickLinks: prev.quickLinks.filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Thông tin liên hệ (mỗi dòng một mục)</label>
            <textarea
              className="min-h-24 w-full border border-slate-200 p-3 text-sm"
              value={form.contactLines.join("\n")}
              onChange={(event) => setForm((prev) => ({ ...prev, contactLines: event.target.value.split("\n") }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bản quyền</label>
            <Input value={form.copyright} onChange={(event) => setForm((prev) => ({ ...prev, copyright: event.target.value }))} />
          </div>

          <Button type="submit">Lưu Footer</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FooterSettingsManager;
