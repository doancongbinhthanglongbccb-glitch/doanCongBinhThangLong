type HeaderProps = {
  logo: string;
  logoAlt: string;
  title: string;
  subtitle: string;
};

const Header = ({ logo, logoAlt, title, subtitle }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border">
      <div className="w-full max-w-[1600px] mx-auto px-3 flex items-center gap-4 py-3">
        <img src={logo} alt={logoAlt} className="w-16 h-16 object-contain" />
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-primary uppercase leading-tight tracking-wide">
            {title}
          </h1>
          <p className="text-sm text-gold font-semibold uppercase tracking-widest">
            {subtitle}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
