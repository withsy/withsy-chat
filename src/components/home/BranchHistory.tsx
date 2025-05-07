// components/landing/BranchHistorySection.tsx
import Image from "next/image";

export default function BranchHistory() {
  return (
    <section className="py-16 px-4 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-12">
        {/* 제목과 설명 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Branch Out Your Thoughts</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Conversations don’t have to be linear. Withsy lets you branch from
            any message and explore multiple paths — just like Git.
          </p>
        </div>

        {/* GIF 미디어 */}
        <div className="text-center">
          <Image
            src="/home/branch-history.gif"
            alt="Branch History"
            width={720}
            height={400}
            className="rounded-xl shadow-md"
            placeholder="blur"
            blurDataURL="/home/branch-history.jpg"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Explore and branch conversations seamlessly
          </p>
        </div>
      </div>
    </section>
  );
}
