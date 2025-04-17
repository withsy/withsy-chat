import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import {
  Archive,
  Bookmark,
  ChevronsLeftRight,
  ChevronsRightLeft,
  GitBranch,
} from "lucide-react";
import HoverSwitchIcon from "../HoverSwitchIcon";

interface ChatHeaderProps {
  setOpenDrawer: (id: string | null) => void;
  openDrawer: string | null;
}

export default function ChatHeader({
  setOpenDrawer,
  openDrawer,
}: ChatHeaderProps) {
  const { isMobile } = useSidebar();
  const { userPrefs, setUserPrefsAndSave } = useUser();
  const { themeColor, themeOpacity } = userPrefs;
  const handleClick = (id: string) => {
    setOpenDrawer(openDrawer === id ? null : id);
  };

  const buttons = [
    {
      label: "Saved",
      id: "saved",
      icon: (
        <HoverSwitchIcon
          DefaultIcon={Bookmark}
          HoverIcon={Bookmark}
          fill={`rgb(${themeColor})`}
        />
      ),
    },
    {
      label: "Branches",
      id: "branches",
      icon: (
        <HoverSwitchIcon
          DefaultIcon={GitBranch}
          HoverIcon={GitBranch}
          fill={`rgb(${themeColor})`}
        />
      ),
    },
  ];

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity - 0.1})`,
  };

  if (!isMobile) {
    headerStyle.borderTopLeftRadius = 30;
    if (!openDrawer) {
      headerStyle.borderTopRightRadius = 30;
    }
  }

  const buttonClassName =
    "group flex items-center gap-1 rounded-md px-1 py-2 hover:bg-white hover:font-bold transition-colors text-sm font-medium";
  return (
    <div
      className="absolute top-0 left-0 w-full h-[50px] px-4 flex items-center justify-between"
      style={headerStyle}
    >
      <div className="flex gap-3">
        {buttons.map(({ label, id, icon }) => (
          <button
            key={id}
            className={buttonClassName}
            onClick={() => handleClick(id)}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        {!isMobile && (
          <button
            className={buttonClassName}
            onClick={() => {
              setUserPrefsAndSave({ wideView: !userPrefs.wideView });
            }}
          >
            {userPrefs.wideView ? (
              <>
                <ChevronsLeftRight size={16} />
                <span>Wide View</span>
              </>
            ) : (
              <>
                <ChevronsRightLeft size={16} />
                <span>Compact View</span>
              </>
            )}
          </button>
        )}
        <button className={buttonClassName} onClick={() => {}}>
          <HoverSwitchIcon
            DefaultIcon={Archive}
            HoverIcon={Archive}
            fill={`rgb(${themeColor})`}
          />
          <span>Archive</span>
        </button>
      </div>
    </div>
  );
}
