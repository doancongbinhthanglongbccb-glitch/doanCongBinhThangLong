import type { ElementType } from "react";

type SidebarItemProps = {
  label: string;
  icon: ElementType;
  isActive: boolean;
  onClick: () => void;
};

const SidebarItem = ({ label, icon: Icon, isActive, onClick }: SidebarItemProps) => {
  const activeClass = isActive
    ? "border-red-700 bg-red-50 text-red-800 shadow-sm"
    : "border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-11 w-full items-center gap-3 border-l-4 px-4 py-3 text-left text-sm font-medium uppercase tracking-[0.08em] transition-colors duration-200 ease-out ${activeClass}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
};

export default SidebarItem;
