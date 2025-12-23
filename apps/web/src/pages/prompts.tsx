import { CollapseButton } from "@/components/CollapseButton";
import { DynamicChatLayout } from "@/components/layout/DynamicChatLayout";
import { PartialLoading } from "@/components/Loading";
import { EditPromptModal } from "@/components/prompts/EditPromptModal";
import { PromptCard } from "@/components/prompts/PromptCard";
import { Button } from "@/components/ui/button";
import { useUserPreference } from "@/hooks/useUserPreference";
import { useTRPC } from "@/lib/trpc";
import { useChatStore } from "@/stores/useChatStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { v4 } from "uuid";

export default function Page() {
  const trpc = useTRPC();
  const { chat, setChat } = useChatStore();
  const { collapsed } = useSidebarStore();

  if (chat != null) {
    setChat(null);
  }

  const {
    data: prompts,
    refetch: refetchPrompts,
    isLoading: isLoadingPrompts,
  } = useQuery(trpc.userPrompt.list.queryOptions());
  const {
    data: defaultPrompt,
    refetch: refetchDefaultPrompt,
    isLoading: isLoadingDefaultPrompt,
  } = useQuery(
    trpc.userDefaultPrompt.get.queryOptions(undefined, {
      retry: false,
    }),
  );

  const createPrompt = useMutation(
    trpc.userPrompt.create.mutationOptions({
      onSuccess: () => {
        refetchPrompts();
        refetchDefaultPrompt();
      },
    }),
  );

  const updatePrompt = useMutation(
    trpc.userPrompt.update.mutationOptions({
      onSuccess: () => {
        refetchPrompts();
        refetchDefaultPrompt();
      },
    }),
  );

  const upsertDefaultPrompt = useMutation(
    trpc.userDefaultPrompt.upsert.mutationOptions({
      onSuccess: () => {
        refetchPrompts();
        refetchDefaultPrompt();
      },
    }),
  );

  const deletePrompt = useMutation(
    trpc.userPrompt.delete.mutationOptions({
      onSuccess: () => {
        refetchPrompts();
        refetchDefaultPrompt();
      },
    }),
  );

  const toggleStarPrompt = (prompt: UserPromptData) => {
    updatePrompt.mutate({
      userPromptId: prompt.id,
      isStarred: !prompt.isStarred,
    });
  };

  const makeDefaultPrompt = (promptId: string | null) => {
    updateDefaultPrompt.mutate({ userPromptId: promptId });
  };

  const [editPrompt, setEditPrompt] = useState<{
    id: string;
    title: string;
    text: string;
    isStarred: boolean;
    updatedAt: Date;
    isDefault?: boolean;
  } | null>(null);

  const themeColor = useUserPreference("themeColor");
  const themeOpacity = useUserPreference("themeOpacity");

  if (isLoadingPrompts || isLoadingDefaultPrompt) {
    return <PartialLoading />;
  }

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return (
    <DynamicChatLayout>
      <div className="relative flex h-full">
        <div
          className="absolute top-0 left-0 flex h-[50px] w-full items-center justify-between px-4 select-none"
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
            style={{
              backgroundColor: `rgb(${themeColor})`,
            }}
          >
            Add
          </Button>
        </div>
        <div className="mt-[50px] flex-1 space-y-6 overflow-y-auto p-6 select-none">
          <div>
            <h1 className="text-2xl font-semibold text-black">Default</h1>
            <p className="text-muted-foreground text-sm">
              This prompt is automatically applied to all chats by default, and
              each user can set only one default prompt.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {defaultPrompt?.userPrompt && (
              <PromptCard
                key={defaultPrompt.userPrompt.id}
                prompt={defaultPrompt.userPrompt}
                onClick={() =>
                  setEditPrompt({
                    id: defaultPrompt.userPrompt!.id,
                    title: defaultPrompt.userPrompt!.title,
                    text: defaultPrompt.userPrompt!.text,
                    isStarred: defaultPrompt.userPrompt!.isStarred,
                    updatedAt: new Date(defaultPrompt.userPrompt!.updatedAt),
                    isDefault: true,
                  })
                }
                onMakeDefault={makeDefaultPrompt}
                onToggleStar={toggleStarPrompt}
                onDelete={(promptId) => {
                  deletePrompt.mutate({ userPromptId: promptId });
                }}
                isDefault={true}
              />
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-black">Prompts</h1>
            <p className="text-muted-foreground text-sm">
              These prompts can be individually selected and applied to specific
              chats.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {prompts
              ?.filter((p) => p.id !== defaultPrompt?.userPrompt?.id)
              .slice()
              .sort((a, b) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0))
              .map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onClick={setEditPrompt}
                  onToggleStar={toggleStarPrompt}
                  onMakeDefault={makeDefaultPrompt}
                  onDelete={(promptId) =>
                    deletePrompt.mutate({ userPromptId: promptId })
                  }
                />
              ))}
          </div>

          {editPrompt && (
            <EditPromptModal
              prompt={editPrompt}
              onClose={() => setEditPrompt(null)}
              onSave={(savedPrompt) => {
                if (editPrompt.isDefault) {
                  updatePrompt.mutate({
                    userPromptId: savedPrompt.id,
                    title: savedPrompt.title,
                    text: savedPrompt.text,
                    isStarred: savedPrompt.isStarred,
                  });
                  updateDefaultPrompt.mutate({
                    userPromptId: savedPrompt.id,
                  });
                } else {
                  const isNew = !prompts?.some((p) => p.id === savedPrompt.id);
                  if (isNew) {
                    createPrompt.mutate({
                      title: savedPrompt.title,
                      text: savedPrompt.text,
                      idempotencyKey: v4(),
                    });
                  } else {
                    updatePrompt.mutate({
                      userPromptId: savedPrompt.id,
                      title: savedPrompt.title,
                      text: savedPrompt.text,
                      isStarred: savedPrompt.isStarred,
                    });
                  }
                }
                setEditPrompt(null);
              }}
            />
          )}
        </div>
      </div>
    </DynamicChatLayout>
  );
}
