import "highlight.js/styles/github.css";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

export function MarkdownBox({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md overflow-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ node, children, ...props }) => {
            return <CodeBlock {...props}>{children}</CodeBlock>;
          },
          code({ className, children, ...props }) {
            // if (inline) {
            //   return (
            //     <code className={className} {...props}>
            //       {children}
            //     </code>
            //   );
            // }
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
