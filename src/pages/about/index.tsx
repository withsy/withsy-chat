// app/about/page.tsx
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function Page() {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 px-6 py-12 max-w-4xl mx-auto select-none">
      {/* Avatar on the left */}
      <Avatar className="w-24 h-24 md:w-32 md:h-32 shrink-0">
        <AvatarImage src="/characters/sara.svg" alt="Withsy Sara" />
      </Avatar>

      {/* Description on the right */}
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-semibold mb-4">About Withsy</h2>
        <p className="text-base leading-relaxed whitespace-pre-line">
          Withsy started with one simple tool – Withsy Chat.{"\n"}
          But behind that one tool is a whole philosophy:{"\n"}
          to build products that are gentle, customizable, and made just for
          you.{"\n"}
          This is just the beginning.{"\n"}
          We&apos;re creating a village of thoughtful tools that grow with you,
          {"\n"}
          listen to you, and always stay by your side.
        </p>
      </div>
    </div>
  );
}
