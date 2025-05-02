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
    <div className="flex flex-col items-start text-start px-6 py-12 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Contact the Withsy Team</h2>
      <p className="text-base leading-relaxed mb-6">
        We’re here to help you get the most out of Withsy! Whether it’s a
        feature request, bug report, or just a question, reach out anytime.
      </p>

      {/* Email Contact */}
      <div className="border rounded-lg p-6 w-full mb-6">
        <h3 className="text-xl font-semibold mb-2">Email Us</h3>
        <div className="flex items-center gap-2">
          <a
            href={`mailto:${email}`}
            className="text-[rgb(40,90,128)] font-medium hover:underline"
          >
            {email}
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            aria-label={copied ? "Email copied" : "Copy email address"}
            className="w-6 h-6 text-muted-foreground"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        We aim to respond within 2–3 business days. Your privacy is important to
        us, and we won’t share your details.
      </p>
    </div>
  );
}
