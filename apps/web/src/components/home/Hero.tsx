import type { UserData } from "@/types/user";
import { GitBranch, Save, Settings, Sparkles } from "lucide-react";
import ResponsiveButton from "./ResponsiveButton";

export function Hero({ user }: { user: UserData | null }) {
  return (
    <section className="w-full bg-transparent pt-16 pb-10 text-center relative overflow-hidden z-0">
      <div className="absolute top-[-100px] left-[-100px] w-[200px] h-[200px] bg-[#EA9257] rounded-full z-[-1]" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-[#EA9257] rounded-full z-[-1]" />

      <div className="max-w-3xl mx-auto px-4">
        <div
          className="mb-6 space-y-4 selection:bg-[#EA9257] selection:text-white"
          style={{ color: "rgb(40,90,128)" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold">Clear. Yours.</h1>
          <h1 className="text-4xl md:text-5xl font-bold">
            Just the Way You Want It.
          </h1>
        </div>
        <p className="text-lg md:text-xl text-gray-600 mb-10">
          Shape it your way – transparent, customizable, and yours to keep.
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-10 text-left max-w-xl mx-auto">
          <div className="flex items-start gap-3 w-64">
            <Sparkles className="w-6 h-6 mt-1 text-[#EA9257]" />
            <div>
              <p className="font-semibold">Personalized Chat</p>
              <p className="text-sm text-muted-foreground">
                Customize your theme, model name, and appearance – make chatting
                feel personal.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 w-64">
            <Settings className="w-6 h-6 mt-1 text-[#EA9257]" />
            <div>
              <p className="font-semibold">Complete Prompt Transparency</p>
              <p className="text-sm text-muted-foreground">
                Control your prompts – see and edit them anytime.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 w-64">
            <Save className="w-6 h-6 mt-1 text-[#EA9257]" />
            <div>
              <p className="font-semibold">Save What Truly Matters</p>
              <p className="text-sm text-muted-foreground">
                Keep your favorite chats close, always one click away.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 w-64">
            <GitBranch className="w-6 h-6 mt-1 text-[#EA9257]" />
            <div>
              <p className="font-semibold">
                Explore Multiple Conversation Paths
              </p>
              <p className="text-sm text-muted-foreground">
                Return to past topics and take the conversation somewhere new.
              </p>
            </div>
          </div>
        </div>

        <ResponsiveButton user={user} size="lg" message="Try Withsy Free Now" />
      </div>
    </section>
  );
}
