import NavBar from "@/shared/components/NavBar";
import Footer from "@/shared/components/Footer";
import Chatbot from "@/shared/components/Chatbot";
import chatbotIcon from "@/assets/chatbot.png";

const BANNER_FOCUS_Y = "30%";

const getVisibleNavItems = (navItems = []) => {
  return navItems
    .filter((item) => item.visible !== false)
    .map((item) => ({
      ...item,
      children: (item.children || []).filter((child) => child.visible !== false),
    }));
};

const PublicLayout = ({ data, topBarDate, children }) => {
  const navItems = getVisibleNavItems(data.navItems || []);

  return (
    <div id="trang-chu" className="min-h-screen bg-slate-100 text-slate-900">
      <div className="sticky top-0 z-50">
        <div className="bg-topbar text-white">
          <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <span className="font-medium uppercase tracking-[0.14em] text-white/80">Cổng thông tin điện tử</span>
            <span className="font-semibold capitalize text-right whitespace-nowrap">{topBarDate}</span>
          </div>
        </div>

        <header className="bg-white border-b border-slate-200">
          <div className="w-full max-w-[1600px] mx-auto px-3 py-3 flex items-center gap-4">
            <img src={data.header.logo} alt="logo" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-4xl font-bold text-primary uppercase">{data.header.title}</h1>
              <p className="text-gold text-lg font-semibold uppercase">{data.header.subtitle}</p>
            </div>
          </div>
        </header>

        <NavBar navItems={navItems} />
      </div>

      <section className="w-full overflow-hidden bg-white">
        <img
          src={data.hero.image}
          alt="hero"
          className="block w-full object-cover h-[240px] md:h-[380px] lg:h-[540px]"
          style={{ 
            aspectRatio: "1360 / 540",
            objectPosition: `center ${BANNER_FOCUS_Y}` 
          }}
        />
      </section>

      <main className="mt-6">{children}</main>

      <Footer
        logo={data.header.logo}
        title={data.footer?.title}
        descriptionLines={data.footer?.descriptionLines}
        quickLinks={data.footer?.quickLinks}
        contactLines={data.footer?.contactLines}
        copyright={data.footer?.copyright}
      />

      {data.chatbot && <Chatbot chatbotContent={data.chatbot} emblem={chatbotIcon} />}
    </div>
  );
};

export default PublicLayout;
