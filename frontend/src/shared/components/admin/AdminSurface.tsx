import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type AdminSurfaceProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

const AdminSurface = ({ title, description, actions, children }: AdminSurfaceProps) => {
  return (
    <section className="space-y-4">
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            {title ? <h3 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h3> : null}
            {description ? <p className="text-sm text-slate-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      )}

      <Card className="border-slate-200 bg-white shadow-sm">{children}</Card>
    </section>
  );
};

export default AdminSurface;
