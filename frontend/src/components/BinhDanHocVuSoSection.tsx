import bannerImage from "@/assets/binh-dan-hoc-vu-so-banner.svg";
import news1 from "@/assets/news-1.svg";
import news2 from "@/assets/news-2.svg";

type BinhDanHocVuSoSectionProps = {
  id: string;
  title: string;
  body: string;
};

const quickMenus = [
  "Giới thiệu nền tảng",
  "Tin chuyển đổi số",
  "Tài liệu tập huấn",
  "Mỗi tuần một kỹ năng số",
  "An toàn thông tin",
  "Hỏi đáp nhanh",
];

const mockPosts = [
  {
    image: news1,
    title: "Hướng dẫn khai thác nền tảng Bình Dân học vụ số cho cán bộ, chiến sĩ",
    desc: "Nội dung hướng dẫn đăng nhập, theo dõi chuyên đề và nộp bài thu hoạch trực tuyến theo từng cấp đơn vị.",
    date: "14/04/2026",
  },
  {
    image: news2,
    title: "Chuyên đề mẫu: Trách nhiệm trong công tác xây dựng, kiện toàn nhân lực",
    desc: "Mô phỏng bài học số theo định dạng infographic và câu hỏi kiểm tra nhanh để tự học hàng tuần.",
    date: "12/04/2026",
  },
  {
    image: news1,
    title: "Bộ tiêu chí đánh giá mức độ hoàn thành học vụ số theo từng tháng",
    desc: "Đề xuất khung chấm điểm minh bạch, giúp chỉ huy đơn vị theo dõi tiến độ học tập của từng bộ phận.",
    date: "10/04/2026",
  },
];

const BinhDanHocVuSoSection = ({ id, title, body }: BinhDanHocVuSoSectionProps) => {
  return (
    <section id={id} className="py-0 scroll-mt-24">
      <div className="space-y-5">
        <div className="border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Danh mục nhanh</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {quickMenus.map((item) => (
              <span key={item} className="px-2.5 py-1 bg-muted text-xs text-foreground">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <img
            src={bannerImage}
            alt="Nền tảng Bình Dân học vụ số"
            className="w-full h-28 md:h-40 object-cover border border-gold/40"
          />

          <div className="border border-border bg-card p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-primary">{title}</h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">{body}</p>
          </div>

          <div className="border border-border bg-card p-5 shadow-sm">
            <h3 className="text-lg font-bold text-primary">Nội dung mô phỏng chuyên mục</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {mockPosts.map((post) => (
                <article key={post.title} className="border border-border overflow-hidden bg-background">
                  <img src={post.image} alt={post.title} className="w-full h-36 object-cover" />
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground">{post.date}</p>
                    <h4 className="mt-1 text-sm font-semibold leading-snug line-clamp-2">{post.title}</h4>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">{post.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BinhDanHocVuSoSection;
