import HomeLayout from "@/components/layout/HomeLayout";
import fs from "fs";
import matter from "gray-matter";
import { ChevronLeft } from "lucide-react";
import type { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import Link from "next/link";
import path from "path";

type Props = {
  source: MDXRemoteSerializeResult;
  frontMatter: {
    title: string;
    description?: string;
  };
  related: { slug: string[]; title: string }[];
};

export default function Page({ source, frontMatter, related }: Props) {
  return (
    <HomeLayout>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link
          href="/guides"
          className="text-muted-foreground mb-6 inline-flex items-center text-sm hover:underline"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Guides
        </Link>

        <h1 className="mb-4 text-3xl font-bold">{frontMatter.title}</h1>
        {frontMatter.description && (
          <p className="text-muted-foreground mb-8">
            {frontMatter.description}
          </p>
        )}

        <article className="prose prose-neutral dark:prose-invert">
          <MDXRemote {...source} />
        </article>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-4 text-2xl font-semibold">Related Guides</h2>
            <ul className="list-inside list-disc space-y-2">
              {related.map((r) => (
                <li key={r.slug.join("/")}>
                  <Link
                    href={`/guides/${r.slug.join("/")}`}
                    className="text-[rgb(40,90,128)] hover:underline"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-12">
          <Link
            href="/guides"
            className="text-muted-foreground inline-flex items-center text-sm hover:underline"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Guides
          </Link>
        </div>
      </div>
    </HomeLayout>
  );
}

// MDX 파일 경로 가져오는 헬퍼
function getGuideFile(slugArray: string[]) {
  const mdxPath =
    path.join(process.cwd(), "src/content/guides", ...slugArray) + ".mdx";
  return mdxPath;
}

// 모든 가능한 경로 정의
export const getStaticPaths: GetStaticPaths = async () => {
  const baseDir = path.join(process.cwd(), "src/content/guides");
  const paths: string[][] = [];

  const walk = (dir: string, parentSlugs: string[] = []) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), [...parentSlugs, entry.name]);
      } else if (entry.name.endsWith(".mdx")) {
        const name = entry.name.replace(/\.mdx$/, "");
        paths.push([...parentSlugs, name]);
      }
    }
  };

  walk(baseDir);

  return {
    paths: paths.map((slugParts) => ({
      params: { slug: slugParts },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string[];
  const mdxPath = getGuideFile(slug);

  const fileContent = fs.readFileSync(mdxPath, "utf-8");
  const { content, data } = matter(fileContent);
  const mdxSource = await serialize(content);

  // 같은 디렉토리 내 다른 .mdx 파일 찾기
  const dir = path.join(
    process.cwd(),
    "src/content/guides",
    ...slug.slice(0, -1),
  );
  const allFiles = fs.readdirSync(dir);
  const related: { slug: string[]; title: string }[] = [];

  for (const file of allFiles) {
    if (
      file.endsWith(".mdx") &&
      file.replace(".mdx", "") !== slug[slug.length - 1]
    ) {
      const filePath = path.join(dir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);
      related.push({
        slug: [...slug.slice(0, -1), file.replace(".mdx", "")],
        title: data.title || file.replace(".mdx", ""),
      });
    }
  }

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
      related: related,
    },
  };
};
