import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButtonWithTooltip } from "./IconButtonWithTooltip";

function CodeBlock({ node, inline, className, children, ...props }: any) {
  const [copied, setCopied] = useState(false);

  const rawCode =
    typeof children === "string"
      ? children
      : Array.isArray(children)
      ? children.filter((c) => typeof c === "string").join("")
      : "";

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rawCode.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group">
      <Button
        size="icon"
        variant="ghost"
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ClipboardCopy className="w-4 h-4" />
      </Button>

      <pre className={className} {...props}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function MarkdownBox({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md overflow-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: CodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
