import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadMedia } from "@/features/media/services/media.service";
import MediaLibraryModal from "@/features/media/components/MediaLibraryModal";

type Props = {
  value: string;
  onChange: (nextUrl: string) => void;
  role?: "admin" | "editor" | "";
};

export default function ThumbnailUpload({ value, onChange, role = "" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const previewUrl = useMemo(() => (typeof value === "string" ? value.trim() : ""), [value]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
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
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] },
    disabled: uploading,
    noClick: true,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-800">Ảnh đại diện</p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => setLibraryOpen(true)}>
            Thư viện
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => open()}>
            <ImagePlus className="mr-1.5 h-4 w-4" />
            Thay ảnh
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-red-700 hover:bg-red-50 hover:text-red-800"
            disabled={!previewUrl || uploading}
            onClick={() => onChange("")}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Gỡ
          </Button>
        </div>
      </div>

      {previewUrl ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src={previewUrl}
            alt="Xem trước ảnh đại diện"
            className="max-h-52 w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border border-dashed p-4 text-center text-sm transition-colors ${
          uploading ? "pointer-events-none opacity-60" : ""
        } ${isDragActive ? "border-red-400 bg-red-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"}`}
      >
        <input {...getInputProps()} />
        <p className="text-slate-600">
          {uploading ? "Đang upload…" : isDragActive ? "Thả ảnh để upload" : "Kéo thả ảnh vào đây hoặc dùng Thay ảnh / Thư viện"}
        </p>
      </div>

      <Input
        value={value}
        placeholder="Hoặc dán URL ảnh"
        onChange={(e) => onChange(e.target.value)}
        disabled={uploading}
        className="rounded-lg border-slate-300"
      />

      <MediaLibraryModal
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        role={role}
        onSelect={(asset) => onChange(asset.url)}
      />
    </div>
  );
}
