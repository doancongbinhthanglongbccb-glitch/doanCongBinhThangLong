import { useState } from "react";
import { PenLine, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MarkdownEditor from "@/apps/admin/components/MarkdownEditor";
import MarkdownContent from "@/shared/components/MarkdownContent";

const blankForm = {
  title: "",
  summary: "",
  image: "",
  link: "",
};

const SidebarManager = ({ data, createItem, updateItem, deleteItem }) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(blankForm);
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      summary: item.summary || "",
      image: item.image || "",
      link: item.link || "",
    });
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (editingId) {
      await updateItem("binhDanHocVu", editingId, form);
    } else {
      await createItem("binhDanHocVu", form);
    }

    setOpen(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="rounded-none">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Bình dân học vụ số</CardTitle>
          <CardDescription>Quản lý danh sách liên kết của Sidebar.</CardDescription>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Tóm tắt</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.binhDanHocVu.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="h-14 w-24 border border-slate-200 object-cover" />
                    ) : (
                      <div className="h-14 w-24 border border-dashed border-slate-300 text-xs text-slate-500 grid place-items-center">
                        No image
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{item.link}</div>
                  </TableCell>
                  <TableCell>
                    <MarkdownContent value={item.summary || "-"} className="prose prose-slate line-clamp-2 max-w-none text-sm text-slate-600" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                        <PenLine className="mr-2 h-4 w-4" />
                        Sửa
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteItem("binhDanHocVu", item.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-none max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Sửa bài viết Bình dân học vụ số" : "Thêm bài viết Bình dân học vụ số"}</DialogTitle>
            <DialogDescription>Nhập ảnh, tiêu đề và tóm tắt để hiển thị theo dạng danh sách bài viết.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề bài viết</label>
              <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <MarkdownEditor
                label="Tom tat"
                value={form.summary}
                onChange={(nextValue) => setForm((prev) => ({ ...prev, summary: nextValue }))}
                placeholder="Nhap tom tat bai viet..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ảnh bài viết</label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              <p className="text-xs text-slate-500">Chọn ảnh từ thiết bị để hiển thị thumbnail và bài nổi bật.</p>
              {form.image ? (
                <img src={form.image} alt="preview" className="h-28 w-44 border border-slate-200 object-cover" />
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Link điều hướng</label>
              <Input value={form.link} onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SidebarManager;
