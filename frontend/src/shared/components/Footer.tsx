type FooterProps = {
  logo?: string;
  title?: string;
  descriptionLines?: string[];
  quickLinks?: Array<{ label: string; href: string }>;
  contactLines?: string[];
  copyright?: string;
};

const Footer = ({
  logo,
  title = "ĐOÀN CÔNG BINH THĂNG LONG",
  descriptionLines = ["Phát huy truyền thống ''MỞ ĐƯỜNG THẮNG LỢI''"],
  quickLinks = [
    { label: "Trang chủ", href: "/" },
    { label: "Giới thiệu", href: "/gioi-thieu" },
    { label: "Tin tức", href: "/hoat-dong-don-vi/huan-luyen" },
    { label: "Thư viện", href: "/thu-vien/tu-lieu-truyen-thong-giao-duc" },
  ],
  contactLines = ["Đoàn công binh Thăng Long", "Quân khu / Bộ Quốc phòng", "Email: doancongbinhthanglong.bccb@gmail.com"],
  copyright = "© 2026 Đoàn công binh Thăng Long - Quân đội nhân dân Việt Nam. Bản quyền thuộc về Đoàn công binh Thăng Long.",
}: FooterProps) => {
  return (
    <footer className="mt-10 bg-olive text-accent-foreground">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.25fr_1fr_1fr] md:gap-10 lg:gap-14">
          <div>
            <div className="flex items-center gap-3">
              {logo && <img src={logo} alt="logo" className="h-14 w-14 shrink-0 object-contain md:h-16 md:w-16" />}
              <h2 className="text-xl md:text-2xl font-bold uppercase leading-tight tracking-wide text-gold">{title}</h2>
            </div>
            <div className="mt-4 space-y-1 text-base md:text-lg leading-relaxed text-accent-foreground/85">
              {descriptionLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-accent-foreground">Liên kết</h3>
            <ul className="mt-4 space-y-1.5 text-base md:text-lg leading-relaxed text-accent-foreground/85">
              {quickLinks.map((item) => (
                <li key={`${item.label}-${item.href}`}>
                  <a href={item.href} className="hover:text-gold transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-accent-foreground">Liên hệ</h3>
            <div className="mt-4 space-y-1.5 text-base md:text-lg leading-relaxed text-accent-foreground/85">
              {contactLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-accent-foreground/20 pt-4 text-center text-xs md:text-sm text-accent-foreground/70">
          {copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
