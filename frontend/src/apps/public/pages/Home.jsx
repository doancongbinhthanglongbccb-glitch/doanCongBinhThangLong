import { useEffect, useState } from "react";
import sidebarTopImage from "@/assets/banner-4888.png";
import sidebarBottomImage from "@/assets/bannercdvcbqp2-9875.jpg";
import BinhDanHocVuSidebar from "@/shared/components/BinhDanHocVuSidebar";
import PublicLayout from "@/shared/layouts/PublicLayout";
import SectionTitle from "@/shared/components/system/SectionTitle";
import MarkdownContent from "@/shared/components/MarkdownContent";
import { getCmsData } from "@/services/api/cmsApi";
import { getPosts } from "@/services/api/postApi";

const Home = () => {
  const pageContainerClass = "w-full max-w-[1500px] mx-auto px-1 sm:px-2";
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
    <PublicLayout data={data} topBarDate={topBarDate}>
      <div className={`${pageContainerClass} pb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] gap-6 items-start">
          <div className="space-y-8">
            <section id="hoat-dong" className="border border-slate-200 bg-white p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <SectionTitle title={data.home?.mainFeedTitle || "Hoạt động tin"} />
              <p className="mt-2 text-base leading-relaxed text-slate-600">{data.home?.mainFeedDescription || ""}</p>

              <div className="mt-5 space-y-4">
                {data.activities.map((item, index) => (
                  <article
                    key={item.id}
                    className={`border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.05)] ${
                      index === 0 ? "bg-slate-50 p-5" : "bg-white p-4 md:p-5"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <h4 className={`${index === 0 ? "text-2xl" : "text-xl"} leading-[1.4] font-bold text-slate-900`}>{item.title}</h4>
                      <span className="text-xs font-medium tracking-wide text-slate-500">{item.date}</span>
                    </div>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">{item.category}</p>
                    <MarkdownContent value={item.content} className="prose prose-slate mt-3 max-w-none text-slate-700 leading-relaxed" />
                  </article>
                ))}
              </div>
            </section>

            <section id="guong-bac" className="border border-slate-200 bg-white p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <SectionTitle title={data.home?.guongBacTitle || "Theo gương Bác"} />
              <div className="mt-5 grid gap-4">
                {data.guongBac.map((item) => (
                  <article key={item.id} className="border border-slate-200 bg-white p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.type}</p>
                    <h4 className="mt-1.5 text-xl leading-[1.4] font-bold text-slate-900">{item.title}</h4>
                    <MarkdownContent value={item.content} className="prose prose-slate mt-3 max-w-none text-slate-700 leading-relaxed" />
                  </article>
                ))}
              </div>
            </section>

            <section id="thu-vien" className="border border-slate-200 bg-white p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <SectionTitle title={data.home?.thuVienTitle || "Thư viện"} />
              <div className="mt-5 space-y-4">
                {data.thuVien.map((item) => (
                  <article key={item.id} className="border border-slate-200 bg-white p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <h4 className="text-xl leading-[1.4] font-bold text-slate-900">{item.title}</h4>
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.type}</span>
                    </div>
                    <a href={item.url} target="_blank" rel="noreferrer" className="mt-3 block text-sm text-blue-700 underline break-all">
                      {item.url}
                    </a>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <div className="h-fit border border-slate-200 bg-white p-3 shadow-sm md:sticky md:top-4">
            <BinhDanHocVuSidebar
              items={data.binhDanHocVu ?? []}
              topImage={data.sidebarImages?.topImage || sidebarTopImage}
              bottomImage={data.sidebarImages?.bottomImage || sidebarBottomImage}
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Home;
