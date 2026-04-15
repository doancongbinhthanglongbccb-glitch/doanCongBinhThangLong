import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = ({ data }) => {
  const stats = [
    { label: "Hoạt động đơn vị", value: data.activities.length },
    { label: "Theo gương Bác", value: data.guongBac.length },
    { label: "Thư viện", value: data.thuVien.length },
    { label: "Bình dân học vụ số", value: data.binhDanHocVu.length },
  ];

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>Tổng quan số lượng nội dung đang quản lý.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
