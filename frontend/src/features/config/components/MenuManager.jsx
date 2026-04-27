import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminSectionCard from "@/shared/components/admin/AdminSectionCard";

const createMenuId = () => `nav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const normalizePath = (value) => {
  const raw = String(value || "").trim();
  if (!raw) {
    return "/";
  }

  const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const compact = withLeadingSlash.replace(/\/{2,}/g, "/");
  const withoutTrailingSlash = compact !== "/" ? compact.replace(/\/+$/, "") : compact;
  return withoutTrailingSlash || "/";
};

const composeChildPath = (parentHref, childHref) => {
  const parent = normalizePath(parentHref);
  const child = normalizePath(childHref);

  if (child === "/") {
    return parent;
  }

  if (parent === "/" || child.startsWith(`${parent}/`)) {
    return child;
  }

  const childSegments = child.split("/").filter(Boolean);
  if (childSegments.length === 1) {
    return `${parent}/${childSegments[0]}`.replace(/\/{2,}/g, "/");
  }

  return child;
};

const collectQuickLinks = (items = []) => {
  const links = [];

  items.forEach((item) => {
    if (item.visible === false) {
      return;
    }

    if (item.href) {
      links.push({ label: item.label, href: normalizePath(item.href) });
    }

    (item.children || []).forEach((child) => {
      if (child.visible === false) {
        return;
      }

      links.push({
        label: child.label,
        href: composeChildPath(item.href, child.href),
      });
    });
  });

  return Array.from(new Map(links.map((link) => [`${link.label}-${link.href}`, link])).values());
};

const TreeRow = ({ item, index, onUpdate, onMove, onRemove, onToggle, onAddChild, onUpdateChild, onRemoveChild }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3 lg:w-[220px]">
          <Button type="button" variant="outline" size="icon" onClick={() => setOpen((current) => !current)} className="rounded-lg">
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-0" : "-rotate-90"}`} />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{item.label || t("admin.menuManager.menuItemFallback")}</p>
            <p className="truncate text-xs text-slate-500">{item.href || "/"}</p>
          </div>
        </div>

        <div className="grid flex-1 gap-3 md:grid-cols-[1.2fr_1fr_auto_auto_auto_auto] md:items-center">
          <Input value={item.label || ""} onChange={(event) => onUpdate(index, "label", event.target.value)} placeholder={t("admin.menuManager.fieldMenuName")} className="h-11 rounded-lg border-slate-300" />
          <Input value={item.href || ""} onChange={(event) => onUpdate(index, "href", event.target.value)} placeholder={t("admin.menuManager.fieldPath")} className="h-11 rounded-lg border-slate-300" />
          <Button type="button" variant="outline" size="icon" onClick={() => onToggle(index)} className="rounded-lg">
            {item.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={() => onMove(index, "up")} className="rounded-lg">
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={() => onMove(index, "down")} className="rounded-lg">
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button type="button" variant="destructive" size="icon" onClick={() => onRemove(index)} className="rounded-lg">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">{t("admin.menuManager.childrenTitle")}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => onAddChild(index)} className="rounded-lg">
              <Plus className="mr-1 h-4 w-4" />
              {t("admin.menuManager.addChild")}
            </Button>
          </div>
          <div className="space-y-3 pl-4" style={{ borderLeft: "2px solid #e2e8f0" }}>
            {(item.children || []).map((child, childIndex) => (
              <div key={child.id || `${child.label}-${childIndex}`} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
                <Input value={child.label || ""} onChange={(event) => onUpdateChild(index, childIndex, "label", event.target.value)} placeholder={t("admin.menuManager.fieldChildName")} className="h-11 rounded-lg border-slate-300" />
                <Input value={child.href || ""} onChange={(event) => onUpdateChild(index, childIndex, "href", event.target.value)} placeholder={t("admin.menuManager.fieldPath")} className="h-11 rounded-lg border-slate-300" />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdateChild(index, childIndex, "visible", child.visible === false)}
                    className="rounded-lg"
                  >
                    {child.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button type="button" variant="destructive" size="icon" onClick={() => onRemoveChild(index, childIndex)} className="rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const MenuManager = ({ data, updateSiteData }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState(data.navItems || []);
  const [saving, setSaving] = useState(false);

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
        label: t("admin.menuManager.newMenuLabel"),
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
              label: t("admin.menuManager.newChildLabel"),
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
    const normalizedItems = items.map((item) => {
      const normalizedParentHref = normalizePath(item.href);
      const normalizedChildren = (item.children || []).map((child) => ({
        ...child,
        href: composeChildPath(normalizedParentHref, child.href),
      }));

      return {
        ...item,
        href: normalizedParentHref,
        children: normalizedChildren,
      };
    });

    try {
      setSaving(true);
      const footerQuickLinks = collectQuickLinks(normalizedItems);
      await updateSiteData((prev) => ({
        ...prev,
        navItems: normalizedItems,
        footer: {
          ...prev.footer,
          quickLinks: footerQuickLinks,
        },
      }));
      setItems(normalizedItems);
      toast.success(t("admin.menuManager.menuSaved"));
    } catch {
      toast.error(t("admin.menuManager.menuSaveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSectionCard
      title={t("admin.menuManager.title")}
      description={t("admin.menuManager.description")}
      actions={
        <>
          <Button type="button" onClick={addMenuItem} className="rounded-lg bg-red-700 hover:bg-red-800">
            <Plus className="mr-2 h-4 w-4" />
            {t("admin.menuManager.addMenu")}
          </Button>
          <Button type="button" variant="outline" onClick={saveMenus} disabled={saving} className="rounded-lg">
            {saving ? t("admin.common.saving") : t("admin.menuManager.saveMenu")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {items.map((item, index) => (
          <TreeRow
            key={item.id || `${item.label}-${index}`}
            item={item}
            index={index}
            onUpdate={updateItem}
            onMove={moveMenuItem}
            onRemove={removeMenuItem}
            onToggle={(menuIndex) => updateItem(menuIndex, "visible", item.visible === false)}
            onAddChild={addChildItem}
            onUpdateChild={updateChild}
            onRemoveChild={removeChild}
          />
        ))}
      </div>
    </AdminSectionCard>
  );
};

export default MenuManager;
