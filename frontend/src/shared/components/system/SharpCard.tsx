import type { ReactNode } from "react";

type SharpCardProps = {
  children: ReactNode;
  className?: string;
};

const SharpCard = ({ children, className = "" }: SharpCardProps) => {
  return <div className={`border border-slate-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] ${className}`.trim()}>{children}</div>;
};

export default SharpCard;
