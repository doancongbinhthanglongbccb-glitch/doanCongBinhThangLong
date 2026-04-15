import heroBanner from "@/assets/banner-293.jpg";
import logoImg from "@/assets/logo-293.png";
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
    { label: "Trang chủ", href: "/", active: true },
    { label: "Giới thiệu", href: "/gioi-thieu" },
    {
      label: "Hoạt động đơn vị",
      children: [
        { label: "Huấn luyện", href: "/hoat-dong-don-vi/huan-luyen" },
        { label: "Cứu hộ", href: "/hoat-dong-don-vi/cuu-ho" },
        { label: "Dân vận", href: "/hoat-dong-don-vi/dan-van" },
        { label: "Bình dân học vụ số", href: "/binh-dan-hoc-vu-so" },
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
      "liên hệ": "Bạn có thể liên hệ qua email: info@luduancongbinh293.vn.",
    },
  },
});

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
        cache = parsed;
        return clone(parsed);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  const seed = createInitialData();
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
