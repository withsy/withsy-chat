import { CollapseButton } from "@/components/CollapseButton";
import { PartialLoading } from "@/components/Loading";
import { EditPromptModal } from "@/components/prompts/EditPromptModal";
import { PromptCard } from "@/components/prompts/PromptCard";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { trpc } from "@/lib/trpc";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type { UserPrompt } from "@/types";
import { useState } from "react";
import { v4 as uuid } from "uuid";

function PromptsPage() {
  const { user } = useUser();
  const { collapsed } = useSidebarStore();

  const {
    data: prompts,
    refetch: refetchPrompts,
    isLoading: isLoadingPrompts,
  } = trpc.userPrompt.list.useQuery();
  const {
    data: defaultPrompt,
    refetch: refetchDefaultPrompt,
    isLoading: isLoadingDefaultPrompt,
  } = trpc.userDefaultPrompt.get.useQuery(undefined, {
    retry: false,
  });

  const createPrompt = trpc.userPrompt.create.useMutation({
    onSuccess: () => {
      refetchPrompts();
      refetchDefaultPrompt();
    },
  });

  const updatePrompt = trpc.userPrompt.update.useMutation({
    onSuccess: () => {
      refetchPrompts();
      refetchDefaultPrompt();
    },
  });

  const updateDefaultPrompt = trpc.userDefaultPrompt.update.useMutation({
    onSuccess: () => {
      refetchPrompts();
      refetchDefaultPrompt();
    },
  });

  const deletePrompt = trpc.userPrompt.delete.useMutation({
    onSuccess: () => {
      refetchPrompts();
      refetchDefaultPrompt();
    },
  });

  const toggleStarPrompt = (prompt: UserPrompt.Data) => {
    updatePrompt.mutate({
      userPromptId: prompt.id,
      isStarred: !prompt.isStarred,
    });
  };

  const makeDefaultPrompt = (promptId: string) => {
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

  if (!user || isLoadingPrompts || isLoadingDefaultPrompt) {
    return <PartialLoading />;
  }

  const { themeColor, themeOpacity } = user.preferences;
  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return (
    <div className="flex h-full relative">
      <div
        className="absolute top-0 left-0 w-full h-[50px] px-4 flex items-center justify-between select-none"
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
      <div className="flex-1 p-6 mt-[50px] select-none overflow-y-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-black">Default</h1>
          <p className="text-sm text-muted-foreground">
            This prompt is automatically applied to all chats by default, and
            each user can set only one default prompt.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {defaultPrompt?.userPrompt && (
            <PromptCard
              key={defaultPrompt.userPrompt.id}
              prompt={defaultPrompt.userPrompt}
              themeColor={themeColor}
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
              onToggleStar={toggleStarPrompt}
              onDelete={(promptId) => {
                deletePrompt.mutate({ userPromptId: promptId });
              }}
            />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-black">Prompts</h1>
          <p className="text-sm text-muted-foreground">
            These prompts can be individually selected and applied to specific
            chats.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {prompts
            ?.filter((p) => p.id !== defaultPrompt?.userPrompt?.id)
            .slice()
            .sort((a, b) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0))
            .map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                themeColor={themeColor}
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
                    idempotencyKey: uuid(),
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
  );
}

export default PromptsPage;
