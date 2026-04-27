export type CmsCollectionKey = "activities" | "guongBac" | "thuVien" | "binhDanHocVu";

export interface HomeConfig {
  mainFeedTitle: string;
  mainFeedDescription: string;
  guongBacTitle: string;
  thuVienTitle: string;
}

export interface HeaderConfig {
  logo: string;
  title: string;
  subtitle: string;
}

export interface HeroConfig {
  image: string;
  title: string;
  subtitle: string;
}

export interface IntroConfig {
  title: string;
  content: string;
}

export interface FooterConfig {
  title: string;
  descriptionLines: string[];
  quickLinks: string[];
  contactLines: string[];
  copyright: string;
}

export interface ChatbotConfig {
  title: string;
  subtitle: string;
  welcomeMessage: string;
  greetingResponse: string;
  fallbackResponse: string;
  knowledgeBase: Record<string, any>;
}

export interface SidebarImagesConfig {
  topImage: string;
  bottomImage: string;
}

export interface CmsData {
  home: HomeConfig;
  header: HeaderConfig;
  navItems: string[];
  hero: HeroConfig;
  intro: IntroConfig;
  activities: any[];
  guongBac: any[];
  thuVien: any[];
  binhDanHocVu: any[];
  sidebarImages: SidebarImagesConfig;
  footer: FooterConfig;
  chatbot: ChatbotConfig;
}

export type ConfigUpdatePayload = Partial<CmsData>;
