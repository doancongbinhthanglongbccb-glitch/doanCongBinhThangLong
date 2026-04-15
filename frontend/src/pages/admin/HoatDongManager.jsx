import { useState } from "react";
import { PenLine, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const categoryOptions = ["Huấn luyện", "Cứu hộ", "Dân vận"];

const blankForm = {
  title: "",
  category: categoryOptions[0],
  date: "",
  content: "",
  image: "",
};

const HoatDongManager = ({ data, createItem, updateItem, deleteItem }) => {
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
      title: item.title,
      category: item.category,
      date: item.date,
      content: item.content,
      image: item.image ?? "",
    });
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: form.title,
      category: form.category,
      date: form.date,
      content: form.content,
      image: form.image,
    };

    if (editingId) {
      await updateItem("activities", editingId, payload);
    } else {
      await createItem("activities", payload);
    }

    setOpen(false);
  };

  return (
    <Card className="rounded-none">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Hoạt động đơn vị</CardTitle>
          <CardDescription>Quản lý nội dung Huấn luyện / Cứu hộ / Dân vận.</CardDescription>
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
              {data.activities.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{item.category}</div>
                  </TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                        <PenLine className="mr-2 h-4 w-4" />
                        Sửa
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteItem("activities", item.id)}>
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
            <DialogTitle>{editingId ? "Sửa hoạt động" : "Thêm hoạt động"}</DialogTitle>
            <DialogDescription>Form quản lý Hoạt động đơn vị.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title input</label>
              <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category select</label>
              <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} placeholder="15/04/2026" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content textarea</label>
              <Textarea className="min-h-28 rounded-none" value={form.content} onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image upload</label>
              <Input value={form.image} onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))} placeholder="URL ảnh hoặc tên file" />
            </div>
            <DialogFooter>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HoatDongManager;
