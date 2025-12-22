import { useUserPreference } from "@/hooks/useUserPreference";
import { capitalizeFirstLetter } from "@/lib/string-utils";
import { CircleX } from "lucide-react";

interface ChatHeaderProps {
  openDrawer: string | null;
  setOpenDrawer: (id: string | null) => void;
}

export default function ChatDrawerHeader({
  openDrawer,
  setOpenDrawer,
}: ChatHeaderProps) {
  const themeColor = useUserPreference("themeColor");
  const themeOpacity = useUserPreference("themeOpacity");

  const title = capitalizeFirstLetter(openDrawer);

  const handleClick = () => {
    setOpenDrawer(null);
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return (
    <div
      className="flex h-[50px] w-full items-center justify-between px-4"
      style={headerStyle}
    >
      <div className="flex items-center gap-2 text-sm font-semibold select-none">
        {title}
      </div>
      <button
        className="group flex items-center gap-1 rounded-full px-2 py-2 text-sm font-medium transition-colors hover:bg-white active:bg-white"
        onClick={handleClick}
      >
        <CircleX size={16} />
      </button>
    </div>
  );
}
