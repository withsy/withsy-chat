import { useUser } from "@/context/UserContext";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Bookmark, FolderGit2, PenLine } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { AccessibilityMenu } from "../AccessibilityMenu";
import { CollapseButton } from "../CollapseButton";
import HoverSwitchIcon from "../HoverSwitchIcon";
import { IconWithLabel } from "../IconWithLabel";

export default function ChatHeader() {
  const router = useRouter();
  const { collapsed } = useSidebarStore();
  const { openDrawer, setOpenDrawer } = useDrawerStore();
  const { user } = useUser();

  const [hideLabels, setHideLabels] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      setHideLabels(width < 640 || openDrawer != null);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [openDrawer]);

  const handleClick = (id: string) => {
    setOpenDrawer(openDrawer === id ? null : id);
  };

  if (!user) return null;

  const { themeColor, themeOpacity } = user.preferences;

  const buttons = [
    {
      label: "Saved",
      id: "saved",
      icon: (
        <HoverSwitchIcon
          DefaultIcon={Bookmark}
          HoverIcon={Bookmark}
          fill={`rgb(${themeColor})`}
          isActive={openDrawer == "saved"}
        />
      ),
    },
    {
      label: "Branches",
      id: "branches",
      icon: (
        <HoverSwitchIcon
          DefaultIcon={FolderGit2}
          HoverIcon={FolderGit2}
          fill={`rgb(${themeColor})`}
          isActive={openDrawer == "branches"}
        />
      ),
    },
  ];

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity - 0.1})`,
  };

  const buttonClassName =
    "group flex items-center gap-1 rounded-md px-2 py-2 hover:bg-white hover:font-semibold active:bg-white active:font-semibold transition-colors";
  const handleLinkClick = () => {
    router.push(`/chat`);
  };
  return (
    <div
      className="absolute top-0 left-0 w-full h-[50px] px-4 flex items-center justify-between"
      style={headerStyle}
      ref={containerRef}
    >
      <div className="flex flex-row gap-4 items-center">
        {collapsed && (
          <>
            <CollapseButton />
            <button onClick={handleLinkClick} className={buttonClassName}>
              <IconWithLabel icon={PenLine} fill={true} />
            </button>
          </>
        )}
      </div>
      <div className="flex gap-5">
        <AccessibilityMenu hideLabels={hideLabels} />
        {buttons.map(({ label, id, icon }) => (
          <button
            key={id}
            className={`${buttonClassName} ${
              openDrawer === id ? "font-semibold" : ""
            }`}
            onClick={() => handleClick(id)}
          >
            {icon}
            {!hideLabels && <span>{label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
