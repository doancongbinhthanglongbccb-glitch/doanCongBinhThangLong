import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import PersistentSidebar from "@/components/PersistentSidebar";
import HeroBanner from "@/components/HeroBanner";
import { useSiteContent } from "@/context/SiteContentContext";

const SiteShell = ({ children }: { children: React.ReactNode }) => {
  const { content, loading } = useSiteContent();

  if (loading || !content) {
    return <div className="container py-10">Đang tải nội dung website...</div>;
  }

  return (
    <div id="top" className="min-h-screen flex flex-col">
      <TopBar hotlineLabel={content.topBar.hotlineLabel} hotlineValue={content.topBar.hotlineValue} />
      <Header
        logo={content.header.logo}
        logoAlt={content.header.logoAlt}
        title={content.header.title}
        subtitle={content.header.subtitle}
      />
      <NavBar navItems={content.navItems} />
      <HeroBanner
        image={content.hero.image}
        alt={content.hero.alt}
        title={content.hero.title}
        subtitle={content.hero.subtitle}
      />
      <main className="flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-3 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px] gap-4 items-start">
            <div>{children}</div>
            <div className="hidden lg:block sticky top-24 self-start">
              <PersistentSidebar />
            </div>
          </div>
        </div>
      </main>
      <Footer
        title={content.footer.title}
        descriptionLines={content.footer.descriptionLines}
        quickLinks={content.footer.quickLinks}
        contactLines={content.footer.contactLines}
        copyright={content.footer.copyright}
      />
      <Chatbot chatbotContent={content.chatbot} />
    </div>
  );
};

export default SiteShell;
