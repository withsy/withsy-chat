import { GitBranch, Save, Settings, Sparkles } from "lucide-react";
import ResponsiveButton from "./ResponsiveButton";

export function Hero() {
  return (
    <section className="relative z-0 w-full overflow-hidden bg-transparent pt-16 pb-10 text-center">
      <div className="absolute top-[-100px] left-[-100px] z-[-1] h-[200px] w-[200px] rounded-full bg-[#EA9257]" />
      <div className="absolute right-[-150px] bottom-[-150px] z-[-1] h-[400px] w-[400px] rounded-full bg-[#EA9257]" />

      <div className="mx-auto max-w-3xl px-4">
        <div
          className="mb-6 space-y-4 selection:bg-[#EA9257] selection:text-white"
          style={{ color: "rgb(40,90,128)" }}
        >
          <h1 className="text-4xl font-bold md:text-5xl">Clear. Yours.</h1>
          <h1 className="text-4xl font-bold md:text-5xl">
            Just the Way You Want It.
          </h1>
        </div>
        <p className="mb-10 text-lg text-gray-600 md:text-xl">
          Shape it your way – transparent, customizable, and yours to keep.
        </p>

        <div className="mx-auto mb-10 flex max-w-xl flex-wrap justify-center gap-6 text-left">
          <div className="flex w-64 items-start gap-3">
            <Sparkles className="mt-1 h-6 w-6 text-[#EA9257]" />
            <div>
              <p className="font-semibold">Personalized Chat</p>
              <p className="text-muted-foreground text-sm">
                Customize your theme, model name, and appearance – make chatting
                feel personal.
              </p>
            </div>
          </div>
          <div className="flex w-64 items-start gap-3">
            <Settings className="mt-1 h-6 w-6 text-[#EA9257]" />
            <div>
              <p className="font-semibold">Complete Prompt Transparency</p>
              <p className="text-muted-foreground text-sm">
                Control your prompts – see and edit them anytime.
              </p>
            </div>
          </div>
          <div className="flex w-64 items-start gap-3">
            <Save className="mt-1 h-6 w-6 text-[#EA9257]" />
            <div>
              <p className="font-semibold">Save What Truly Matters</p>
              <p className="text-muted-foreground text-sm">
                Keep your favorite chats close, always one click away.
              </p>
            </div>
          </div>
          <div className="flex w-64 items-start gap-3">
            <GitBranch className="mt-1 h-6 w-6 text-[#EA9257]" />
            <div>
              <p className="font-semibold">
                Explore Multiple Conversation Paths
              </p>
              <p className="text-muted-foreground text-sm">
                Return to past topics and take the conversation somewhere new.
              </p>
            </div>
          </div>
        </div>

        <ResponsiveButton size="lg" message="Try Withsy Free Now" />
      </div>
    </section>
  );
}
