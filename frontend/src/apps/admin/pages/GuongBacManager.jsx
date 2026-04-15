import { useState } from "react";
import { PenLine, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MarkdownEditor from "@/apps/admin/components/MarkdownEditor";

const typeOptions = ["Lời Bác", "Điều luật"];

const blankForm = {
  title: "",
  content: "",
  type: typeOptions[0],
};

const GuongBacManager = ({ data, createItem, updateItem, deleteItem }) => {
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
    setForm({ title: item.title, content: item.content, type: item.type });
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...form };

    if (editingId) {
      await updateItem("guongBac", editingId, payload);
    } else {
      await createItem("guongBac", payload);
    }

    setOpen(false);
  };

  return (
    <Card className="rounded-none">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Theo gương Bác</CardTitle>
          <CardDescription>Quản lý nội dung Lời Bác và Điều luật.</CardDescription>
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
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.guongBac.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{item.type}</div>
                  </TableCell>
                  <TableCell>{item.date || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                        <PenLine className="mr-2 h-4 w-4" />
                        Sửa
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteItem("guongBac", item.id)}>
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
            <DialogTitle>{editingId ? "Sửa nội dung" : "Thêm nội dung"}</DialogTitle>
            <DialogDescription>Nhập nội dung để hiển thị trong mục Theo gương Bác.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề</label>
              <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại nội dung</label>
              <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <MarkdownEditor
                label="Nội dung"
                value={form.content}
                onChange={(nextValue) => setForm((prev) => ({ ...prev, content: nextValue }))}
                placeholder="Nhap noi dung theo guong Bac..."
              />
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

export default GuongBacManager;
