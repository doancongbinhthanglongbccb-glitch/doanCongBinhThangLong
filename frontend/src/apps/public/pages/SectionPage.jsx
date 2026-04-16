import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import sidebarTopImage from "@/assets/banner-4888.png";
import sidebarBottomImage from "@/assets/bannercdvcbqp2-9875.jpg";
import BinhDanHocVuSidebar from "@/shared/components/BinhDanHocVuSidebar";
import PublicLayout from "@/shared/layouts/PublicLayout";
import SectionTitle from "@/shared/components/system/SectionTitle";
import MarkdownContent from "@/shared/components/MarkdownContent";
import { getCmsData } from "@/services/api/cmsApi";
import { getPosts } from "@/services/api/postApi";

const pageConfig = {
  "/gioi-thieu": {
    title: "Giới thiệu",
    contentKey: "intro",
  },
  "/hoat-dong-don-vi/huan-luyen": {
    title: "Huấn luyện",
    activityCategory: "Huấn luyện",
    bannerSubtitle: "Hoạt động huấn luyện, diễn tập và sẵn sàng chiến đấu",
  },
  "/hoat-dong-don-vi/cuu-ho": {
    title: "Cứu hộ",
    activityCategory: "Cứu hộ",
    bannerSubtitle: "Hoạt động cứu hộ cứu nạn, hỗ trợ nhân dân",
  },
  "/hoat-dong-don-vi/dan-van": {
    title: "Dân vận",
    activityCategory: "Dân vận",
    bannerSubtitle: "Công tác dân vận và chương trình vì cộng đồng",
  },
  "/theo-guong-bac/moi-ngay-mot-loi-bac-ho-day": {
    title: "Mỗi ngày một lời Bác Hồ dạy",
    guongBacType: "Lời Bác",
    bannerSubtitle: "Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh",
  },
  "/theo-guong-bac/moi-tuan-mot-dieu-luat": {
    title: "Mỗi tuần một điều luật",
    guongBacType: "Điều luật",
    bannerSubtitle: "Tuyên truyền, phổ biến và giáo dục pháp luật",
  },
  "/thu-vien/tu-lieu-truyen-thong-giao-duc": {
    title: "Tư liệu truyền thống - giáo dục",
    thuVienType: "Tư liệu truyền thống - giáo dục",
    bannerSubtitle: "Kho tư liệu phục vụ công tác tuyên truyền và giáo dục",
  },
  "/thu-vien/hien-vat-truyen-thong": {
    title: "Hiện vật truyền thống",
    thuVienType: "Hiện vật truyền thống",
    bannerSubtitle: "Không gian lưu giữ dấu ấn lịch sử của đơn vị",
  },
  "/thu-vien/video": {
    title: "Video",
    thuVienType: "Video",
    bannerSubtitle: "Chuyên mục video hoạt động và truyền thống đơn vị",
  },
  "/binh-dan-hoc-vu-so": {
    title: "Bình dân học vụ số",
    isBinhDanHocVu: true,
    bannerSubtitle: "Nâng cao năng lực số cho cán bộ, chiến sĩ",
  },
};

const SectionPage = () => {
  const pageContainerClass = "w-full max-w-[1500px] mx-auto px-1 sm:px-2";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const { section, subsection } = useParams();

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
      } catch {
        if (!mounted) {
          return;
        }
        setError("Không thể tải dữ liệu trang.");
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
    return <div className="container py-10">Đang tải trang...</div>;
  }

  const config = pageConfig[location.pathname];
  const isBinhDanHocVuDetail = section === "binh-dan-hoc-vu-so" && Boolean(subsection);
  const selectedBinhDanPost = isBinhDanHocVuDetail
    ? data.binhDanHocVu.find((item) => item.id === subsection)
    : null;
  const dynamicConfig = selectedBinhDanPost
    ? {
        title: selectedBinhDanPost.title,
        isBinhDanHocVuDetail: true,
        bannerSubtitle: "Chi tiết nội dung Bình dân học vụ số",
      }
    : null;
  const finalConfig = config || dynamicConfig;

  if (!finalConfig) {
    return (
      <PublicLayout data={data} topBarDate={topBarDate}>
        <div className={`${pageContainerClass} pb-6`}>
          <div className="border border-slate-200 bg-white p-5 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <h2 className="text-3xl font-bold text-primary">Không tìm thấy trang</h2>
            <p className="mt-3 text-slate-700">Nội dung bạn chọn chưa được cấu hình.</p>
            <Link to="/" className="mt-4 inline-block text-primary underline">Quay về Trang chủ</Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const title = finalConfig.title;
  const introContent = finalConfig.contentKey === "intro" ? data.intro.content : finalConfig.content;
  const filteredActivities = finalConfig.activityCategory
    ? data.activities.filter((item) => item.category === finalConfig.activityCategory)
    : [];
  const filteredGuongBac = finalConfig.guongBacType ? data.guongBac.filter((item) => item.type === finalConfig.guongBacType) : [];
  const filteredThuVien = finalConfig.thuVienType ? data.thuVien.filter((item) => item.type === finalConfig.thuVienType) : [];

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

                {finalConfig.isBinhDanHocVuDetail && selectedBinhDanPost && (
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

export default SectionPage;
