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
    <Card className="border-admin-border shadow-sm">
      <CardHeader className="space-y-admin-stack border-b border-admin-border pb-admin-card-sm sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold leading-snug text-card-foreground">{title}</CardTitle>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-admin-tight">{actions}</div> : null}
      </CardHeader>
      <CardContent className="p-admin-card pt-0">{children}</CardContent>
    </Card>
  );
};

export default AdminSectionCard;
