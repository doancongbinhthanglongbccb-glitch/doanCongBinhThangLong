import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
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
      <div className="min-h-screen bg-slate-100 text-slate-900">
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
                <h1 className="text-4xl font-bold text-primary">{data.header.title}</h1>
                {data.header.departmentName && (
                  <p className="text-sm text-gray-600 font-semibold uppercase mb-1">{data.header.departmentName}</p>
                )}
                <p className="text-gold text-lg font-semibold uppercase">{data.header.subtitle}</p>
              </div>
            </div>
          </header>
          <NavBar navItems={data.navItems ?? []} />
        </div>
        <main className="w-full max-w-[1600px] mx-auto px-3 py-8">
          <div className="border border-slate-200 bg-white p-8">
            <h2 className="text-3xl font-bold text-primary">Không tìm thấy trang</h2>
            <p className="mt-3 text-slate-700">Nội dung bạn chọn chưa được cấu hình.</p>
            <Link to="/" className="mt-4 inline-block text-primary underline">Quay về Trang chủ</Link>
          </div>
        </main>
      </div>
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
    <div className="min-h-screen bg-slate-100 text-slate-900">
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
            <div>
              <section className="border border-slate-200 bg-white p-6">
                <h3 className="text-3xl font-bold text-primary">{title}</h3>

                {introContent && <MarkdownContent value={introContent} className="prose prose-slate mt-3 max-w-none text-slate-700" />}

                {filteredActivities.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {filteredActivities.map((item) => (
                      <article key={item.id} className="border border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-xl font-semibold">{item.title}</h4>
                          <span className="text-sm text-slate-500">{item.date}</span>
                        </div>
                        <MarkdownContent value={item.content} className="prose prose-slate mt-2 max-w-none text-slate-700" />
                      </article>
                    ))}
                  </div>
                )}

                {filteredGuongBac.length > 0 && (
                  <div className="mt-4 grid gap-3">
                    {filteredGuongBac.map((item) => (
                      <article key={item.id} className="border border-slate-200 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">{item.type}</p>
                        <h4 className="mt-1 text-xl font-semibold">{item.title}</h4>
                        <MarkdownContent value={item.content} className="prose prose-slate mt-2 max-w-none text-slate-700" />
                      </article>
                    ))}
                  </div>
                )}

                {filteredThuVien.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {filteredThuVien.map((item) => (
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
                )}

                {finalConfig.isBinhDanHocVuDetail && selectedBinhDanPost && (
                  <article className="mt-4 overflow-hidden border border-slate-200 bg-white">
                    <img
                      src={selectedBinhDanPost.image || sidebarTopImage}
                      alt={selectedBinhDanPost.title}
                      className="h-80 w-full object-cover"
                    />
                    <div className="p-5">
                      <h4 className="text-2xl font-bold text-slate-900">{selectedBinhDanPost.title}</h4>
                      <MarkdownContent
                        value={selectedBinhDanPost.summary || "Noi dung chi tiet dang duoc cap nhat."}
                        className="prose prose-slate mt-3 max-w-none text-base leading-relaxed text-slate-700"
                      />
                    </div>
                  </article>
                )}

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

export default SectionPage;
