import type { MouseEventHandler, ReactNode } from "react";

interface HoverInvertButtonProps {
  textColor: "white" | "black";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  disabled?: boolean;
}

export function HoverInvertButton({
  textColor,
  onClick,
  children,
  disabled = false,
}: HoverInvertButtonProps) {
  return (
    <button
      className="text-sm font-semibold underline underline-offset-4 p-1 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        color: textColor,
      }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={(e) => {
        if (disabled) return;
        const target = e.currentTarget;
        target.style.backgroundColor =
          textColor === "white" ? "black" : "white";
        target.style.color = textColor === "white" ? "white" : "black";
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        const target = e.currentTarget;
        target.style.backgroundColor = "transparent";
        target.style.color = textColor;
      }}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
