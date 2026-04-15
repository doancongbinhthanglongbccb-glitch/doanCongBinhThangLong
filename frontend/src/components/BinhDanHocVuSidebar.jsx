import { Link } from "react-router-dom";

const resolvePostLink = (item) => {
  const raw = (item?.link || "").trim();
  if (raw && raw !== "/binh-dan-hoc-vu-so") {
    return raw;
  }
  return `/binh-dan-hoc-vu-so/${item.id}`;
};

const BinhDanHocVuSidebar = ({ items = [], topImage, bottomImage, stickyClassName = "" }) => {
  const featured = items[0];
  const listItems = featured ? items.slice(1) : items;

  return (
    <aside id="binh-dan-hoc-vu-so" className={`space-y-2 ${stickyClassName}`.trim()}>
      {topImage && (
        <img
          src={topImage}
          alt="Ảnh minh họa Bình dân học vụ số phía trên"
          className="w-full h-auto object-contain border border-slate-200 bg-slate-50 p-1"
        />
      )}

      <div className="border border-slate-200 bg-white">
        <div className="bg-primary px-4 py-3 text-white font-bold uppercase text-lg">Bình dân học vụ số</div>

        {featured && (
          <Link to={resolvePostLink(featured)} className="group block p-3 border-b border-slate-200">
            <div className="border border-slate-200 bg-slate-100 p-1">
              <img
                src={featured.image || topImage}
                alt={featured.title}
                className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
            <h4 className="mt-3 text-lg font-bold text-slate-900 leading-snug line-clamp-3">{featured.title}</h4>
          </Link>
        )}

        <ul>
          {listItems.map((item) => (
            <li key={item.id} className="border-t border-slate-200 first:border-t-0">
              <Link to={resolvePostLink(item)} className="group flex gap-3 p-3 hover:bg-slate-100">
                <div className="w-36 shrink-0 border border-slate-200 bg-slate-100 p-1">
                  <img
                    src={item.image || topImage}
                    alt={item.title}
                    className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xl font-semibold leading-tight text-slate-900 line-clamp-3">{item.title}</h5>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 line-clamp-3">
                    {item.summary || "Tóm tắt nội dung chuyên mục."}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {bottomImage && (
        <img
          src={bottomImage}
          alt="Ảnh minh họa Bình dân học vụ số phía dưới"
          className="w-full h-auto object-contain border border-slate-200 bg-slate-50 p-1"
        />
      )}
    </aside>
  );
};

export default BinhDanHocVuSidebar;
