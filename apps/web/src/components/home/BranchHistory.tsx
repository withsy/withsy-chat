// components/landing/BranchHistorySection.tsx
import Image from "next/image";

export default function BranchHistory() {
  return (
    <section className="bg-white px-4 py-16 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12">
        {/* 제목과 설명 */}
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold">Branch Out Your Thoughts</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Conversations don’t have to be linear. Withsy lets you branch from
            any message and explore multiple paths — just like Git.
          </p>
        </div>

        <div className="text-center">
          <Image
            unoptimized
            src="/home/branch-history.webp"
            alt="Branch History"
            width={720}
            height={400}
            className="rounded-xl shadow-md"
            placeholder="blur"
            blurDataURL="/home/branch-history.jpg"
          />
          <p className="text-muted-foreground mt-2 text-sm">
            Explore and branch conversations seamlessly
          </p>
        </div>
      </div>
    </section>
  );
}
