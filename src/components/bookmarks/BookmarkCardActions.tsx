import { Copy, Bookmark as BookmarkIcon, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { EditTitleModal } from "@/components/chat/EditTitleModal";

type Props = {
  content: string;
  onUnbookmark: () => void;
  onTitleChange: (newTitle: string) => void;
};

export function BookmarkCardActions({
  content,
  onUnbookmark,
  onTitleChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied!", {
      description: "Chat content copied to clipboard.",
    });
  };

  return (
    <>
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white rounded-md p-1 border">
        <Button variant="ghost" size="icon" onClick={handleCopy}>
          <Copy className="w-4 h-4 text-muted-foreground" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onUnbookmark}>
          <BookmarkIcon className="w-4 h-4" fill="black" stroke="white" />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Pencil className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      <EditTitleModal
        open={open}
        setOpen={setOpen}
        onSubmit={(title) => {
          onTitleChange(title);
          toast("Title updated", {
            description: "Bookmark title has been changed.",
          });
        }}
      />
    </>
  );
}
