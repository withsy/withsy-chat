import "highlight.js/styles/github.css";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";
import { remarkRemoveParagraphInList } from "@/lib/remark-remove-li-paragraph";

export function MarkdownBox({ content }: { content: string | null }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-full overflow-x-auto break-all [&_li>p]:m-0 [&_li>p]:inline">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkRemoveParagraphInList]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          li: ({ children, ...props }) => {
            const filteredChildren = Array.isArray(children)
              ? children.filter(
                  (child) =>
                    !(typeof child === "string" && child.trim() === ""),
                )
              : children;

            return <li {...props}>{filteredChildren}</li>;
          },
          pre: ({ children, ...props }) => {
            const existingClassName = props.className || "";
            return (
              <CodeBlock
                {...props}
                className={`${existingClassName} px-4 break-all whitespace-pre-wrap`}
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
              <table {...props} className="w-full table-fixed">
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
