import { Link } from "react-router-dom";
import { useSiteContent } from "@/context/SiteContentContext";
import topDecor from "@/assets/binh-dan-hoc-vu-so-banner.svg";
import bottomDecor from "@/assets/news-4.svg";

const PersistentSidebar = () => {
  const { content, loading } = useSiteContent();

  if (loading || !content) return null;

  const latestNews = content.newsItems.slice(1, 5);

  if (!latestNews.length) return null;

  return (
    <aside className="w-full space-y-2">
      <img
        src={topDecor}
        alt="Bình dân học vụ số"
        className="w-full h-24 object-cover border border-border"
        loading="lazy"
      />

      <div className="border border-border bg-card shadow-md overflow-hidden">
        <div className="bg-primary px-4 py-3 text-lg font-bold uppercase text-primary-foreground">
          Tin mới nhất
        </div>
        <ul className="max-h-[70vh] overflow-y-auto bg-background">
          {latestNews.map((item) => (
            <li key={item.id} className="border-b border-border last:border-b-0">
              <Link to="/hoat-dong-don-vi" className="block p-2.5 hover:bg-muted transition-colors">
                <div className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-36 h-24 object-cover flex-shrink-0"
                    loading="lazy"
                    width={144}
                    height={96}
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-foreground leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                    <span className="text-sm text-muted-foreground mt-1 block">{item.date}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <img
        src={bottomDecor}
        alt="Tư liệu liên quan"
        className="w-full h-52 object-cover border border-border"
        loading="lazy"
      />
    </aside>
  );
};

export default PersistentSidebar;
