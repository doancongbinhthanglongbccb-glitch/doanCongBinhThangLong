import type { Editor } from "@tiptap/react";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Props = {
  editor: Editor | null;
  editable: boolean;
  onInsertImage: () => void;
  imageBusy?: boolean;
};

const toolBtn = (active: boolean) =>
  cn(
    "h-8 w-8 shrink-0 rounded-md p-0",
    active ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  );

export default function EditorToolbar({ editor, editable, onInsertImage, imageBusy }: Props) {
  if (!editor) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50/90 px-2 py-2"
      role="toolbar"
      aria-label="Định dạng nội dung"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={toolBtn(editor.isActive("heading", { level: 1 }))}
        disabled={!editable}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        aria-pressed={editor.isActive("heading", { level: 1 })}
        title="Tiêu đề 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={toolBtn(editor.isActive("heading", { level: 2 }))}
        disabled={!editable}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-pressed={editor.isActive("heading", { level: 2 })}
        title="Tiêu đề 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={toolBtn(editor.isActive("heading", { level: 3 }))}
        disabled={!editable}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        aria-pressed={editor.isActive("heading", { level: 3 })}
        title="Tiêu đề 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={toolBtn(editor.isActive("bold"))}
        disabled={!editable}
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-pressed={editor.isActive("bold")}
        title="Đậm"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={toolBtn(editor.isActive("italic"))}
        disabled={!editable}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        aria-pressed={editor.isActive("italic")}
        title="Nghiêng"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={toolBtn(editor.isActive("bulletList"))}
        disabled={!editable}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-pressed={editor.isActive("bulletList")}
        title="Danh sách bullet"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={toolBtn(editor.isActive("orderedList"))}
        disabled={!editable}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        aria-pressed={editor.isActive("orderedList")}
        title="Danh sách đánh số"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 px-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        disabled={!editable || imageBusy}
        onClick={onInsertImage}
        title="Chèn ảnh"
      >
        <ImageIcon className="h-4 w-4" />
        <span className="hidden text-xs font-medium sm:inline">Ảnh</span>
      </Button>
    </div>
  );
}
