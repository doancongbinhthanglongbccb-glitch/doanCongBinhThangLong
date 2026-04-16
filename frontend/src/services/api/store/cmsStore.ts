import heroBanner from "@/assets/banner-293.jpg";
import logoImg from "@/assets/logo-293.png";
import sidebarTopImage from "@/assets/banner-4888.png";
import sidebarBottomImage from "@/assets/bannercdvcbqp2-9875.jpg";
import news1 from "@/assets/light-blue-illustration-marketing-infographic-5791.jpg";
import news2 from "@/assets/news-2.svg";
import news3 from "@/assets/news-3.svg";
import type { CmsData } from "@/shared/types/cms";

const STORAGE_KEY = "tl293.cms.data.v1";

export const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const clone = <T,>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const createInitialData = (): CmsData => ({
  home: {
    mainFeedTitle: "Hoạt động tin",
    mainFeedDescription: "Cập nhật nhanh các hoạt động huấn luyện, cứu hộ, dân vận và tin nổi bật của đơn vị.",
    guongBacTitle: "Theo gương Bác",
    thuVienTitle: "Thư viện",
  },
  header: {
    logo: logoImg,
    title: "Lữ đoàn 293 - Binh chủng công binh",
    subtitle: "Chủ động -  Sáng tạo - Tự lực - Tự cường - Trưởng thành - Vững mạnh",
  },
  navItems: [
    { id: "nav-home", label: "Trang chủ", href: "/", active: true, visible: true },
    { id: "nav-about", label: "Giới thiệu", href: "/gioi-thieu", visible: true },
    {
      id: "nav-activities",
      label: "Hoạt động đơn vị",
      visible: true,
      children: [
        { id: "nav-activities-training", label: "Huấn luyện", href: "/hoat-dong-don-vi/huan-luyen", visible: true },
        { id: "nav-activities-rescue", label: "Cứu hộ", href: "/hoat-dong-don-vi/cuu-ho", visible: true },
        { id: "nav-activities-civil", label: "Dân vận", href: "/hoat-dong-don-vi/dan-van", visible: true },
        { id: "nav-activities-digital", label: "Bình dân học vụ số", href: "/binh-dan-hoc-vu-so", visible: true },
      ],
    },
    {
      id: "nav-follow-uncle-ho",
      label: "Theo gương Bác",
      visible: true,
      children: [
        {
          id: "nav-follow-uncle-ho-daily",
          label: "Mỗi ngày một lời Bác Hồ dạy",
          href: "/theo-guong-bac/moi-ngay-mot-loi-bac-ho-day",
          visible: true,
        },
        {
          id: "nav-follow-uncle-ho-weekly-law",
          label: "Mỗi tuần một điều luật",
          href: "/theo-guong-bac/moi-tuan-mot-dieu-luat",
          visible: true,
        },
      ],
    },
    {
      id: "nav-library",
      label: "Thư viện",
      visible: true,
      children: [
        {
          id: "nav-library-docs",
          label: "Tư liệu truyền thống - giáo dục",
          href: "/thu-vien/tu-lieu-truyen-thong-giao-duc",
          visible: true,
        },
        { id: "nav-library-artifacts", label: "Hiện vật truyền thống", href: "/thu-vien/hien-vat-truyen-thong", visible: true },
        { id: "nav-library-video", label: "Video", href: "/thu-vien/video", visible: true },
      ],
    },
  ],
  hero: {
    image: heroBanner,
    title: "Lữ đoàn 293 - Đoàn công binh Thăng Long",
    subtitle: "Chủ động -  Sáng tạo - Tự lực - Tự cường - Trưởng thành - Vững mạnh",
  },
  intro: {
    title: "Giới thiệu",
    content:
      "Lữ đoàn 293 là đơn vị công binh của Quân đội nhân dân Việt Nam, thực hiện nhiệm vụ bảo đảm công binh, huấn luyện, sẵn sàng chiến đấu và tham gia xây dựng kinh tế - xã hội.",
  },
  activities: [
    {
      id: "activity-1",
      title: "Huấn luyện vượt sông bảo đảm cơ động",
      category: "Huấn luyện",
      date: "14/04/2026",
      content:
        "Đơn vị tổ chức huấn luyện vượt sông kết hợp triển khai khí tài công binh, bảo đảm cơ động lực lượng nhanh và an toàn.",
    },
    {
      id: "activity-2",
      title: "Lực lượng tham gia cứu hộ khi thiên tai",
      category: "Cứu hộ",
      date: "12/04/2026",
      content:
        "Lữ đoàn duy trì lực lượng ứng trực, phối hợp địa phương cứu hộ cứu nạn khi mưa lớn và ngập úng xảy ra.",
    },
    {
      id: "activity-3",
      title: "Hoạt động dân vận tại địa bàn kết nghĩa",
      category: "Dân vận",
      date: "10/04/2026",
      content:
        "Cán bộ chiến sĩ tham gia hỗ trợ địa phương xây dựng nông thôn mới, chăm lo đời sống người dân.",
    },
  ],
  guongBac: [
    {
      id: "bac-1",
      title: "Mỗi ngày một lời Bác Hồ dạy",
      content: "Cần, kiệm, liêm, chính, chí công vô tư trong công tác và đời sống.",
      type: "Lời Bác",
    },
    {
      id: "bac-2",
      title: "Mỗi tuần một điều luật",
      content: "Tăng cường ý thức chấp hành pháp luật, kỷ luật quân đội và quy định đơn vị.",
      type: "Điều luật",
    },
  ],
  thuVien: [
    {
      id: "tv-1",
      title: "Tư liệu truyền thống - giáo dục đơn vị",
      type: "Tư liệu truyền thống - giáo dục",
      url: "/images/huan-luyen.jpg",
    },
    {
      id: "tv-2",
      title: "Hiện vật truyền thống tiêu biểu",
      type: "Hiện vật truyền thống",
      url: "https://example.com/hien-vat-truyen-thong",
    },
    {
      id: "tv-3",
      title: "Video truyền thống đơn vị",
      type: "Video",
      url: "https://example.com/video-truyen-thong",
    },
  ],
  binhDanHocVu: [
    {
      id: "bdhv-1",
      title:
        "Trách nhiệm người đứng đầu cơ quan, đơn vị trong công tác lãnh đạo, chỉ đạo triển khai thực hiện nhiệm vụ về phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số trong Binh chủng",
      link: "/binh-dan-hoc-vu-so",
      summary: "",
      image: news1,
    },
    {
      id: "bdhv-2",
      title: "Chuyên đề kỹ năng số cơ bản",
      link: "/binh-dan-hoc-vu-so",
      summary: "Tóm tắt các chuyên đề trọng tâm như xử lý văn bản số, cộng tác trực tuyến và bảo mật dữ liệu cá nhân.",
      image: news2,
    },
    {
      id: "bdhv-3",
      title: "An toàn thông tin quân sự",
      link: "/binh-dan-hoc-vu-so",
      summary: "Nội dung nhanh về nhận diện nguy cơ, quy trình báo cáo sự cố và thực hành an toàn thông tin trong đơn vị.",
      image: news3,
    },
  ],
  sidebarImages: {
    topImage: sidebarTopImage,
    bottomImage: sidebarBottomImage,
  },
  footer: {
    title: "ĐOÀN CÔNG BINH THĂNG LONG",
    descriptionLines: ["Phát huy truyền thống ''MỞ ĐƯỜNG THẮNG LỢI''"],
    quickLinks: [
      { label: "Trang chủ", href: "/" },
      { label: "Giới thiệu", href: "/gioi-thieu" },
      { label: "Tin tức", href: "/hoat-dong-don-vi/huan-luyen" },
      { label: "Thư viện", href: "/thu-vien/tu-lieu-truyen-thong-giao-duc" },
    ],
    contactLines: ["Đoàn công binh Thăng Long", "Quân khu / Bộ Quốc phòng", "Email: doancongbinhthanglong.bccb@gmail.com"],
    copyright: "© 2026 Đoàn công binh Thăng Long - Quân đội nhân dân Việt Nam. Bản quyền thuộc về Đoàn công binh Thăng Long.",
  },
  chatbot: {
    title: "Trợ lý Lữ đoàn 293",
    subtitle: "Binh chủng công binh",
    welcomeMessage:
      "Xin chào đồng chí! Tôi là trợ lý AI của Lữ đoàn 293. Sẵn sàng hỗ trợ tra cứu thông tin đơn vị, văn bản và quy định. Đồng chí cần gì?",
    greetingResponse:
      "Xin chào đồng chí! Tôi là trợ lý AI của Lữ đoàn 293. Sẵn sàng hỗ trợ tra cứu thông tin đơn vị, văn bản và quy định. Đồng chí cần gì?",
    fallbackResponse:
      "Tôi chưa có đủ dữ liệu cho câu hỏi này. Bạn có thể hỏi theo từ khóa: giới thiệu, huấn luyện, cứu hộ, dân vận, thư viện, liên hệ.",
    knowledgeBase: {
      "giới thiệu": "Lữ đoàn 293 là đơn vị công binh của Quân đội nhân dân Việt Nam, thực hiện nhiệm vụ bảo đảm công binh và sẵn sàng chiến đấu.",
      "huấn luyện": "Đơn vị thường xuyên tổ chức các nội dung huấn luyện vượt sông, cơ động lực lượng và sử dụng khí tài công binh.",
      "cứu hộ": "Lữ đoàn duy trì lực lượng ứng trực cứu hộ cứu nạn, phối hợp địa phương xử lý thiên tai và sự cố.",
      "dân vận": "Cán bộ, chiến sĩ tham gia công tác dân vận, hỗ trợ địa phương và xây dựng nông thôn mới.",
      "thư viện": "Mục Thư viện cung cấp tư liệu truyền thống, hiện vật và video để phục vụ học tập, tuyên truyền.",
      "liên hệ": "Bạn có thể liên hệ qua email: doancongbinhthanglong.bccb@gmail.com.",
    },
  },
});

const normalizeCmsData = (value: CmsData): CmsData => {
  const normalized = clone(value);

  normalized.navItems = (normalized.navItems || []).map((item, itemIndex) => ({
    ...item,
    id: item.id || `nav-item-${itemIndex + 1}`,
    visible: item.visible ?? true,
    children: (item.children || []).map((child, childIndex) => ({
      ...child,
      id: child.id || `${item.id || `nav-item-${itemIndex + 1}`}-child-${childIndex + 1}`,
      visible: child.visible ?? true,
    })),
  }));

  if (!normalized.sidebarImages?.topImage || !normalized.sidebarImages?.bottomImage) {
    normalized.sidebarImages = {
      topImage: normalized.sidebarImages?.topImage || sidebarTopImage,
      bottomImage: normalized.sidebarImages?.bottomImage || sidebarBottomImage,
    };
  }

  if (!normalized.footer) {
    normalized.footer = createInitialData().footer;
  }

  const contactText = normalized.chatbot?.knowledgeBase?.["liên hệ"];
  if (typeof contactText === "string" && contactText.includes("info@luduancongbinh293.vn")) {
    normalized.chatbot.knowledgeBase["liên hệ"] = contactText.replace(
      "info@luduancongbinh293.vn",
      "doancongbinhthanglong.bccb@gmail.com",
    );
  }

  return normalized;
};

let cache: CmsData | null = null;

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const readCmsStore = (): CmsData => {
  if (cache) {
    return clone(cache);
  }

  if (canUseStorage()) {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CmsData;
        const normalized = normalizeCmsData(parsed);
        cache = normalized;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return clone(normalized);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  const seed = normalizeCmsData(createInitialData());
  cache = seed;
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }
  return clone(seed);
};

export const writeCmsStore = (nextData: CmsData): CmsData => {
  const normalized = clone(nextData);
  cache = normalized;
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }
  return clone(normalized);
};

export const getCmsStore = async (): Promise<CmsData> => {
  await delay();
  return readCmsStore();
};

export const updateCmsStore = async (
  updater: CmsData | ((previous: CmsData) => CmsData),
): Promise<CmsData> => {
  await delay();
  const current = readCmsStore();
  const nextData = typeof updater === "function" ? updater(current) : updater;
  return writeCmsStore(nextData);
};
