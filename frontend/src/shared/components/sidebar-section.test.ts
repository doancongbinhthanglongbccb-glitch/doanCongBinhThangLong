import { transformSidebarData, type SidebarItem, type Post } from "./sidebar-section";

const makePost = (id: string, overrides: Partial<Post> = {}): Post => ({
  id,
  title: `Bài viết ${id}`,
  summary: "Mô tả mặc định",
  thumbnail: `https://example.com/${id}.jpg`,
  published: true,
  ...overrides,
});

const makeItem = (itemId: string, postId: string, order: number, overrides: Partial<SidebarItem> = {}): SidebarItem => ({
  itemId,
  postId,
  order,
  visible: true,
  ...overrides,
});

describe("transformSidebarData", () => {
  describe("pinned / ordering", () => {
    it("uses first pinned item as featured", () => {
      const items: SidebarItem[] = [
        makeItem("a", "p1", 2),
        makeItem("b", "p2", 1, { pinned: true }),
        makeItem("c", "p3", 3),
      ];
      const posts: Post[] = [makePost("p1"), makePost("p2"), makePost("p3")];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.postId).toBe("p2");
      expect(result.list).toHaveLength(2);
      expect(result.list.map((i) => i.postId)).toEqual(["p1", "p3"]);
    });

    it("falls back to first item when no pinned", () => {
      const items: SidebarItem[] = [
        makeItem("a", "p1", 2),
        makeItem("b", "p2", 1),
        makeItem("c", "p3", 3),
      ];
      const posts: Post[] = [makePost("p1"), makePost("p2"), makePost("p3")];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.postId).toBe("p2");
      expect(result.list.map((i) => i.postId)).toEqual(["p1", "p3"]);
    });

    it("sorts by order ASC", () => {
      const items: SidebarItem[] = [
        makeItem("c", "p3", 3),
        makeItem("a", "p1", 1),
        makeItem("b", "p2", 2),
      ];
      const posts = [makePost("p1"), makePost("p2"), makePost("p3")];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.postId).toBe("p1");
      expect(result.list.map((i) => i.postId)).toEqual(["p2", "p3"]);
    });

    it("handles single item — list is empty", () => {
      const items: SidebarItem[] = [makeItem("a", "p1", 1)];
      const posts = [makePost("p1")];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.postId).toBe("p1");
      expect(result.list).toHaveLength(0);
    });
  });

  describe("fallback", () => {
    it("uses overrideTitle when provided", () => {
      const items: SidebarItem[] = [makeItem("a", "p1", 1, { overrideTitle: "Tiêu đề tùy chỉnh" })];
      const posts = [makePost("p1", { title: "Bài viết gốc" })];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.title).toBe("Tiêu đề tùy chỉnh");
    });

    it("uses overrideSummary when provided", () => {
      const items: SidebarItem[] = [makeItem("a", "p1", 1, { overrideSummary: "Tóm tắt tùy chỉnh" })];
      const posts = [makePost("p1", { summary: "Mô tả gốc" })];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.summary).toBe("Tóm tắt tùy chỉnh");
    });

    it("uses overrideImage when provided", () => {
      const items: SidebarItem[] = [makeItem("a", "p1", 1, { overrideImage: "https://custom.com/img.jpg" })];
      const posts = [makePost("p1", { thumbnail: "https://original.com/img.jpg" })];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.image).toBe("https://custom.com/img.jpg");
    });

    it("falls back to 'Không có mô tả' when summary missing", () => {
      const items: SidebarItem[] = [makeItem("a", "p1", 1)];
      const posts = [makePost("p1", { summary: undefined })];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.summary).toBe("Không có mô tả");
    });

    it("falls back to picsum when thumbnail missing", () => {
      const items: SidebarItem[] = [makeItem("a", "p1", 1)];
      const posts = [makePost("p1", { thumbnail: undefined })];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.image).toContain("picsum.photos");
      expect(result.featured?.image).toContain("p1");
    });

    it("overrideTitle empty string falls back to post title", () => {
      const items: SidebarItem[] = [makeItem("a", "p1", 1, { overrideTitle: "" })];
      const posts = [makePost("p1", { title: "Bài gốc" })];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.title).toBe("Bài gốc");
    });
  });

  describe("invalid item filtering", () => {
    it("skips items where postId not found", () => {
      const items: SidebarItem[] = [
        makeItem("a", "p1", 1),
        makeItem("b", "p-nonexistent", 2),
        makeItem("c", "p3", 3),
      ];
      const posts = [makePost("p1"), makePost("p3")];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.postId).toBe("p1");
      expect(result.list).toHaveLength(1);
      expect(result.list[0].postId).toBe("p3");
    });

    it("skips items where visible is false", () => {
      const items: SidebarItem[] = [
        makeItem("a", "p1", 1, { visible: false }),
        makeItem("b", "p2", 2),
        makeItem("c", "p3", 3),
      ];
      const posts = [makePost("p1"), makePost("p2"), makePost("p3")];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.postId).toBe("p2");
      expect(result.list.map((i) => i.postId)).toEqual(["p3"]);
    });

    it("skips items where post.published is false", () => {
      const items: SidebarItem[] = [makeItem("a", "p1", 1), makeItem("b", "p2", 2)];
      const posts = [makePost("p1"), makePost("p2", { published: false })];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.postId).toBe("p1");
      expect(result.list).toHaveLength(0);
    });

    it("returns empty featured and list when no valid items", () => {
      const items: SidebarItem[] = [
        makeItem("a", "p-nonexistent", 1),
        makeItem("b", "p2", 2, { visible: false }),
      ];
      const posts: Post[] = [];

      const result = transformSidebarData(items, posts);

      expect(result.featured).toBeNull();
      expect(result.list).toHaveLength(0);
    });
  });

  describe("href generation", () => {
    it("generates /bai-viet/{slug} when slug exists", () => {
      const items: SidebarItem[] = [makeItem("a", "p1", 1)];
      const posts = [makePost("p1", { slug: "bai-viet-so-1" })];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.href).toBe("/bai-viet/bai-viet-so-1");
      expect(result.featured?.slug).toBe("bai-viet-so-1");
    });

    it("falls back to /# when slug missing", () => {
      const items: SidebarItem[] = [makeItem("a", "p1", 1)];
      const posts = [makePost("p1", { slug: undefined })];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.href).toBe("/#");
      expect(result.featured?.slug).toBeUndefined();
    });
  });

  describe("override precedence", () => {
    it("overrideTitle takes precedence over post.title", () => {
      const items: SidebarItem[] = [
        makeItem("a", "p1", 1, {
          overrideTitle: "Override",
          overrideSummary: "Override summary",
          overrideImage: "https://override.com/img.jpg",
        }),
      ];
      const posts = [makePost("p1", { title: "Original", summary: "Original summary" })];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.title).toBe("Override");
      expect(result.featured?.summary).toBe("Override summary");
      expect(result.featured?.image).toBe("https://override.com/img.jpg");
    });

    it("overrideSummary empty string falls back to post.summary", () => {
      const items: SidebarItem[] = [makeItem("a", "p1", 1, { overrideSummary: "" })];
      const posts = [makePost("p1", { summary: "Original summary" })];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.summary).toBe("Original summary");
    });

    it("overrideImage empty string falls back to post.thumbnail", () => {
      const items: SidebarItem[] = [makeItem("a", "p1", 1, { overrideImage: "" })];
      const posts = [makePost("p1", { thumbnail: "https://original.com/img.jpg" })];

      const result = transformSidebarData(items, posts);

      expect(result.featured?.image).toBe("https://original.com/img.jpg");
    });
  });
});
