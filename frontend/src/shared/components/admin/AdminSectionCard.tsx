import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
};

const AdminSectionCard = ({ title, description, children, actions }: AdminSectionCardProps) => {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
          {description ? <p className="text-sm text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
};

export default AdminSectionCard;
