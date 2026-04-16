import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const createMenuId = () => `nav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const MenuManager = ({ data, updateSiteData }) => {
  const [items, setItems] = useState(data.navItems || []);

  useEffect(() => {
    setItems(data.navItems || []);
  }, [data.navItems]);

  const updateItem = (index, key, value) => {
    setItems((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  };

  const addMenuItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: createMenuId(),
        label: "Mục mới",
        href: "/",
        visible: true,
        children: [],
      },
    ]);
  };

  const removeMenuItem = (index) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const moveMenuItem = (index, direction) => {
    setItems((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const addChildItem = (index) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return {
          ...item,
          children: [
            ...(item.children || []),
            {
              id: createMenuId(),
              label: "Mục con mới",
              href: "/",
              visible: true,
            },
          ],
        };
      }),
    );
  };

  const updateChild = (index, childIndex, key, value) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return {
          ...item,
          children: (item.children || []).map((child, currentChildIndex) =>
            currentChildIndex === childIndex ? { ...child, [key]: value } : child,
          ),
        };
      }),
    );
  };

  const removeChild = (index, childIndex) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return {
          ...item,
          children: (item.children || []).filter((_, currentChildIndex) => currentChildIndex !== childIndex),
        };
      }),
    );
  };

  const saveMenus = async () => {
    await updateSiteData((prev) => ({ ...prev, navItems: items }));
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Menu Management</CardTitle>
        <CardDescription>Thêm/sửa/xóa/sắp xếp menu và bật tắt hiển thị.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button type="button" onClick={addMenuItem}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm menu
          </Button>
          <Button type="button" variant="secondary" onClick={saveMenus}>Lưu menu</Button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id || `${item.label}-${index}`} className="border border-slate-200 bg-white p-3 hover:bg-slate-50">
              <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto_auto_auto] md:items-center">
                <Input value={item.label || ""} onChange={(event) => updateItem(index, "label", event.target.value)} placeholder="Tên menu" />
                <Input value={item.href || ""} onChange={(event) => updateItem(index, "href", event.target.value)} placeholder="Đường dẫn" />
                <Button type="button" variant="outline" size="icon" onClick={() => updateItem(index, "visible", item.visible === false)}>
                  {item.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={() => moveMenuItem(index, "up")}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={() => moveMenuItem(index, "down")}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeMenuItem(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-3 border-t border-slate-200 pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Mục con</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => addChildItem(index)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Thêm mục con
                  </Button>
                </div>
                <div className="space-y-2">
                  {(item.children || []).map((child, childIndex) => (
                    <div key={child.id || `${child.label}-${childIndex}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto] md:items-center">
                      <Input value={child.label || ""} onChange={(event) => updateChild(index, childIndex, "label", event.target.value)} placeholder="Tên mục con" />
                      <Input value={child.href || ""} onChange={(event) => updateChild(index, childIndex, "href", event.target.value)} placeholder="Đường dẫn" />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => updateChild(index, childIndex, "visible", child.visible === false)}
                      >
                        {child.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeChild(index, childIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuManager;
