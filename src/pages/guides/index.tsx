// pages/guides/index.tsx
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

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
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-12 text-center text-gray-900">
        Help Guides
      </h1>

      <div className="space-y-12">
        {categories.map((category) => (
          <div key={category.name}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {category.name}
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
