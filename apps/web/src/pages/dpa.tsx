import Link from "next/link";

function Page() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start px-6 py-12 text-start">
      <h2 className="mb-4 text-3xl font-bold">
        Data Processing Agreements (DPA)
      </h2>
      <p className="mb-6 text-base leading-relaxed">
        We rely on trusted third-party data processors to ensure secure and
        compliant handling of personal data. Each provider listed below has a
        Data Processing Agreement (DPA) in place, incorporating Standard
        Contractual Clauses (SCCs) where applicable, to comply with data
        protection laws, including GDPR and UK GDPR.
      </p>

      {/* Third-Party Processors */}
      <div className="mb-6 w-full rounded-lg border p-6">
        <h3 className="mb-4 text-xl font-semibold">
          Our Third-Party Data Processors
        </h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link
              href="https://cloud.google.com/terms/data-processing-addendum"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[rgb(40,90,128)] hover:underline"
            >
              Google Cloud (including Gemini)
            </Link>
          </li>
          <li>
            <Link
              href="https://aws.amazon.com/legal/data-processing-addendum/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[rgb(40,90,128)] hover:underline"
            >
              Amazon Web Services (AWS)
            </Link>
          </li>
          <li>
            <Link
              href="https://x.ai/legal/data-processing-addendum"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[rgb(40,90,128)] hover:underline"
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

(Page as any).layoutType = "home";
export default Page;
