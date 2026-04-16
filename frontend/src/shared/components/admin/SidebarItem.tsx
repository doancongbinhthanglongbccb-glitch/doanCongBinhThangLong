import type { ElementType } from "react";

type SidebarItemProps = {
  label: string;
  icon: ElementType;
  isActive: boolean;
  onClick: () => void;
};

const SidebarItem = ({ label, icon: Icon, isActive, onClick }: SidebarItemProps) => {
  const activeClass = isActive
    ? "border-l-4 border-gold bg-slate-900 text-white"
    : "border-l-4 border-transparent text-slate-700 hover:bg-slate-100";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold transition-colors duration-200 ease-out ${activeClass}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
};

export default SidebarItem;
