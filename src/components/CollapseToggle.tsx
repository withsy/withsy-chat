import { useUser } from "@/context/UserContext";

type Props = {
  show: boolean;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

export function CollapseToggle({ show, collapsed, setCollapsed }: Props) {
  const { user } = useUser();
  if (!user) return null;

  const { themeColor } = user.preferences;

  if (!show) return null;
  return (
    <button
      onClick={() => setCollapsed(!collapsed)}
      className="hover:underline active:underline text-sm select-none"
      style={{ color: `rgb(${themeColor})` }}
    >
      {collapsed ? "Show More" : "Show Less"}
    </button>
  );
}
