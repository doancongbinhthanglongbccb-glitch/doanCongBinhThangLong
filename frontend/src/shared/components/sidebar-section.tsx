import { useMemo, useCallback } from "react";

// ============================================================
// TYPES
// ============================================================

export type Post = {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  thumbnail?: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SidebarItem = {
  itemId: string;
  postId: string;
  order: number;
  pinned?: boolean;
  visible?: boolean;
  overrideTitle?: string;
  overrideSummary?: string;
  overrideImage?: string;
};

export type SidebarBanner = {
  image: string;
  alt?: string;
  href?: string;
};

export type SidebarSectionConfig = {
  sectionId: string;
  title: string;
  topBanner?: SidebarBanner;
  bottomBanner?: SidebarBanner;
  items: SidebarItem[];
};

export type MappedItem = {
  itemId: string;
  postId: string;
  title: string;
  summary: string;
  image: string;
  slug?: string;
  href: string;
};

export type SidebarSectionProps = {
  config: SidebarSectionConfig;
  posts?: Post[];
  isLoading?: boolean;
  error?: string;
};

// ============================================================
// DATA TRANSFORM (pure function — unit testable)
// ============================================================

export function transformSidebarData(
  items: SidebarItem[],
  posts: Post[]
): { featured: MappedItem | null; list: MappedItem[] } {
  const postMap = new Map(posts.map((p) => [p.id, p]));

  const validItems = items
    .filter((item) => item.visible !== false)
    .map((item) => {
      const post = postMap.get(item.postId);
      return { item, post };
    })
    .filter(({ post }) => post != null && post.published !== false);

  if (validItems.length === 0) {
    return { featured: null, list: [] };
  }

  const sorted = [...validItems].sort((a, b) => a.item.order - b.item.order);

  const pinned = sorted.find(({ item }) => item.pinned === true);
  const featuredItem = pinned ?? sorted[0];

  const listItems = sorted.filter(({ item }) => item.itemId !== featuredItem.item.itemId);

  const mapItem = ({ item, post }: { item: SidebarItem; post: Post }): MappedItem => {
    const title = item.overrideTitle || post.title;
    const summary = item.overrideSummary || post.summary || "Không có mô tả";
    const image = item.overrideImage || post.thumbnail || `https://picsum.photos/seed/${post.id}/400/240`;
    const href = post.slug ? `/bai-viet/${post.slug}` : "/#";

    return { itemId: item.itemId, postId: post.id, title, summary, image, slug: post.slug, href };
  };

  return {
    featured: mapItem(featuredItem),
    list: listItems.map(mapItem),
  };
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function ImageWithFallback({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const seed = img.getAttribute("data-seed") ?? "fallback";
    img.src = `https://picsum.photos/seed/${seed}/400/240`;
    img.onError = null;
  }, []);

  const seed = useMemo(() => {
    try {
      const url = new URL(src);
      if (url.hostname === "picsum.photos") {
        return url.pathname.split("/")[2];
      }
    } catch {
      // not a valid URL
    }
    return src.replace(/\W/g, "").slice(0, 12);
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" data-seed={seed} className={className} onError={handleError} />
  );
}

export function SidebarSectionSkeleton() {
  return (
    <aside className="h-fit rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm">
      <div className="mb-3">
        <div className="h-28 w-full animate-pulse rounded-lg bg-[#E5E7EB]" />
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-[#E5E7EB]" />
        <div className="mt-1 h-3 w-full animate-pulse rounded bg-[#E5E7EB]" />
        <div className="mt-1 h-3 w-2/3 animate-pulse rounded bg-[#E5E7EB]" />
      </div>
      <div className="border-t border-[#E5E7EB] pt-3 space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-2">
            <div className="h-12 w-16 animate-pulse rounded bg-[#E5E7EB] shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-full animate-pulse rounded bg-[#E5E7EB]" />
              <div className="h-2.5 w-4/5 animate-pulse rounded bg-[#E5E7EB]" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function SidebarSectionEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <svg
        className="mb-2 h-8 w-8 text-[#9B9B9B]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
      <p className="text-sm text-[#4B5563]">Chưa có bài viết nào trong mục này.</p>
    </div>
  );
}

export function SidebarFeaturedCard({ item }: { item: MappedItem }) {
  return (
    <article className="group relative overflow-hidden rounded-lg border border-[#E5E7EB] transition-all hover:border-[#C1121F]/30 hover:shadow-sm">
      <a href={item.href} className="block" aria-label={`Đọc bài: ${item.title}`}>
        <div className="relative overflow-hidden rounded-lg">
          <ImageWithFallback
            src={item.image}
            alt={item.title}
            className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="absolute left-2 top-2 rounded bg-[#C1121F] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Nổi bật
          </span>
        </div>
        <div className="p-3">
          <h4 className="text-sm font-semibold leading-snug text-[#111827] line-clamp-2">{item.title}</h4>
          <p className="mt-1 text-xs text-[#4B5563] line-clamp-3 leading-relaxed">{item.summary}</p>
        </div>
      </a>
    </article>
  );
}

export function SidebarListItem({ item }: { item: MappedItem }) {
  return (
    <li>
      <a
        href={item.href}
        className="flex gap-2 rounded-lg border border-transparent p-2 transition-all hover:border-[#C1121F]/20 hover:bg-[#F9FAFB]"
        aria-label={item.title}
      >
        <ImageWithFallback src={item.image} alt={item.title} className="h-12 w-16 shrink-0 rounded object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium leading-snug text-[#111827] line-clamp-2">{item.title}</p>
          <p className="mt-0.5 text-xs text-[#4B5563] line-clamp-1 leading-relaxed">{item.summary}</p>
        </div>
      </a>
    </li>
  );
}

export function SidebarSectionBanner({ banner }: { banner: SidebarBanner }) {
  const content = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={banner.image} alt={banner.alt ?? "Banner"} loading="lazy" className="h-20 w-full rounded-lg object-cover" />
  );

  if (banner.href) {
    return (
      <a href={banner.href} className="block transition-opacity hover:opacity-80" aria-label={banner.alt ?? "Banner"}>
        {content}
      </a>
    );
  }
  return <div>{content}</div>;
}

export function SidebarSection({ config, posts = [], isLoading = false, error }: SidebarSectionProps) {
  const { featured, list } = useMemo(() => transformSidebarData(config.items, posts), [config.items, posts]);

  if (isLoading) return <SidebarSectionSkeleton />;

  if (error) {
    return (
      <aside className="rounded-lg border border-[#E5E7EB] bg-white p-3 text-xs text-[#9B9B9B]">
        Không thể tải nội dung.
      </aside>
    );
  }

  const hasContent = featured !== null || list.length > 0;

  return (
    <aside className="h-fit rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm md:sticky md:top-4">
      {config.topBanner && (
        <div className="mb-3">
          <SidebarSectionBanner banner={config.topBanner} />
        </div>
      )}

      <h3 className="mb-3 border-b border-[#E5E7EB] pb-2 text-sm font-semibold uppercase tracking-wide text-[#C1121F]">
        {config.title}
      </h3>

      {!hasContent ? (
        <SidebarSectionEmpty />
      ) : (
        <div className="space-y-0">
          {featured && (
            <div className="mb-3">
              <SidebarFeaturedCard item={featured} />
            </div>
          )}
          {featured && list.length > 0 && <div className="mb-3 border-t border-[#E5E7EB] pt-3" />}
          {list.length > 0 && (
            <ul className="space-y-1" role="list">
              {list.map((item) => (
                <SidebarListItem key={item.itemId} item={item} />
              ))}
            </ul>
          )}
        </div>
      )}

      {config.bottomBanner && (
        <div className="mt-3 border-t border-[#E5E7EB] pt-3">
          <SidebarSectionBanner banner={config.bottomBanner} />
        </div>
      )}
    </aside>
  );
}
