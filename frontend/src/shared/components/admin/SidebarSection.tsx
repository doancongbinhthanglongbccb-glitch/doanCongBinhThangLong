import type { ElementType } from "react";
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
};

const SidebarSection = ({ label, items, active, onChange, className = "" }: SidebarSectionProps) => {
  return (
    <section className={`mt-4 first:mt-0 ${className}`.trim()}>
      <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <SidebarItem key={item.key} label={item.label} icon={item.icon} isActive={active === item.key} onClick={() => onChange(item.key)} />
        ))}
      </div>
    </section>
  );
};

export default SidebarSection;
