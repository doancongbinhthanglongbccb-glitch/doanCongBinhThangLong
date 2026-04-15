import heroBanner from "@/assets/logo-e.jpg";
import logoImg from "@/assets/logo-293.png";
import news1 from "@/assets/news-1.svg";
import news2 from "@/assets/news-2.svg";
import news3 from "@/assets/news-3.svg";
import news4 from "@/assets/news-4.svg";
import type { NewsItem, SiteContent } from "@/types/site";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

let siteContent: SiteContent = {
  topBar: {
    hotlineLabel: "Đường dây nóng",
    hotlineValue: "1900 293 293",
  },
  header: {
    logo: logoImg,
    logoAlt: "Logo Lữ đoàn 293",
    title: "Lữ đoàn 293",
    subtitle: "Mở đường thắng lợi – Xây dựng và bảo vệ Tổ quốc",
  },
  hero: {
    image: heroBanner,
    alt: "Lữ đoàn 293 huấn luyện",
    title: "Lữ đoàn 293",
    subtitle: "Chủ động -  Sáng tạo - Tự lực - Tự cường - Trưởng thành - Vững mạnh",
  },
  navItems: [
    { label: "Trang chủ", href: "/", active: true },
    { label: "Giới thiệu", href: "/gioi-thieu" },
    {
      label: "Hoạt động đơn vị",
      children: [
        { label: "Huấn luyện", href: "/hoat-dong-don-vi/huan-luyen" },
        { label: "Cứu hộ", href: "/hoat-dong-don-vi/cuu-ho" },
        { label: "Dân vận", href: "/hoat-dong-don-vi/dan-van" },
        { label: "Bình Dân học vụ số", href: "/binh-dan-hoc-vu-so" },
      ],
    },
    {
      label: "Theo gương Bác",
      children: [
        { label: "Mỗi ngày một lời Bác Hồ dạy", href: "/theo-guong-bac/moi-ngay-mot-loi-bac-ho-day" },
        { label: "Mỗi tuần một điều luật", href: "/theo-guong-bac/moi-tuan-mot-dieu-luat" },
      ],
    },
    {
      label: "Thư viện",
      children: [
        { label: "Tư liệu truyền thống - giáo dục", href: "/thu-vien/tu-lieu-truyen-thong-giao-duc" },
        { label: "Hiện vật truyền thống", href: "/thu-vien/hien-vat-truyen-thong" },
        { label: "Video", href: "/thu-vien/video" },
      ],
    },
    { label: "Liên hệ", href: "/lien-he" },
  ],
  sections: [
    {
      id: "gioi-thieu",
      title: "Giới thiệu",
      body: "Lữ đoàn 293 là đơn vị công binh của Quân đội nhân dân Việt Nam, thực hiện nhiệm vụ bảo đảm công binh, huấn luyện, sẵn sàng chiến đấu và tham gia xây dựng kinh tế - xã hội.",
      type: "text",
    },
    { id: "hoat-dong-don-vi", title: "Trang tin", body: "Tin nổi bật và tin mới nhất", type: "news" },
    {
      id: "huan-luyen",
      title: "Huấn luyện",
      body: "Cập nhật công tác huấn luyện, diễn tập và nâng cao năng lực sẵn sàng chiến đấu của đơn vị.",
      type: "text",
    },
    {
      id: "cuu-ho",
      title: "Cứu hộ",
      body: "Thông tin các hoạt động cứu hộ, cứu nạn và hỗ trợ khắc phục thiên tai của lực lượng công binh.",
      type: "text",
    },
    {
      id: "dan-van",
      title: "Dân vận",
      body: "Hoạt động dân vận, phối hợp địa phương và các chương trình vì cộng đồng của đơn vị.",
      type: "text",
    },
    {
      id: "binh-dan-hoc-vu-so",
      title: "Bình Dân học vụ số",
      body: "Chuyên mục cập nhật hoạt động chuyển đổi số, học tập kỹ năng số và phổ cập tri thức số trong đơn vị.",
      type: "text",
    },
    {
      id: "moi-ngay-mot-loi-bac-ho-day",
      title: "Mỗi ngày một lời Bác Hồ dạy",
      body: "Nội dung tuyên truyền, học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh sẽ được cập nhật tại đây.",
      type: "text",
    },
    {
      id: "moi-tuan-mot-dieu-luat",
      title: "Mỗi tuần một điều luật",
      body: "Chuyên mục phổ biến, giáo dục pháp luật dành cho cán bộ, chiến sĩ và bạn đọc quan tâm.",
      type: "text",
    },
    {
      id: "tu-lieu-truyen-thong-giao-duc",
      title: "Tư liệu truyền thống - giáo dục",
      body: "Kho tư liệu, tài liệu truyền thông và giáo dục chính trị sẽ được tổng hợp tại đây.",
      type: "text",
    },
    {
      id: "hien-vat-truyen-thong",
      title: "Hiện vật truyền thống",
      body: "Không gian trưng bày hiện vật, tư liệu lịch sử và các dấu ấn truyền thống của đơn vị.",
      type: "text",
    },
    {
      id: "video",
      title: "Video",
      body: "Chuyên mục video giới thiệu hoạt động, sự kiện và truyền thống của Lữ đoàn.",
      type: "text",
    },
    {
      id: "lien-he",
      title: "Liên hệ",
      body: "Lữ đoàn 293 - Quân khu / Bộ Quốc phòng - Email: info@luduancongbinh293.vn",
      type: "text",
    },
  ],
  newsItems: [
    {
      id: "news-1",
      image: news1,
      title: "Lữ đoàn 293 hoàn thành xuất sắc nhiệm vụ huấn luyện chiến đấu năm 2026",
      excerpt:
        "Trong đợt huấn luyện vừa qua, cán bộ chiến sĩ Lữ đoàn 293 đã nỗ lực vượt khó, hoàn thành xuất sắc các nội dung huấn luyện, diễn tập bảo đảm công binh trong tác chiến hiệp đồng quân binh chủng.",
      date: "14/04/2026",
    },
    {
      id: "news-2",
      image: news2,
      title: "Đoàn thanh niên Lữ đoàn 293 tổ chức hoạt động tình nguyện tại địa phương",
      excerpt: "",
      date: "12/04/2026",
    },
    {
      id: "news-3",
      image: news3,
      title: "Lữ đoàn 293 tổ chức hội thi thợ giỏi chuyên ngành công binh năm 2026",
      excerpt: "",
      date: "10/04/2026",
    },
    {
      id: "news-4",
      image: news4,
      title: "Cán bộ chiến sĩ Lữ đoàn tham gia xây dựng cầu đường phục vụ dân sinh vùng sâu vùng xa",
      excerpt: "",
      date: "08/04/2026",
    },
  ],
  footer: {
    title: "Lữ đoàn 293",
    descriptionLines: ["Quân đội nhân dân Việt Nam", "Mở đường thắng lợi", "Xây dựng và bảo vệ Tổ quốc"],
    quickLinks: [
      { label: "Trang chủ", href: "/" },
      { label: "Giới thiệu", href: "/gioi-thieu" },
      { label: "Hoạt động đơn vị", href: "/hoat-dong-don-vi/huan-luyen" },
      { label: "Thư viện", href: "/thu-vien/tu-lieu-truyen-thong-giao-duc" },
      { label: "Liên hệ", href: "/lien-he" },
    ],
    contactLines: ["Lữ đoàn 293", "Quân khu / Bộ Quốc phòng", "Email: info@luduancongbinh293.vn"],
    copyright: "© 2026 Lữ đoàn 293 – Quân đội nhân dân Việt Nam. Bản quyền thuộc về Lữ đoàn 293.",
  },
  chatbot: {
    title: "Trợ lý thông tin nội bộ",
    subtitle: "Lữ đoàn 293",
    welcomeMessage: "Xin chào! Tôi là trợ lý thông tin nội bộ của Lữ đoàn 293. Bạn cần hỏi gì?",
    greetingResponse:
      "Xin chào! Tôi là trợ lý thông tin nội bộ của Lữ đoàn 293. Bạn có thể hỏi tôi về lịch sử, nhiệm vụ, tổ chức, huấn luyện, truyền thống, rà phá bom mìn, cầu đường hoặc liên hệ của Lữ đoàn.",
    fallbackResponse:
      "Cảm ơn câu hỏi của bạn. Hiện tại tôi có thể trả lời các câu hỏi về: lịch sử, thành lập, nhiệm vụ, tổ chức, huấn luyện, truyền thống, công binh, bom mìn, cầu đường và liên hệ của Lữ đoàn 293. Vui lòng thử hỏi lại với từ khóa cụ thể hơn.",
    knowledgeBase: {
      "lịch sử": "Lữ đoàn 293 là đơn vị công binh chủ lực của Quân đội nhân dân Việt Nam, có bề dày truyền thống trong xây dựng, chiến đấu và phục vụ chiến đấu.",
      "thành lập": "Lữ đoàn 293 được thành lập với nhiệm vụ bảo đảm công binh cho các lực lượng tác chiến.",
      "nhiệm vụ": "Nhiệm vụ chính: bảo đảm công binh trong tác chiến, xây dựng công trình quốc phòng, rà phá bom mìn, mở đường, bắc cầu, phòng chống thiên tai.",
      "tổ chức": "Lữ đoàn gồm Ban Chỉ huy, các cơ quan và các tiểu đoàn chuyên ngành công binh.",
      "huấn luyện": "Huấn luyện kỹ thuật công binh, rà phá bom mìn, vượt sông, sử dụng khí tài hiện đại và diễn tập hiệp đồng.",
      "truyền thống": "Đơn vị mang truyền thống 'Mở đường thắng lợi' của bộ đội công binh Việt Nam.",
      "liên hệ": "Liên hệ: Lữ đoàn 293 - Email: info@luduancongbinh293.vn",
    },
  },
};

const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const getSiteContent = async (): Promise<SiteContent> => {
  await wait();
  return clone(siteContent);
};

export const replaceSiteContent = async (nextContent: SiteContent): Promise<SiteContent> => {
  await wait();
  siteContent = clone(nextContent);
  return clone(siteContent);
};

export const createNewsItem = async (payload: Omit<NewsItem, "id">): Promise<SiteContent> => {
  await wait();
  const next: NewsItem = { ...payload, id: `news-${Date.now()}` };
  siteContent.newsItems = [next, ...siteContent.newsItems];
  return clone(siteContent);
};

export const updateNewsItem = async (id: string, payload: Omit<NewsItem, "id">): Promise<SiteContent> => {
  await wait();
  siteContent.newsItems = siteContent.newsItems.map((item) =>
    item.id === id ? { ...payload, id } : item,
  );
  return clone(siteContent);
};

export const deleteNewsItem = async (id: string): Promise<SiteContent> => {
  await wait();
  siteContent.newsItems = siteContent.newsItems.filter((item) => item.id !== id);
  return clone(siteContent);
};
