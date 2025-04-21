import { useUser } from "@/context/UserContext";
import { CircleX } from "lucide-react";

interface ChatHeaderProps {
  setOpenDrawer: (id: string | null) => void;
  openDrawer: string | null;
}

export default function ChatDrawerHeader({
  setOpenDrawer,
  openDrawer,
}: ChatHeaderProps) {
  const { userPrefs } = useUser();
  const { themeColor, themeOpacity } = userPrefs;
  const handleClick = () => {
    setOpenDrawer(null);
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity - 0.1})`,
  };

  if (openDrawer) {
    headerStyle.borderTopRightRadius = 30;
  }
  return (
    <div
      className="w-full h-[50px] px-4 flex items-center justify-end"
      style={headerStyle}
    >
      <button
        className="group flex items-center gap-1 rounded-md px-1 py-2 hover:bg-white active:bg-white transition-colors text-sm font-medium"
        onClick={handleClick}
      >
        <CircleX size={16} />
      </button>
    </div>
  );
}
