import { useUser } from "@/context/UserContext";
import { CircleX } from "lucide-react";

interface ChatHeaderProps {
  openDrawer: string | null;
  setOpenDrawer: (id: string | null) => void;
}

export default function ChatDrawerHeader({
  openDrawer,
  setOpenDrawer,
}: ChatHeaderProps) {
  const { user } = useUser();
  if (!user) return null;

  const title = openDrawer == "saved" ? "Saved Messages" : "Branches";
  const { themeColor, themeOpacity } = user?.preferences;
  const handleClick = () => {
    setOpenDrawer(null);
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return (
    <div
      className="w-full h-[50px] px-4 flex items-center justify-between"
      style={headerStyle}
    >
      <div className="flex gap-2 items-center font-semibold text-sm select-none">
        {title}
      </div>
      <button
        className="group flex items-center gap-1 rounded-full px-2 py-2 hover:bg-white active:bg-white transition-colors text-sm font-medium"
        onClick={handleClick}
      >
        <CircleX size={16} />
      </button>
    </div>
  );
}
