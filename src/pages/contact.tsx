import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ name: "", message: "" });
  const email = "withsy.team@gmail.com";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Note: Form submission is disabled due to sandbox restrictions.
    // In a production environment, this would send the form data to a backend.
    alert("Form submission is a demo. Please email us directly at " + email);
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

      {/* Contact Form */}
      <div className="border rounded-lg p-6 w-full mb-6">
        <h3 className="text-xl font-semibold mb-2">Send a Message</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your name"
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Your message"
              rows={4}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          <Button
            type="submit"
            className="bg-[rgb(40,90,128)] text-white px-4 py-2 rounded hover:bg-black"
          >
            Send Message
          </Button>
        </form>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        We aim to respond within 2–3 business days. Your privacy is important to
        us, and we won’t share your details.
      </p>
    </div>
  );
}
