import { Activity, BookOpen, CheckCircle2, Database, Library, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const parseVnDate = (value = "") => {
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) {
    return 0;
  }
  return new Date(year, month - 1, day).getTime();
};

const Dashboard = ({ data }) => {
  const sectionStats = [
    {
      label: "Hoạt động đơn vị",
      value: data.activities.length,
      icon: ShieldCheck,
      note: "Tin bài, huấn luyện, cứu hộ, dân vận",
    },
    {
      label: "Theo gương Bác",
      value: data.guongBac.length,
      icon: Sparkles,
      note: "Lời Bác và điều luật",
    },
    {
      label: "Thư viện",
      value: data.thuVien.length,
      icon: Library,
      note: "Tư liệu, hiện vật, video",
    },
    {
      label: "Bình dân học vụ số",
      value: data.binhDanHocVu.length,
      icon: BookOpen,
      note: "Chuyên đề số cho đơn vị",
    },
  ];
  const totalItems = sectionStats.reduce((sum, item) => sum + item.value, 0);

  const distribution = sectionStats.map((item) => ({
    ...item,
    percent: totalItems > 0 ? Math.round((item.value / totalItems) * 100) : 0,
  }));

  const latestItems = [
    ...data.activities.map((item) => ({ ...item, section: "Hoạt động đơn vị" })),
    ...data.guongBac.map((item) => ({ ...item, section: "Theo gương Bác" })),
    ...data.thuVien.map((item) => ({ ...item, section: "Thư viện" })),
    ...data.binhDanHocVu.map((item) => ({ ...item, section: "Bình dân học vụ số" })),
  ]
    .sort((a, b) => parseVnDate(b.date) - parseVnDate(a.date))
    .slice(0, 6);

  const checklist = [
    "Cập nhật nội dung cho 4 nhóm chính",
    "Kiểm tra menu và cấu hình header/footer",
    "Theo dõi các mục mới trong bảng điều khiển",
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Bảng điều khiển quản trị viên</CardTitle>
          <CardDescription>
            Trang này giúp quản trị viên nhìn nhanh hệ thống đang có gì, thiếu gì và cần cập nhật ở đâu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Tóm tắt nhanh</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Hiện tại bạn đang quản lý <span className="font-semibold text-slate-900">{totalItems} mục nội dung</span> trong 4 nhóm chính.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {sectionStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{item.note}</p>
                    </div>
                    <Icon className="h-4 w-4 text-slate-500" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-700">Tổng số mục nội dung đang quản lý</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Database className="h-4 w-4" />
                {totalItems} mục
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-lg">Phân bổ nội dung</CardTitle>
            <CardDescription>Cho biết nhóm nào đang chiếm tỷ trọng lớn trong hệ thống.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {distribution.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-700">{item.label}</span>
                  <span className="font-semibold text-slate-700">{item.percent}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200">
                  <div className="h-2.5 bg-slate-800" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-lg">Cập nhật gần đây</CardTitle>
            <CardDescription>Danh sách này giúp quản trị viên nhìn ngay mục nào vừa được cập nhật gần nhất.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latestItems.map((item) => (
                <div key={`${item.section}-${item.id}`} className="border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-900">{item.title}</p>
                    <span className="shrink-0 text-xs text-slate-500">{item.date}</span>
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-slate-600">
                    <Activity className="h-3.5 w-3.5" />
                    {item.section}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-lg">Việc cần làm</CardTitle>
          <CardDescription>Những đầu việc quản trị thường phải kiểm tra mỗi khi vào hệ thống.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {checklist.map((item) => (
              <div key={item} className="flex items-start gap-2 border border-slate-200 bg-white p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-700" />
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
