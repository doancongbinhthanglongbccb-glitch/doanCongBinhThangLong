import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MarkdownEditor from "@/apps/admin/components/MarkdownEditor";
import MediaUploadField from "@/features/media/components/MediaUploadField";

type PostFormState = {
  title: string;
  category: string;
  date: string;
  content: string;
  image: string;
};

type PostFormProps = {
  form: PostFormState;
  setForm: React.Dispatch<React.SetStateAction<PostFormState>>;
  categoryOptions: string[];
};

const PostForm = ({ form, setForm, categoryOptions }: PostFormProps) => {
  return (
    <div className="space-y-4">
      <section className="space-y-3 border border-slate-200 bg-white p-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Thông tin cơ bản</h4>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tiêu đề hoạt động</label>
          <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phân loại</label>
            <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ngày đăng</label>
            <Input
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              placeholder="15/04/2026"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 border border-slate-200 bg-white p-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Nội dung</h4>
        <MarkdownEditor
          label="Nội dung chi tiết"
          value={form.content}
          onChange={(nextValue) => setForm((prev) => ({ ...prev, content: nextValue }))}
          placeholder="Nhap noi dung hoat dong..."
        />
      </section>

      <section className="space-y-3 border border-slate-200 bg-white p-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Media</h4>

        <MediaUploadField
          label="Ảnh minh họa"
          value={form.image}
          onChange={(nextUrl) => setForm((prev) => ({ ...prev, image: nextUrl }))}
          previewClassName="h-24 w-40 border border-slate-200 object-cover"
          placeholder="Dán URL ảnh hoặc chọn file để upload"
        />
      </section>
    </div>
  );
};

export default PostForm;
