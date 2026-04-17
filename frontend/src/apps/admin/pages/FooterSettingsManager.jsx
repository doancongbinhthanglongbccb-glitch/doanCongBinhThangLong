import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UI_TEXT } from "@/constants/uiText";

const FooterSettingsManager = ({ data, updateSiteData }) => {
  const text = UI_TEXT.vi.admin.footerSettings;
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

    try {
      await updateSiteData((prev) => ({ ...prev, footer: form }));
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
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="space-y-2">
            <label className="text-sm font-medium">{text.fieldTitle}</label>
            <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{text.fieldDescriptionLines}</label>
            <textarea
              className="min-h-24 w-full border border-slate-200 p-3 text-sm"
              value={form.descriptionLines.join("\n")}
              onChange={(event) => setForm((prev) => ({ ...prev, descriptionLines: event.target.value.split("\n") }))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{text.quickLinks}</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForm((prev) => ({ ...prev, quickLinks: [...prev.quickLinks, { label: "", href: "" }] }))}
              >
                <Plus className="mr-1 h-4 w-4" />
                {text.addLink}
              </Button>
            </div>
            <div className="space-y-2">
              {form.quickLinks.map((item, index) => (
                <div key={`${item.label}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input value={item.label} placeholder={text.labelPlaceholder} onChange={(event) => updateQuickLink(index, "label", event.target.value)} />
                  <Input value={item.href} placeholder={text.hrefPlaceholder} onChange={(event) => updateQuickLink(index, "href", event.target.value)} />
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
            <label className="text-sm font-medium">{text.contactLines}</label>
            <textarea
              className="min-h-24 w-full border border-slate-200 p-3 text-sm"
              value={form.contactLines.join("\n")}
              onChange={(event) => setForm((prev) => ({ ...prev, contactLines: event.target.value.split("\n") }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{text.copyright}</label>
            <Input value={form.copyright} onChange={(event) => setForm((prev) => ({ ...prev, copyright: event.target.value }))} />
          </div>

          <Button type="submit">{text.save}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FooterSettingsManager;
