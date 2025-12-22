import { useUserPreference } from "@/hooks/useUserPreference";

type Props = {
  show: boolean;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

export function CollapseToggle({ show, collapsed, setCollapsed }: Props) {
  const themeColor = useUserPreference("themeColor");

  if (!show) return <div />;
  return (
    <button
      onClick={() => setCollapsed(!collapsed)}
      className="text-sm select-none hover:underline active:underline"
      style={{ color: `rgb(${themeColor})` }}
    >
      {collapsed ? "Show More" : "Show Less"}
    </button>
  );
}
