import SiteShell from "@/components/SiteShell";
import BinhDanHocVuSoSection from "@/components/BinhDanHocVuSoSection";
import NewsSection from "@/components/NewsSection";
import { useSiteContent } from "@/context/SiteContentContext";

const SectionPage = ({ sectionId }: { sectionId: string }) => {
  const { content, loading } = useSiteContent();

  if (loading || !content) {
    return <div className="container py-10">Đang tải nội dung trang...</div>;
  }

  const section = content.sections.find((item) => item.id === sectionId);

  if (!section) {
    return (
      <SiteShell>
        <section className="container py-8">
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Không tìm thấy nội dung cho mục này.
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      {section.type === "news" ? (
        <section className="scroll-mt-24">
          <NewsSection newsItems={content.newsItems} />
        </section>
      ) : section.id === "binh-dan-hoc-vu-so" ? (
        <BinhDanHocVuSoSection id={section.id} title={section.title} body={section.body} />
      ) : (
        <section id={section.id} className="py-0 scroll-mt-24">
          <div className="border border-border bg-card p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-primary">{section.title}</h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">{section.body}</p>
          </div>
        </section>
      )}
    </SiteShell>
  );
};

export default SectionPage;
