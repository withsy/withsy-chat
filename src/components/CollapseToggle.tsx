import { useSidebar } from "@/context/SidebarContext";

type Props = {
  show: boolean;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

export function CollapseToggle({ show, collapsed, setCollapsed }: Props) {
  const { userPrefs } = useSidebar();
  const themeColor = userPrefs["themeColor"];

  if (!show) return null;
  return (
    <button
      onClick={() => setCollapsed(!collapsed)}
      className="hover:underline text-sm"
      style={{ color: `rgb(${themeColor})` }}
    >
      {collapsed ? "Show More" : "Show Less"}
    </button>
  );
}
