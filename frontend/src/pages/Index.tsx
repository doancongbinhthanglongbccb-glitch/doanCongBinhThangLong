import SiteShell from "@/components/SiteShell";
import NewsSection from "@/components/NewsSection";
import { useSiteContent } from "@/context/SiteContentContext";

const Index = () => {
  const { content, loading } = useSiteContent();

  if (loading || !content) {
    return <div className="container py-10">Đang tải nội dung website...</div>;
  }

  return (
    <SiteShell>
      <section className="py-0">
        <div className="border border-border bg-card p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-primary">{content.sections.find((item) => item.id === "gioi-thieu")?.title}</h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
            {content.sections.find((item) => item.id === "gioi-thieu")?.body}
          </p>
        </div>
      </section>
      <NewsSection newsItems={content.newsItems} />
    </SiteShell>
  );
};

export default Index;
