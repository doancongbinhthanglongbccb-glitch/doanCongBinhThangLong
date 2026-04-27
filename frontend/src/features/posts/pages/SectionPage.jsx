import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import sidebarTopImage from "@/assets/banner-4888.png";
import sidebarBottomImage from "@/assets/bannercdvcbqp2-9875.jpg";
import BinhDanHocVuSidebar from "@/shared/components/BinhDanHocVuSidebar";
import PublicLayout from "@/app/layout/PublicLayout";
import SectionTitle from "@/shared/components/system/SectionTitle";
import MarkdownContent from "@/shared/components/MarkdownContent";
import { getCmsData } from "@/services/api/cmsApi";
import { getPublicPosts } from "@/services/api/postApi";
import { getApiErrorMessage } from "@/services/api/errors";
import { getCategoriesTree } from "@/features/categories/services/categories.service";

const SectionPage = () => {
  const pageContainerClass = "w-full max-w-[1500px] mx-auto px-1 sm:px-2";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryTree, setCategoryTree] = useState([]);
  const { section, subsection } = useParams();

  const categorySlug = useMemo(() => {
    if (!section) return "";
    return subsection ? String(subsection) : String(section);
  }, [section, subsection]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [cmsData, categoryTreeResponse, postsResponse] = await Promise.all([
          getCmsData(),
          getCategoriesTree(),
          categorySlug ? getPublicPosts({ page: 1, limit: 10, categorySlug }) : getPublicPosts({ page: 1, limit: 10 }),
        ]);
        if (!mounted) {
          return;
        }
        setData({ ...cmsData, activities: postsResponse.data });
        setCategoryTree(categoryTreeResponse || []);
        setError("");
      } catch (loadError) {
        if (!mounted) {
          return;
        }
        setError(getApiErrorMessage(loadError, "Không thể tải dữ liệu trang."));
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
  }, [categorySlug]);

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
    return <div className="container py-10">Đang tải trang...</div>;
  }

  const isBinhDanHocVuDetail = section === "binh-dan-hoc-vu-so" && Boolean(subsection);
  const selectedBinhDanPost = isBinhDanHocVuDetail ? data.binhDanHocVu.find((item) => item.id === subsection) : null;
  const findCategoryBySlug = (nodes, slug) => {
    for (const node of nodes || []) {
      if (node.slug === slug) return node;
      const childHit = findCategoryBySlug(node.children || [], slug);
      if (childHit) return childHit;
    }
    return null;
  };

  const categoryNode = categorySlug ? findCategoryBySlug(categoryTree, categorySlug) : null;
  const title = selectedBinhDanPost?.title || categoryNode?.name || (section === "gioi-thieu" ? "Giới thiệu" : "Nội dung");
  const introContent = section === "gioi-thieu" ? data.intro?.content : "";
  const filteredActivities = data.activities || [];
  const filteredGuongBac = [];
  const filteredThuVien = [];

  return (
    <PublicLayout data={data} topBarDate={topBarDate}>
      <div className={`${pageContainerClass} pb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] gap-6 items-start">
          <div>
            <section className="border border-slate-200 bg-white p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <SectionTitle title={title} />

              {introContent && <MarkdownContent value={introContent} className="prose prose-slate mt-3 max-w-none text-slate-700 leading-relaxed" />}

              {filteredActivities.length > 0 && (
                <div className="mt-5 space-y-4">
                  {filteredActivities.map((item) => (
                    <article key={item.id} className="border border-slate-200 bg-white p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <h4 className="text-xl leading-[1.4] font-bold text-slate-900">{item.title}</h4>
                        <span className="text-xs font-medium tracking-wide text-slate-500">{item.date}</span>
                      </div>
                      <MarkdownContent value={item.content} className="prose prose-slate mt-3 max-w-none text-slate-700 leading-relaxed" />
                    </article>
                  ))}
                </div>
              )}

              {filteredGuongBac.length > 0 && (
                <div className="mt-5 grid gap-4">
                  {filteredGuongBac.map((item) => (
                    <article key={item.id} className="border border-slate-200 bg-white p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.type}</p>
                      <h4 className="mt-1.5 text-xl leading-[1.4] font-bold text-slate-900">{item.title}</h4>
                      <MarkdownContent value={item.content} className="prose prose-slate mt-3 max-w-none text-slate-700 leading-relaxed" />
                    </article>
                  ))}
                </div>
              )}

              {filteredThuVien.length > 0 && (
                <div className="mt-5 space-y-4">
                  {filteredThuVien.map((item) => (
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
              )}

              {isBinhDanHocVuDetail && selectedBinhDanPost && (
                <article className="mt-5 overflow-hidden border border-slate-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                  <img
                    src={selectedBinhDanPost.image || data.sidebarImages?.topImage || sidebarTopImage}
                    alt={selectedBinhDanPost.title}
                    className="h-80 w-full object-cover"
                  />
                  <div className="p-4 md:p-5">
                    <h4 className="text-2xl leading-[1.4] font-bold text-slate-900">{selectedBinhDanPost.title}</h4>
                    <MarkdownContent
                      value={selectedBinhDanPost.summary || "Noi dung chi tiet dang duoc cap nhat."}
                      className="prose prose-slate mt-3 max-w-none text-base leading-relaxed text-slate-700"
                    />
                  </div>
                </article>
              )}
            </section>
          </div>

          <div className="h-fit md:sticky md:top-4">
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

export default SectionPage;
