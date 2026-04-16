type SectionTitleProps = {
  title: string;
  className?: string;
};

const SectionTitle = ({ title, className = "" }: SectionTitleProps) => {
  return <h3 className={`text-3xl md:text-[2rem] leading-[1.4] font-bold text-primary ${className}`.trim()}>{title}</h3>;
};

export default SectionTitle;
