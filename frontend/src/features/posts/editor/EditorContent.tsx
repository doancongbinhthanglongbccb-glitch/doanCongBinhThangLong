import BlockEditor from "./blocks/BlockEditor";
import type { StructuredContentPayload } from "./blocks/useBlockEditor";

type Props = {
  /** Đổi khi tải bài mới / xong loading để hydrate lại từ HTML, không reset mỗi lần gõ. */
  hydrateKey: string;
  initialHtml: string;
  onChange: (html: string) => void;
  /** Tuỳ chọn: nhận thêm JSON blocks (không gửi lên API trừ khi bạn tự nối). */
  onStructuredChange?: (payload: StructuredContentPayload) => void;
  editable?: boolean;
  role?: "admin" | "editor" | "";
};

export default function EditorContent({
  hydrateKey,
  initialHtml,
  onChange,
  onStructuredChange,
  editable = true,
  role = "",
}: Props) {
  return (
    <BlockEditor
      hydrateKey={hydrateKey}
      initialHtml={initialHtml}
      onChange={onChange}
      onStructuredChange={onStructuredChange}
      editable={editable}
      role={role}
    />
  );
}

export type { StructuredContentPayload };
