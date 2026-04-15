export type NavChildItem = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href?: string;
  active?: boolean;
  children?: NavChildItem[];
};

export type SiteSection = {
  id: string;
  title: string;
  body: string;
  type?: "text" | "news";
};

export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
};

export type SiteContent = {
  topBar: {
    hotlineLabel: string;
    hotlineValue: string;
  };
  header: {
    logo: string;
    logoAlt: string;
    title: string;
    subtitle: string;
  };
  hero: {
    image: string;
    alt: string;
    title: string;
    subtitle: string;
  };
  navItems: NavItem[];
  sections: SiteSection[];
  newsItems: NewsItem[];
  footer: {
    title: string;
    descriptionLines: string[];
    quickLinks: Array<{ label: string; href: string }>;
    contactLines: string[];
    copyright: string;
  };
  chatbot: {
    title: string;
    subtitle: string;
    welcomeMessage: string;
    greetingResponse: string;
    fallbackResponse: string;
    knowledgeBase: Record<string, string>;
  };
};
