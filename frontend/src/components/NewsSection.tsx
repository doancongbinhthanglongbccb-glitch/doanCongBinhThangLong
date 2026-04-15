import type { NewsItem } from "@/types/site";

type NewsSectionProps = {
  newsItems: NewsItem[];
};

const NewsSection = ({ newsItems }: NewsSectionProps) => {
  if (!newsItems.length) {
    return (
      <section className="py-0">
        <div className="border border-border bg-card p-6 text-sm text-muted-foreground">
          Chưa có bản tin. Admin có thể vào mục quản trị để đăng tin mới.
        </div>
      </section>
    );
  }

  const [featuredNews, ...sideNews] = newsItems;

  return (
    <section className="py-0">
      <div className="grid grid-cols-1 gap-6">
        {/* Featured news */}
        <div>
          <div className="group cursor-pointer">
            <div className="overflow-hidden">
              <img
                src={featuredNews.image}
                alt={featuredNews.title}
                className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                width={800}
                height={512}
              />
            </div>
            <h3 className="mt-3 text-lg md:text-xl font-bold text-primary group-hover:underline leading-snug">
              {featuredNews.title}
            </h3>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{featuredNews.excerpt}</p>
            <span className="text-xs text-muted-foreground mt-1 block">{featuredNews.date}</span>
          </div>
        </div>

        {/* Side news */}
        <div className="space-y-4 lg:hidden">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-t-lg font-bold text-sm uppercase">
            Tin mới nhất
          </div>
          {sideNews.map((item, i) => (
            <div key={i} className="flex gap-3 group cursor-pointer">
              <img
                src={item.image}
                alt={item.title}
                className="w-24 h-16 object-cover rounded flex-shrink-0"
                loading="lazy"
                width={96}
                height={64}
              />
              <div>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h4>
                <span className="text-xs text-muted-foreground">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
