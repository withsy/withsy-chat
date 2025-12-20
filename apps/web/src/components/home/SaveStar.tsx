import Image from "next/image";

export default function SaveStar() {
  return (
    <section className="bg-white px-4 py-16 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12">
        {/* 제목과 설명 */}
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold">Save What Matters</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Whether it’s a key message or an entire chat, Withsy helps you keep
            track of what’s important.
          </p>
        </div>

        <Image
          unoptimized
          src="/home/save-itmes.webp"
          alt="Saved Items"
          width={720}
          height={400}
          className="rounded-xl shadow-md"
          placeholder="blur"
          blurDataURL="/home/save-itmes.jpg"
        />
        {/* 기능 요약 리스트 */}
        <ul className="text-muted-foreground mx-auto max-w-2xl list-inside list-disc space-y-2 text-base">
          <li>
            <strong>Save Messages:</strong> Bookmark key messages and view them
            inside the chat
          </li>
          <li>
            <strong>Global Saved View:</strong> Access all saved messages across
            all chats in one place
          </li>
          <li>
            <strong>Star Chats:</strong> Mark entire conversations as important
            and find them quickly
          </li>
        </ul>
      </div>
    </section>
  );
}
