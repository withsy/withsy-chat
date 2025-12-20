// pages/guides/index.tsx
import fs from "fs";
import matter from "gray-matter";
import { Bookmark, CircleHelp, Sparkles, TableProperties } from "lucide-react";
import Link from "next/link";
import path from "path";

type Guide = {
  title: string;
  description?: string;
  slug: string[];
};

type GuideCategory = {
  name: string;
  guides: Guide[];
};

function Page({ categories }: { categories: GuideCategory[] }) {
  const getIconForCategory = (name: string) => {
    switch (name.toLowerCase()) {
      case "prompts":
        return <TableProperties className="mr-3 h-5 w-5 text-[#EA9257]" />;
      case "saved":
        return <Bookmark className="mr-3 h-5 w-5 text-[#EA9257]" />;
      case "customization":
        return <Sparkles className="mr-3 h-5 w-5 text-[#EA9257]" />;
      case "general":
        return <CircleHelp className="mr-3 h-5 w-5 text-[#EA9257]" />;
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
    <div className="mx-auto flex max-w-3xl flex-col items-start px-6 py-12 text-start">
      <h2 className="mb-4 text-3xl font-bold">User Guides</h2>
      <p className="mb-6 text-base leading-relaxed">
        Discover all you need to master, personalize, and optimize your AI chat
        experience.
      </p>

      <div className="space-y-12 py-4">
        {categories.map((category) => (
          <div key={category.name}>
            <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-800">
              {getIconForCategory(category.name)}
              {capitalize(category.name)}
            </h2>
            <ul className="space-y-2">
              {category.guides.map((guide) => (
                <li key={guide.slug.join("/")}>
                  <Link
                    href={`/guides/${guide.slug.join("/")}`}
                    className="text-lg text-[rgb(40,90,128)] hover:underline"
                  >
                    {guide.title}
                  </Link>
                  {guide.description && (
                    <p className="text-sm text-gray-500">{guide.description}</p>
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

(Page as any).layoutType = "home";
export default Page;
