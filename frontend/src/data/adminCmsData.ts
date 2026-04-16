export type AdminSectionKey = "dashboard" | "news" | "activities" | "bac" | "library" | "digital";
export type AdminCategory = "Huấn luyện" | "Cứu hộ" | "Dân vận";

export type AdminRecord = {
  id: string;
  title: string;
  date: string;
  category: AdminCategory;
  content: string;
  image: string;
};

export type AdminSectionConfig = {
  key: AdminSectionKey;
  label: string;
  description: string;
  addLabel: string;
};

export const adminSidebarItems: AdminSectionConfig[] = [
  {
    key: "dashboard",
    label: "Bảng điều khiển",
    description: "Tổng quan nhanh các nội dung đang quản lý.",
    addLabel: "Thêm bản ghi",
  },
  {
    key: "news",
    label: "Quản lý Trang tin",
    description: "Danh sách bài đăng, tin tức và thông báo nội bộ.",
    addLabel: "Thêm tin mới",
  },
  {
    key: "activities",
    label: "Hoạt động đơn vị",
    description: "Các nội dung về huấn luyện, cứu hộ và dân vận.",
    addLabel: "Thêm hoạt động",
  },
  {
    key: "bac",
    label: "Theo gương Bác",
    description: "Nội dung học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh.",
    addLabel: "Thêm nội dung",
  },
  {
    key: "library",
    label: "Thư viện",
    description: "Tư liệu truyền thống, hiện vật và video.",
    addLabel: "Thêm tài liệu",
  },
  {
    key: "digital",
    label: "Bình dân học vụ số",
    description: "Nội dung chuyển đổi số và học vụ số cho đơn vị.",
    addLabel: "Thêm chuyên đề",
  },
];

export const categoryOptions: AdminCategory[] = ["Huấn luyện", "Cứu hộ", "Dân vận"];

export const createAdminSeed = (): Record<Exclude<AdminSectionKey, "dashboard">, AdminRecord[]> => ({
  news: [
    {
      id: "news-1",
      title: "Lữ đoàn hoàn thành xuất sắc nhiệm vụ huấn luyện chiến đấu năm 2026",
      date: "14/04/2026",
      category: "Huấn luyện",
      content: "Trong đợt huấn luyện vừa qua, cán bộ chiến sĩ Lữ đoàn đã hoàn thành xuất sắc các nội dung diễn tập, bảo đảm an toàn tuyệt đối.",
      image: "news-1.svg",
    },
    {
      id: "news-2",
      title: "Đoàn thanh niên tổ chức hoạt động tình nguyện tại địa phương",
      date: "12/04/2026",
      category: "Dân vận",
      content: "Các đoàn viên tích cực tham gia dọn vệ sinh, hỗ trợ bà con và tuyên truyền xây dựng nếp sống văn minh.",
      image: "news-2.svg",
    },
    {
      id: "news-3",
      title: "Lữ đoàn tổ chức hội thi thợ giỏi chuyên ngành công binh",
      date: "10/04/2026",
      category: "Huấn luyện",
      content: "Hội thi giúp nâng cao trình độ kỹ năng thực hành, tạo động lực thi đua trong toàn đơn vị.",
      image: "news-3.svg",
    },
  ],
  activities: [
    {
      id: "act-1",
      title: "Huấn luyện vượt sông, bảo đảm cầu phà cơ động",
      date: "13/04/2026",
      category: "Huấn luyện",
      content: "Nội dung luyện tập tập trung vào triển khai khí tài, tổ chức vượt sông và hiệp đồng giữa các bộ phận.",
      image: "news-1.svg",
    },
    {
      id: "act-2",
      title: "Lực lượng tham gia cứu hộ khi thiên tai xảy ra",
      date: "11/04/2026",
      category: "Cứu hộ",
      content: "Đơn vị sẵn sàng cơ động nhanh, hỗ trợ sơ tán dân và khắc phục hậu quả mưa lũ.",
      image: "news-2.svg",
    },
    {
      id: "act-3",
      title: "Dân vận tại địa bàn kết nghĩa cùng địa phương",
      date: "09/04/2026",
      category: "Dân vận",
      content: "Phối hợp cấp ủy, chính quyền và nhân dân để thực hiện các phần việc thiết thực.",
      image: "news-3.svg",
    },
  ],
  bac: [
    {
      id: "bac-1",
      title: "Mỗi ngày một lời Bác Hồ dạy - Sống và làm việc có kỷ luật",
      date: "14/04/2026",
      category: "Huấn luyện",
      content: "Mẫu nội dung tuyên truyền, học tập làm theo lời Bác theo từng ngày trong tuần.",
      image: "news-1.svg",
    },
    {
      id: "bac-2",
      title: "Mỗi tuần một điều luật - Nâng cao ý thức chấp hành pháp luật",
      date: "12/04/2026",
      category: "Dân vận",
      content: "Khung nội dung phổ biến pháp luật định kỳ cho cán bộ, chiến sĩ và bạn đọc.",
      image: "news-2.svg",
    },
  ],
  library: [
    {
      id: "lib-1",
      title: "Tư liệu truyền thống - giáo dục",
      date: "13/04/2026",
      category: "Huấn luyện",
      content: "Kho tài liệu, ảnh, poster và tư liệu giáo dục chính trị được cập nhật thường xuyên.",
      image: "news-1.svg",
    },
    {
      id: "lib-2",
      title: "Hiện vật truyền thống của đơn vị",
      date: "11/04/2026",
      category: "Cứu hộ",
      content: "Danh mục hiện vật, tài liệu lịch sử và các dấu ấn truyền thống.",
      image: "news-3.svg",
    },
    {
      id: "lib-3",
      title: "Video giới thiệu hoạt động đơn vị",
      date: "10/04/2026",
      category: "Dân vận",
      content: "Video clip sự kiện, huấn luyện, cứu hộ và hoạt động truyền thông.",
      image: "news-4.svg",
    },
  ],
  digital: [
    {
      id: "dig-1",
      title: "Nền tảng Bình dân học vụ số",
      date: "14/04/2026",
      category: "Huấn luyện",
      content: "Chuyên đề số hóa nội dung học tập, cung cấp tài liệu và bài kiểm tra nhanh cho cán bộ, chiến sĩ.",
      image: "binh-dan-hoc-vu-so-banner.svg",
    },
    {
      id: "dig-2",
      title: "Trách nhiệm trong công tác xây dựng, kiện toàn nhân lực",
      date: "12/04/2026",
      category: "Cứu hộ",
      content: "Bài học số minh hoạ dạng infographic, phù hợp các chuyên đề tự học theo tháng.",
      image: "news-2.svg",
    },
    {
      id: "dig-3",
      title: "An toàn thông tin trong môi trường số",
      date: "10/04/2026",
      category: "Dân vận",
      content: "Nội dung cơ bản về bảo mật, an toàn dữ liệu và tác phong làm việc số.",
      image: "news-4.svg",
    },
  ],
});
