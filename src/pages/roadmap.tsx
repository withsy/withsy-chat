import { Badge } from "@/components/ui/badge";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";

export default function RoadmapPage() {
  const getIconForRelease = (name: string) => {
    switch (name.toLowerCase()) {
      case "clear. yours.":
        return <Sparkles className="w-5 h-5 text-[#EA9257] mr-3" />;
      case "search":
        return <Search className="w-5 h-5 text-[#EA9257] mr-3" />;
      default:
        return null;
    }
  };

  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const releases = [
    {
      name: "Search",
      tagline: "Find. Fast.",
      status: "Upcoming",
      description:
        "Find answers faster with intuitive search across all your chats. Easily access and explore your chat history with powerful search capabilities.",
      features: [
        "In-chat search functionality",
        "Chat history search",
        "Quick access to past conversations",
      ],
    },
    {
      name: "Clear. Yours.",
      tagline: "Clear. Yours.",
      status: "Released",
      releaseDate: "Q2 2025",
      description:
        "Take full control of your AI experience with personalized themes and profile images. Apply your own prompts exclusively and save chats and messages effortlessly.",
      features: [
        {
          name: "Custom chat themes",
          links: ["/guides/customization/customize-chat-theme"],
        },
        {
          name: "Personalized profile images",
          links: ["/guides/customization/customize-profile"],
        },
        {
          name: "User-defined prompts",
          links: [
            "/guides/prompts/how-to-apply-prompts",
            "/guides/prompts/how-to-manage-prompts",
          ],
        },
        {
          name: "Chat and message saving",
          links: ["/guides/saved/how-to-use-saved-messages"],
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col items-start text-start px-6 py-12 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Roadmap</h2>
      <p className="text-base leading-relaxed mb-6">
        Explore our upcoming releases and the exciting features we’re building
        to enhance your AI chat experience.
      </p>

      <div className="space-y-16 py-8">
        {releases.map((release) => (
          <div key={release.name}>
            <h2 className="text-2xl font-semibold mb-2 text-gray-800 flex items-center">
              {getIconForRelease(release.name)}
              {capitalize(release.tagline)}
              <Badge
                className={`ml-3 text-white font-semibold ${
                  release.status === "Upcoming" ? "bg-[#EA9257]" : "bg-gray-500"
                }`}
                aria-label={`Status: ${release.status}`}
              >
                {release.status}
              </Badge>
            </h2>
            {release.releaseDate && (
              <p className="text-gray-600 text-sm mb-2">
                Released in {release.releaseDate}
              </p>
            )}
            <p className="text-gray-800 text-base mb-4">
              {release.description}
            </p>
            <ul className="space-y-4">
              {release.features.map((feature) =>
                typeof feature === "string" ? (
                  <li key={feature} className="flex items-center">
                    <span className="text-[#EA9257] mr-2">•</span>
                    <span className="text-black text-lg">{feature}</span>
                  </li>
                ) : (
                  <li key={feature.name} className="flex flex-col">
                    <div className="flex items-center">
                      <span className="text-[#EA9257] mr-2">•</span>
                      <span className="text-black text-lg">{feature.name}</span>
                    </div>
                    <div className="ml-6 space-y-2">
                      {feature.links.map((link) => (
                        <div key={link} className="flex items-center">
                          <span className="text-[#EA9257] mr-2">•</span>
                          <Link
                            href={link}
                            className="text-[#285A80] hover:underline text-md mr-2"
                          >
                            {link.split("/").pop()?.replace(/-/g, " ")}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
