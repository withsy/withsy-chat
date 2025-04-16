import { useUser } from "@/context/UserContext";

type Props = {
  show: boolean;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

export function CollapseToggle({ show, collapsed, setCollapsed }: Props) {
  const { userPrefs } = useUser();
  const { themeColor } = userPrefs;

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
