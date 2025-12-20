import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

function Page() {
  const [copied, setCopied] = useState(false);
  const email = "withsy.team@gmail.com";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start px-6 py-12 text-start">
      <h2 className="mb-4 text-3xl font-bold">Contact the Withsy Team</h2>
      <p className="mb-6 text-base leading-relaxed">
        We’re here to help you get the most out of Withsy! Whether it’s a
        feature request, bug report, or just a question, reach out anytime.
      </p>

      {/* Email Contact */}
      <div className="mb-6 w-full rounded-lg border p-6">
        <h3 className="mb-2 text-xl font-semibold">Email Us</h3>
        <div className="flex items-center gap-2">
          <a
            href={`mailto:${email}`}
            className="font-medium text-[rgb(40,90,128)] hover:underline"
          >
            {email}
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            aria-label={copied ? "Email copied" : "Copy email address"}
            className="text-muted-foreground h-6 w-6"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
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

(Page as any).layoutType = "home";
export default Page;
