import { Badge } from "@/components/ui/badge";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";

function Page() {
  const getIconForRelease = (name: string) => {
    switch (name.toLowerCase()) {
      case "clear. yours.":
        return <Sparkles className="mr-3 h-5 w-5 text-[#EA9257]" />;
      case "search":
        return <Search className="mr-3 h-5 w-5 text-[#EA9257]" />;
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
    <div className="mx-auto flex max-w-3xl flex-col items-start px-6 py-12 text-start">
      <h2 className="mb-4 text-3xl font-bold">Roadmap</h2>
      <p className="mb-6 text-base leading-relaxed">
        Explore our upcoming releases and the exciting features we’re building
        to enhance your AI chat experience.
      </p>

      <div className="space-y-16 py-8">
        {releases.map((release) => (
          <div key={release.name}>
            <h2 className="mb-2 flex items-center text-2xl font-semibold text-gray-800">
              {getIconForRelease(release.name)}
              {capitalize(release.tagline)}
              <Badge
                className={`ml-3 font-semibold text-white ${
                  release.status === "Upcoming" ? "bg-[#EA9257]" : "bg-gray-500"
                }`}
                aria-label={`Status: ${release.status}`}
              >
                {release.status}
              </Badge>
            </h2>
            {release.releaseDate && (
              <p className="mb-2 text-sm text-gray-600">
                Released in {release.releaseDate}
              </p>
            )}
            <p className="mb-4 text-base text-gray-800">
              {release.description}
            </p>
            <ul className="space-y-4">
              {release.features.map((feature) =>
                typeof feature === "string" ? (
                  <li key={feature} className="flex items-center">
                    <span className="mr-2 text-[#EA9257]">•</span>
                    <span className="text-lg text-black">{feature}</span>
                  </li>
                ) : (
                  <li key={feature.name} className="flex flex-col">
                    <div className="flex items-center">
                      <span className="mr-2 text-[#EA9257]">•</span>
                      <span className="text-lg text-black">{feature.name}</span>
                    </div>
                    <div className="ml-6 space-y-2">
                      {feature.links.map((link) => (
                        <div key={link} className="flex items-center">
                          <span className="mr-2 text-[#EA9257]">•</span>
                          <Link
                            href={link}
                            className="text-md mr-2 text-[#285A80] hover:underline"
                          >
                            {link.split("/").pop()?.replace(/-/g, " ")}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

(Page as any).layoutType = "home";
export default Page;
