import Link from "next/link";

const guides = [
  {
    title: "Chat Theme Customization Guide",
    description: "Learn how to change the theme of your chat interface.",
    href: "/guides/chat-theme",
  },
  {
    title: "AI Model Profile Customization Guide",
    description: "Set custom names and profile images for your AI models.",
    href: "/guides/customize-profile",
  },
];

export default function GuidesIndexPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
        Guides
      </h1>

      <ul className="space-y-8">
        {guides.map((guide) => (
          <li
            key={guide.href}
            className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-all"
          >
            <Link href={guide.href} className="block">
              <h2 className="text-xl font-semibold text-[rgb(40,90,128)] mb-2">
                {guide.title}
              </h2>
              <p className="text-gray-600">{guide.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
