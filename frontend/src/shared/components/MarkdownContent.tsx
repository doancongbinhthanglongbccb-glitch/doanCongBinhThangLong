import ReactMarkdown from "react-markdown";

type MarkdownContentProps = {
  value: string;
  className?: string;
};

const MarkdownContent = ({ value, className }: MarkdownContentProps) => (
  <div className={className ?? ""}>
    <ReactMarkdown
      components={{
        img: ({ node: _node, ...props }) => (
          <img
            {...props}
            alt={props.alt ?? "image"}
            className="my-3 max-h-96 w-auto rounded border border-slate-200 object-contain"
            loading="lazy"
          />
        ),
        a: ({ node: _node, ...props }) => (
          <a {...props} target="_blank" rel="noreferrer" className="text-blue-700 underline" />
        ),
      }}
    >
      {value || ""}
    </ReactMarkdown>
  </div>
);

export default MarkdownContent;
