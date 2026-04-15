import { useEffect, useState } from "react";
import NavBar from "@/shared/components/NavBar";
import sidebarTopImage from "@/assets/banner-4888.png";
import sidebarBottomImage from "@/assets/bannercdvcbqp2-9875.jpg";
import BinhDanHocVuSidebar from "@/shared/components/BinhDanHocVuSidebar";
import Footer from "@/shared/components/Footer";
import Chatbot from "@/shared/components/Chatbot";
import chatbotIcon from "@/assets/chatbot.png";
import MarkdownContent from "@/shared/components/MarkdownContent";
import { getCmsData } from "@/services/api/cmsApi";
import { getPosts } from "@/services/api/postApi";

const Home = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [cmsData, posts] = await Promise.all([getCmsData(), getPosts()]);
        if (!mounted) {
          return;
        }
        setData({ ...cmsData, activities: posts });
        setError("");
      } catch (loadError) {
        if (!mounted) {
          return;
        }
        setError("Không thể tải nội dung website.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const topBarDate = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  if (error && !loading) {
    return <div className="container py-10 text-red-600">{error}</div>;
  }

  if (loading || !data) {
    return <div className="container py-10">Đang tải website...</div>;
  }

  return (
    <div id="trang-chu" className="min-h-screen bg-slate-100 text-slate-900">
      <div className="sticky top-0 z-50">
        <div className="bg-topbar text-white">
          <div className="w-full max-w-[1600px] mx-auto px-3 py-2 text-sm">
            <span className="font-semibold capitalize">{topBarDate}</span>
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

        <NavBar navItems={data.navItems ?? []} />
      </div>

      <section className="bg-white">
        <div className="w-full max-w-[1600px] mx-auto px-3 py-3">
          <img src={data.hero.image} alt="hero" className="w-full h-44 md:h-56 lg:h-64 object-contain" />
        </div>
      </section>

      <main>
        <div className="w-full max-w-[1600px] mx-auto px-3 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px] gap-4 items-start">
            <div className="space-y-4">
              <section id="hoat-dong" className="border border-slate-200 bg-white p-6">
                <h3 className="text-3xl font-bold text-primary">{data.home?.mainFeedTitle || "Hoạt động tin"}</h3>
                <p className="mt-2 text-base text-slate-600">{data.home?.mainFeedDescription || ""}</p>

                <div className="mt-4 space-y-3">
                  {data.activities.map((item, index) => (
                    <article key={item.id} className={`border border-slate-200 ${index === 0 ? "bg-slate-50 p-5" : "p-4"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <h4 className={`${index === 0 ? "text-2xl" : "text-xl"} font-semibold`}>{item.title}</h4>
                        <span className="text-sm text-slate-500">{item.date}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{item.category}</p>
                      <MarkdownContent value={item.content} className="prose prose-slate mt-2 max-w-none text-slate-700" />
                    </article>
                  ))}
                </div>
              </section>

              <section id="guong-bac" className="border border-slate-200 bg-white p-6">
                <h3 className="text-3xl font-bold text-primary">{data.home?.guongBacTitle || "Theo gương Bác"}</h3>
                <div className="mt-4 grid gap-3">
                  {data.guongBac.map((item) => (
                    <article key={item.id} className="border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">{item.type}</p>
                      <h4 className="mt-1 text-xl font-semibold">{item.title}</h4>
                      <MarkdownContent value={item.content} className="prose prose-slate mt-2 max-w-none text-slate-700" />
                    </article>
                  ))}
                </div>
              </section>

              <section id="thu-vien" className="border border-slate-200 bg-white p-6">
                <h3 className="text-3xl font-bold text-primary">{data.home?.thuVienTitle || "Thư viện"}</h3>
                <div className="mt-4 space-y-3">
                  {data.thuVien.map((item) => (
                    <article key={item.id} className="border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-xl font-semibold">{item.title}</h4>
                        <span className="text-sm text-slate-500">{item.type}</span>
                      </div>
                      <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 block text-blue-700 underline break-all">
                        {item.url}
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <BinhDanHocVuSidebar
              items={data.binhDanHocVu ?? []}
              topImage={sidebarTopImage}
              bottomImage={sidebarBottomImage}
              stickyClassName="sticky top-24 self-start"
            />
          </div>
        </div>
      </main>

      <Footer logo={data.header.logo} />
      {data.chatbot && <Chatbot chatbotContent={data.chatbot} emblem={chatbotIcon} />}
    </div>
  );
};

export default Home;
