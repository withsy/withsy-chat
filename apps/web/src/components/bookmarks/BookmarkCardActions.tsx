import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Bookmark as BookmarkIcon, Copy, Footprints } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  content: string;
  link: string;
  onUnsave: () => void;
  themeColor: string;
  hideUnsave?: boolean;
};

export function BookmarkCardActions({
  content,
  link,
  onUnsave,
  themeColor,
  hideUnsave,
}: Props) {
  const { isMobile } = useSidebarStore();

  const { setOpenDrawer } = useDrawerStore();
  const router = useRouter();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied!", {
      description: "Chat content copied to clipboard.",
    });
  };

  const handleGoToMessage = () => {
    if (isMobile) {
      setOpenDrawer(null);
    }
    router.push(link, { scroll: false });
  };

  return (
    <TooltipProvider>
      <div className="absolute right-2 z-10 transition-opacity flex rounded-md ">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleGoToMessage}>
              <Footprints className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Go to message</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              <Copy className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Copy</TooltipContent>
        </Tooltip>
        {!hideUnsave && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onUnsave}>
                <BookmarkIcon
                  className="w-8 h-8"
                  style={{
                    fill: `rgb(${themeColor})`,
                  }}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Unsave</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
