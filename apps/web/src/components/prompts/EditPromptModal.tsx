import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { UserPromptData } from "@/types/user-prompt";
import { useState } from "react";

interface EditPromptModalProps {
  prompt: UserPromptData;
  onClose: () => void;
  onSave: (updatedPrompt: UserPromptData) => void;
}

export function EditPromptModal({
  prompt,
  onClose,
  onSave,
}: EditPromptModalProps) {
  const [title, setTitle] = useState(prompt.title);
  const [text, setText] = useState(prompt.text);

  const isEditMode = prompt.title !== "" || prompt.text !== "";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Prompt" : "Add Prompt"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto my-4">
          <div className="space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />
            <div className="text-sm text-muted-foreground select-none">
              The prompt will be used as a base guideline for this conversation.
              AI will reference it in all its responses.
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Prompt Content"
              className="min-h-[150px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              onSave({
                ...prompt,
                title,
                text,
                updatedAt: new Date(),
              });
            }}
          >
            Save
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
