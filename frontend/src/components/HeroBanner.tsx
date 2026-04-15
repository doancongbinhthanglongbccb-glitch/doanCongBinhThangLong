type HeroBannerProps = {
  image: string;
  alt: string;
  title: string;
  subtitle: string;
};

const HeroBanner = ({ image, alt, title, subtitle }: HeroBannerProps) => {
  return (
    <section className="relative overflow-hidden">
      <img
        src={image}
        alt={alt}
        className="w-full h-48 md:h-72 lg:h-96 object-cover"
        width={1920}
        height={512}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent flex items-center">
        <div className="w-full max-w-[1600px] mx-auto px-3">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground drop-shadow-lg">
            {title}
          </h2>
          <p className="text-primary-foreground/95 text-lg md:text-2xl mt-3 drop-shadow max-w-4xl leading-snug">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
