import { Copy, ThumbsUp, ThumbsDown, Settings } from "lucide-react";
import { IconButtonWithTooltip } from "@/components/IconButtonWithTooltip";
import { MarkdownBox } from "@/components/MarkdownBox";

type Props = {
  content: string;
};

export function ChatAnswerBox({ content }: Props) {
  return (
    <div className="border rounded-lg bg-background shadow-sm p-4 space-y-2">
      <MarkdownBox content={content} />

      <div className="flex gap-2 justify-end pt-2 border-t mt-2">
        <IconButtonWithTooltip
          icon={<Copy className="w-4 h-4" />}
          label="Copy"
          onClick={() => navigator.clipboard.writeText(content)}
        />
        <IconButtonWithTooltip
          icon={<ThumbsUp className="w-4 h-4" />}
          label="Like"
        />
        <IconButtonWithTooltip
          icon={<ThumbsDown className="w-4 h-4" />}
          label="Dislike"
        />
        <IconButtonWithTooltip
          icon={<Settings className="w-4 h-4" />}
          label="Change Model"
        />
      </div>
    </div>
  );
}
