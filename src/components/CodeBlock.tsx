import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function extractTextFromElement(node: any): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractTextFromElement).join("");
  if (node?.props?.children) return extractTextFromElement(node.props.children);
  return "";
}

type CodeBlockProps = {
  children: React.ReactNode;
  className?: string;
};

export function CodeBlock({ children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const codeElement = Array.isArray(children) ? children[0] : children;
  const className = (codeElement as any)?.props?.className ?? "";
  const language = className.match(/language-(\w+)/)?.[1];

  const rawCode = extractTextFromElement(codeElement);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rawCode.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);

    toast.success("Copied!", {
      description: "Code copied to clipboard.",
    });
  };

  return (
    <div className="relative rounded-md border bg-gray-100 mt-4 mb-4">
      <div className="flex justify-between items-center px-3 py-2 bg-gray-200 text-muted-foreground">
        <span className="capitalize font-medium select-none text-sm">
          {language || "code"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-auto px-1 py-0 text-muted-foreground hover:bg-gray-200"
        >
          <Copy className="w-4 h-4" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      <pre
        className={clsx("overflow-x-auto max-w-full px-4 py-3", className)}
        {...props}
      >
        <code className="break-words">
          {(codeElement as any)?.props?.children}
        </code>
      </pre>
    </div>
  );
}
