import { IconButtonWithTooltip } from "@/components/IconButtonWithTooltip";
import { MarkdownBox } from "@/components/MarkdownBox";
import { Copy, Settings, ThumbsDown, ThumbsUp } from "lucide-react";

type Props = {
  content: string;
};

export function ChatAnswerBox({ content }: Props) {
  return (
    <div className="bg-background space-y-2 rounded-lg border p-4 shadow-sm">
      <MarkdownBox content={content} />

      <div className="mt-2 flex justify-end gap-2 border-t pt-2">
        <IconButtonWithTooltip
          icon={<Copy className="h-4 w-4" />}
          label="Copy"
          onClick={() => navigator.clipboard.writeText(content)}
        />
        <IconButtonWithTooltip
          icon={<ThumbsUp className="h-4 w-4" />}
          label="Like"
        />
        <IconButtonWithTooltip
          icon={<ThumbsDown className="h-4 w-4" />}
          label="Dislike"
        />
        <IconButtonWithTooltip
          icon={<Settings className="h-4 w-4" />}
          label="Switch Model"
        />
      </div>
    </div>
  );
}
