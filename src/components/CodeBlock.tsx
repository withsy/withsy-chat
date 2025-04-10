import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

function extractTextFromElement(node: any): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractTextFromElement).join("");
  if (node?.props?.children) return extractTextFromElement(node.props.children);
  return "";
}

type Props = {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function CodeBlock({
  inline,
  className = "",
  children,
  ...props
}: Props) {
  const [copied, setCopied] = useState(false);
  const rawCode = extractTextFromElement(children);

  const language = className?.match(/language-(\w+)/)?.[1];

  const handleCopy = async () => {
    console.log(rawCode);
    await navigator.clipboard.writeText(rawCode.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="relative rounded-md overflow-hidden border">
      <div className="flex justify-between items-center px-3 py-2 text-xs bg-gray-200 text-muted-foreground">
        <span className="capitalize font-medium select-none">
          {language || "code"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-auto px-1 py-0 text-xs text-muted-foreground hover:bg-gray-200"
        >
          <Copy className="w-4 h-4" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      <pre className={clsx("overflow-x-auto px-4 py-0", className)} {...props}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
