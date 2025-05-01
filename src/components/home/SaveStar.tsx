import Image from "next/image";

export default function SaveStar() {
  return (
    <section className="py-16 px-4 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-12">
        {/* 제목과 설명 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Save What Matters</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether it’s a key message or an entire chat, Withsy helps you keep
            track of what’s important.
          </p>
        </div>

        <Image
          src="/home/save-itmes.gif"
          alt="Saved Items"
          width={720}
          height={400}
          className="rounded-xl shadow-md"
        />
        {/* 기능 요약 리스트 */}
        <ul className="list-disc list-inside text-muted-foreground text-base max-w-2xl mx-auto space-y-2">
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
