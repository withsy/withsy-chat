// components/landing/PromptTransparencySection.tsx
import Image from "next/image";

export default function PromptTransparency() {
  return (
    <section className="bg-white px-4 py-16 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12">
        {/* 제목과 설명 */}
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Full Control, No Surprises
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Prompts are transparent and user-controlled. Apply a default prompt
            across all chats, or set a custom one per chat. If you don’t apply
            any prompt, nothing hidden runs behind the scenes.
          </p>
        </div>

        <Image
          unoptimized
          src="/home/apply-prompt.webp"
          alt="Apply Prompt"
          width={720}
          height={400}
          className="rounded-xl shadow-md"
          placeholder="blur"
          blurDataURL="/home/apply-prompt.jpg"
        />

        {/* 기능 요약 리스트 */}
        <ul className="text-muted-foreground mx-auto max-w-2xl list-inside list-disc space-y-2 text-base">
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
        <div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row">
          <div className="text-center">
            <Image
              unoptimized
              src="/home/before-prompt.png"
              alt="Before Prompt"
              width={360}
              height={300}
              className="rounded-xl border shadow-sm"
            />
            <p className="text-muted-foreground mt-2 text-sm">
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
            <p className="text-muted-foreground mt-2 text-sm">
              After: grounded response with applied prompt
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
