import { useRef, useState } from "react";
import { PenLine, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ActionBar from "@/apps/admin/components/ActionBar";
import PostForm from "@/apps/admin/components/PostForm";
import PostPreview from "@/apps/admin/components/PostPreview";

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
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

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
    setIsSaving(true);

    const payload = {
      title: form.title,
      category: form.category,
      date: form.date,
      content: form.content,
      image: form.image,
    };

    try {
      if (editingId) {
        await updateItem("activities", editingId, payload);
      } else {
        await createItem("activities", payload);
      }

      setOpen(false);
    } finally {
      setIsSaving(false);
    }
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
        <DialogContent className="rounded-none max-w-6xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Sửa hoạt động" : "Thêm hoạt động"}</DialogTitle>
            <DialogDescription>Giao diện biên tập theo kiểu CMS với khu vực soạn thảo và xem trước song song.</DialogDescription>
          </DialogHeader>
          <ActionBar
            onBack={() => setOpen(false)}
            onSaveDraft={() => formRef.current?.requestSubmit()}
            onPublish={() => formRef.current?.requestSubmit()}
            isSaving={isSaving}
          />

          <form ref={formRef} className="grid gap-4 lg:grid-cols-5" onSubmit={handleSubmit}>
            <div className="space-y-4 lg:col-span-3">
              <PostForm
                form={form}
                setForm={setForm}
                categoryOptions={categoryOptions}
                handleImageUpload={handleImageUpload}
              />
            </div>

            <aside className="lg:col-span-2">
              <div className="lg:sticky lg:top-4">
                <PostPreview
                  title={form.title}
                  category={form.category}
                  date={form.date}
                  content={form.content}
                  image={form.image}
                />
              </div>
            </aside>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HoatDongManager;
