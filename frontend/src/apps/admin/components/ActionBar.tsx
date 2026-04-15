import { Button } from "@/components/ui/button";

type ActionBarProps = {
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isSaving: boolean;
};

const ActionBar = ({ onBack, onSaveDraft, onPublish, isSaving }: ActionBarProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-slate-50 px-4 py-3">
      <Button type="button" variant="outline" onClick={onBack} disabled={isSaving}>
        ← Quay lại
      </Button>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={onSaveDraft} disabled={isSaving}>
          {isSaving ? "Đang lưu..." : "Lưu nháp"}
        </Button>
        <Button type="button" onClick={onPublish} disabled={isSaving}>
          {isSaving ? "Đang xuất bản..." : "Xuất bản"}
        </Button>
      </div>
    </div>
  );
};

export default ActionBar;
