// components/landing/PromptTransparencySection.tsx
import Image from "next/image";

export default function PromptTransparency() {
  return (
    <section className="py-16 px-4 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col gap-12 items-center">
        {/* 제목과 설명 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Full Control, No Surprises
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Prompts are transparent and user-controlled. Apply a default prompt
            across all chats, or set a custom one per chat. If you don’t apply
            any prompt, nothing hidden runs behind the scenes.
          </p>
        </div>

        {/* GIF */}
        <Image
          src="/home/apply-prompt.gif"
          alt="Apply Prompt"
          width={720}
          height={400}
          className="rounded-xl shadow-md"
        />

        {/* 기능 요약 리스트 */}
        <ul className="list-disc list-inside text-muted-foreground text-base max-w-2xl mx-auto space-y-2">
          <li>
            <strong>Default Prompt:</strong> Automatically applies to all chats
            unless overridden
          </li>
          <li>
            <strong>Per-Chat Prompt:</strong> Tailor each conversation with a
            different instruction
          </li>
          <li>
            <strong>No hidden system prompt:</strong> Only what you choose is
            applied
          </li>
        </ul>

        {/* Before / After 비교 */}
        <div className="w-full flex flex-col md:flex-row gap-6 items-center justify-center">
          <div className="text-center">
            <Image
              unoptimized
              src="/home/before-prompt.png"
              alt="Before Prompt"
              width={360}
              height={300}
              className="rounded-xl border shadow-sm"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Before: hallucination present
            </p>
          </div>
          <div className="text-center">
            <Image
              unoptimized
              src="/home/after-prompt.png"
              alt="After Prompt"
              width={360}
              height={300}
              className="rounded-xl border shadow-sm"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              After: grounded response with applied prompt
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
