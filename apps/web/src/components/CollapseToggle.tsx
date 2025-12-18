import { usePreferences } from "@/context/PreferencesContext";

type Props = {
  show: boolean;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

export function CollapseToggle({ show, collapsed, setCollapsed }: Props) {
  const { usePreference } = usePreferences();
  const themeColor = usePreference("themeColor");

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
