import "highlight.js/styles/github.css";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

export function MarkdownBox({ content }: { content: string | null }) {
  console.log(JSON.stringify(content));
  return (
    <div className="prose prose-sm dark:prose-invert break-words max-w-full overflow-x-auto [&_li>p]:inline [&_li>p]:m-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ children, ...props }) => {
            const existingClassName = props.className || "";
            return (
              <CodeBlock
                {...props}
                className={`${existingClassName} whitespace-pre-wrap break-all px-4`}
              >
                {children}
              </CodeBlock>
            );
          },
          code: ({ children }) => {
            return <>{children}</>;
          },
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table {...props} className="table-fixed w-full">
                {children}
              </table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
