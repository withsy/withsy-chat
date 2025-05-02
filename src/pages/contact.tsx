import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const email = "withsy.team@gmail.com";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-start text-start px-6 py-12 max-w-2xl mx-auto select-none">
      <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
      <p className="text-base leading-relaxed mb-4">
        We&apos;d love to hear from you! <br />
        Whether it’s a feature request, bug report, or just a curious question —{" "}
        <br />
        feel free to reach out anytime.
      </p>

      <div className="flex items-start gap-2">
        <a
          href={`mailto:${email}`}
          className="text-[rgb(40,90,128)] font-medium underline underline-offset-2"
        >
          {email}
        </a>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="w-6 h-6 text-muted-foreground"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        We typically respond within 2–3 business days.
      </p>
    </div>
  );
}
