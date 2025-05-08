import Link from "next/link";

export default function DPAPage() {
  return (
    <div className="flex flex-col items-start text-start px-6 py-12 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">
        Data Processing Agreements (DPA)
      </h2>
      <p className="text-base leading-relaxed mb-6">
        We rely on trusted third-party data processors to ensure secure and
        compliant handling of personal data. Each provider listed below has a
        Data Processing Agreement (DPA) in place, incorporating Standard
        Contractual Clauses (SCCs) where applicable, to comply with data
        protection laws, including GDPR and UK GDPR.
      </p>

      {/* Third-Party Processors */}
      <div className="border rounded-lg p-6 w-full mb-6">
        <h3 className="text-xl font-semibold mb-4">
          Our Third-Party Data Processors
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <Link
              href="https://cloud.google.com/terms/data-processing-addendum"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[rgb(40,90,128)] font-medium hover:underline"
            >
              Google Cloud (including Gemini)
            </Link>
          </li>
          <li>
            <Link
              href="https://aws.amazon.com/legal/data-processing-addendum/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[rgb(40,90,128)] font-medium hover:underline"
            >
              Amazon Web Services (AWS)
            </Link>
          </li>
          <li>
            <Link
              href="https://x.ai/legal/data-processing-addendum"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[rgb(40,90,128)] font-medium hover:underline"
            >
              xAI (Grok)
            </Link>
          </li>
        </ul>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        These agreements ensure that your personal data is processed securely
        and in compliance with applicable data protection regulations.
      </p>
    </div>
  );
}
