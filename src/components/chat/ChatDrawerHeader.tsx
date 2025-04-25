import { useUser } from "@/context/UserContext";
import { CircleX } from "lucide-react";

interface ChatHeaderProps {
  setOpenDrawer: (id: string | null) => void;
}

export default function ChatDrawerHeader({ setOpenDrawer }: ChatHeaderProps) {
  const { user } = useUser();
  if (!user) return null;

  const { themeColor, themeOpacity } = user?.preferences;
  const handleClick = () => {
    setOpenDrawer(null);
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return (
    <div
      className="w-full h-[50px] px-4 flex items-center justify-end"
      style={headerStyle}
    >
      <button
        className="group flex items-center gap-1 rounded-full px-2 py-2 hover:bg-white active:bg-white transition-colors text-sm font-medium"
        onClick={handleClick}
      >
        <CircleX size={16} />
      </button>
    </div>
  );
}
