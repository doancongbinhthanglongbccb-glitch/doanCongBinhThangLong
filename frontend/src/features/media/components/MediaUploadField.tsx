import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadMedia } from "../services/media.service";

type Props = {
  label: string;
  value: string;
  onChange: (nextUrl: string) => void;
  accept?: string;
  previewClassName?: string;
  placeholder?: string;
};

export default function MediaUploadField({
  label,
  value,
  onChange,
  accept = "image/*",
  previewClassName = "h-24 w-40 border border-slate-200 object-cover",
  placeholder = "Dán URL ảnh hoặc chọn file để upload",
}: Props) {
  const [uploading, setUploading] = useState(false);

  const previewUrl = useMemo(() => (typeof value === "string" ? value : ""), [value]);

  const handlePickFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadMedia(file);
      const url = result?.item?.url;
      if (!url) {
        throw new Error("Upload response missing url");
      }
      onChange(url);
      toast.success("Upload ảnh thành công");
    } catch {
      toast.error("Upload ảnh thất bại");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <div className="flex flex-wrap items-center gap-2">
        <Input type="file" accept={accept} onChange={handlePickFile} disabled={uploading} />
        <Button type="button" variant="secondary" disabled={!previewUrl} onClick={() => onChange("")}>
          Xóa
        </Button>
      </div>

      <Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />

      {previewUrl ? <img src={previewUrl} alt={label} className={previewClassName} /> : null}
    </div>
  );
}

