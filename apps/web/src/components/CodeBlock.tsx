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
    <div className="relative mt-4 mb-4 rounded-md border bg-gray-100">
      <div className="text-muted-foreground flex items-center justify-between bg-gray-200 px-3 py-2">
        <span className="text-sm font-medium capitalize select-none">
          {language || "code"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-muted-foreground h-auto px-1 py-0 hover:bg-gray-200 active:bg-gray-200"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      <pre
        className={clsx("max-w-full overflow-x-auto px-4 py-3", className)}
        {...props}
      >
        <code className="break-all">
          {(codeElement as any)?.props?.children}
        </code>
      </pre>
    </div>
  );
}
