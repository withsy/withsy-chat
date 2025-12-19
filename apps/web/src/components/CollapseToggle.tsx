import { useUserPreferences } from "@/context/UserPreferencesContext";

type Props = {
  show: boolean;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

export function CollapseToggle({ show, collapsed, setCollapsed }: Props) {
  const { useUserPreference } = useUserPreferences();
  const themeColor = useUserPreference("themeColor");

  if (!show) return <div />;
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
