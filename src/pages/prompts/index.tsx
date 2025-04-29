import { PartialLoading } from "@/components/Loading";
import { EditPromptModal } from "@/components/prompts/EditPromptModal";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import type { Schema } from "@/types/user-prompt";
import { CollapseButton } from "@/components/CollapseButton";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Star } from "lucide-react";

const samplePrompts = [
  {
    id: "1",
    title: "Email Reply Template",
    text: "Write a polite and professional reply to the email below.Write a polite and professional reply to the email below.Write a polite and professional reply to the email below.Write a polite and professional reply to the email below.Write a polite and professional reply to the email below.Write a polite and professional reply to the email below.Write a polite and professional reply to the email below.Write a polite and professional reply to the email below.Write a polite and professional reply to the email below.Write a polite and professional reply to the email below.Write a polite and professional reply to the email below.Write a polite and professional reply to the email below.Write a polite and professional reply to the email below.Write a polite and professional reply to the email below.Write a polite and professional reply to the email below.",
    isStarred: true,
    updatedAt: new Date("2025-03-01T10:00:00Z"),
  },
  {
    id: "2",
    title: "Brainstorm Ideas",
    text: "Help me brainstorm 10 creative ideas.",
    isStarred: false,
    updatedAt: new Date("2025-03-05T14:30:00Z"),
  },
];

function PromptsPage() {
  const { user } = useUser();
  const { collapsed } = useSidebarStore();

  const [prompts, setPrompts] = useState(samplePrompts);
  const [editPrompt, setEditPrompt] = useState<Schema | null>(null);

  if (!user) {
    return <PartialLoading />;
  }

  const { themeColor, themeOpacity } = user.preferences;
  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return (
    <div className="flex h-full relative">
      <div
        className="absolute top-0 left-0 w-full h-[50px] px-4 flex items-center justify-between"
        style={headerStyle}
      >
        <div>{collapsed && <CollapseButton />}</div>
        <Button
          size="sm"
          onClick={() =>
            setEditPrompt({
              id: Date.now().toString(),
              title: "",
              text: "",
              isStarred: false,
              updatedAt: new Date(),
            })
          }
          className="text-sm"
        >
          Add
        </Button>
      </div>
      <div className="flex-1 p-6 mt-[50px] select-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="p-4 rounded-lg border shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => setEditPrompt(prompt)}
            >
              <div className="h-[120px] overflow-hidden text-sm whitespace-pre-wrap">
                {prompt.text}
              </div>
              <div className="mt-4 font-semibold truncate flex items-center gap-1">
                {prompt.isStarred && (
                  <Star size={14} fill={`rgb(${themeColor})`} />
                )}
                <span>{prompt.title}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                {new Date(prompt.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
        {editPrompt && (
          <EditPromptModal
            prompt={editPrompt}
            onClose={() => setEditPrompt(null)}
            onSave={(savedPrompt) => {
              setPrompts((prev) => {
                const existing = prev.find((p) => p.id === savedPrompt.id);
                if (existing) {
                  return prev.map((p) =>
                    p.id === savedPrompt.id ? savedPrompt : p
                  );
                } else {
                  return [...prev, savedPrompt];
                }
              });
              setEditPrompt(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default PromptsPage;
