import MarkdownContent from "@/shared/components/MarkdownContent";

type PostPreviewProps = {
  title: string;
  category: string;
  date: string;
  content: string;
  image?: string;
};

const PostPreview = ({ title, category, date, content, image }: PostPreviewProps) => {
  return (
    <div className="space-y-3 border border-slate-200 bg-white p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Xem trước</h4>

      <article className="border border-slate-200 bg-white p-4">
        {image ? <img src={image} alt={title || "preview"} className="mb-3 h-44 w-full object-cover" /> : null}

        <div className="flex items-center justify-between gap-3">
          <h5 className="text-xl font-semibold text-slate-900">{title || "Tiêu đề bài viết"}</h5>
          <span className="text-sm text-slate-500">{date || "--/--/----"}</span>
        </div>

        <p className="mt-2 text-sm text-slate-600">{category || "Phân loại"}</p>
        <MarkdownContent value={content || "Nội dung bài viết sẽ hiển thị ở đây."} className="prose prose-slate mt-2 max-w-none text-slate-700" />
      </article>
    </div>
  );
};

export default PostPreview;
