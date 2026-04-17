import { useState } from "react";
import type { ElementType } from "react";
import { ChevronDown } from "lucide-react";
import SidebarItem from "@/shared/components/admin/SidebarItem";

type SidebarSectionItem = {
  key: string;
  label: string;
  icon: ElementType;
};

type SidebarSectionProps = {
  label: string;
  items: SidebarSectionItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
};

const SidebarSection = ({ label, items, active, onChange, className = "", collapsible = false, defaultOpen = true }: SidebarSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`mt-3 first:mt-0 ${className}`.trim()}>
      <button
        type="button"
        onClick={() => collapsible && setOpen((current) => !current)}
        className="flex w-full items-center justify-between px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
      >
        <span>{label}</span>
        {collapsible ? <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`} /> : null}
      </button>
      {open ? (
        <div className="space-y-1">
          {items.map((item) => (
            <SidebarItem key={item.key} label={item.label} icon={item.icon} isActive={active === item.key} onClick={() => onChange(item.key)} />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default SidebarSection;
