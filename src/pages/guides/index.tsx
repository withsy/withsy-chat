// pages/guides/index.tsx
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { Bookmark, CircleHelp, Sparkles, TableProperties } from "lucide-react";

type Guide = {
  title: string;
  description?: string;
  slug: string[];
};

type GuideCategory = {
  name: string;
  guides: Guide[];
};

export default function GuidesIndexPage({
  categories,
}: {
  categories: GuideCategory[];
}) {
  const getIconForCategory = (name: string) => {
    switch (name.toLowerCase()) {
      case "prompts":
        return <TableProperties className="w-5 h-5 text-[#EA9257] mr-3" />;
      case "saved":
        return <Bookmark className="w-5 h-5 text-[#EA9257] mr-3" />;
      case "customization":
        return <Sparkles className="w-5 h-5 text-[#EA9257] mr-3" />;
      case "general":
        return <CircleHelp className="w-5 h-5 text-[#EA9257] mr-3" />;
      default:
        return null;
    }
  };
  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  categories.sort((a, b) => {
    if (a.name.toLowerCase() === "general") return 1;
    if (b.name.toLowerCase() === "general") return -1;
    return 0;
  });
  return (
    <div className="flex flex-col items-start text-start px-6 py-12 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">User Guides</h2>
      <p className="text-base leading-relaxed mb-6">
        Discover all you need to master, personalize, and optimize your AI chat
        experience.
      </p>

      <div className="space-y-12 py-4">
        {categories.map((category) => (
          <div key={category.name}>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              {getIconForCategory(category.name)}
              {capitalize(category.name)}
            </h2>
            <ul className="space-y-2">
              {category.guides.map((guide) => (
                <li key={guide.slug.join("/")}>
                  <Link
                    href={`/guides/${guide.slug.join("/")}`}
                    className="text-[rgb(40,90,128)] hover:underline text-lg"
                  >
                    {guide.title}
                  </Link>
                  {guide.description && (
                    <p className="text-gray-500 text-sm">{guide.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const baseDir = path.join(process.cwd(), "src/content/guides");
  const categories: GuideCategory[] = [];

  const walk = (dir: string, parentSlugs: string[] = []) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), [...parentSlugs, entry.name]);
      } else if (entry.name.endsWith(".mdx")) {
        const fullPath = path.join(dir, entry.name);
        const fileContent = fs.readFileSync(fullPath, "utf-8");
        const { data } = matter(fileContent);
        const slug = [...parentSlugs, entry.name.replace(/\.mdx$/, "")];

        const categoryName = parentSlugs[0] ?? "Uncategorized";
        const category = categories.find((c) => c.name === categoryName);
        const guide: Guide = {
          title: data.title ?? slug.join(" / "),
          description: data.description ?? "",
          slug,
        };

        if (category) {
          category.guides.push(guide);
        } else {
          categories.push({ name: categoryName, guides: [guide] });
        }
      }
    }
  };

  walk(baseDir);

  return {
    props: {
      categories,
    },
  };
}
