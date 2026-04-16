import type { MediaItem } from "@/shared/types/media";
import type { Post } from "@/shared/types/post";

export type NavChildItem = {
  id?: string;
  label: string;
  href: string;
  visible?: boolean;
};

export type NavItem = {
  id?: string;
  label: string;
  href?: string;
  active?: boolean;
  visible?: boolean;
  children?: NavChildItem[];
};

export type HomeContent = {
  mainFeedTitle: string;
  mainFeedDescription: string;
  guongBacTitle: string;
  thuVienTitle: string;
};

export type HeaderContent = {
  logo: string;
  title: string;
  subtitle: string;
};

export type HeroContent = {
  image: string;
  title: string;
  subtitle: string;
};

export type IntroContent = {
  title: string;
  content: string;
};

export type ActivityItem = Post;

export type GuongBacItem = {
  id: string;
  title: string;
  content: string;
  type: string;
  date?: string;
};

export type ThuVienItem = MediaItem;

export type BinhDanHocVuItem = {
  id: string;
  title: string;
  link?: string;
  summary?: string;
  image?: string;
};

export type SidebarImages = {
  topImage: string;
  bottomImage: string;
};

export type FooterContent = {
  title: string;
  descriptionLines: string[];
  quickLinks: Array<{ label: string; href: string }>;
  contactLines: string[];
  copyright: string;
};

export type ChatbotContent = {
  title: string;
  subtitle: string;
  welcomeMessage: string;
  greetingResponse: string;
  fallbackResponse: string;
  knowledgeBase: Record<string, string>;
};

export type CmsData = {
  home: HomeContent;
  header: HeaderContent;
  navItems: NavItem[];
  hero: HeroContent;
  intro: IntroContent;
  activities: ActivityItem[];
  guongBac: GuongBacItem[];
  thuVien: ThuVienItem[];
  binhDanHocVu: BinhDanHocVuItem[];
  sidebarImages: SidebarImages;
  footer: FooterContent;
  chatbot: ChatbotContent;
};

export type CmsCollectionKey = "activities" | "guongBac" | "thuVien" | "binhDanHocVu";
