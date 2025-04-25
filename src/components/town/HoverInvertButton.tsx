import type { MouseEventHandler, ReactNode } from "react";

interface HoverInvertButtonProps {
  textColor: "white" | "black";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
}

export function HoverInvertButton({
  textColor,
  onClick,
  children,
}: HoverInvertButtonProps) {
  return (
    <button
      className="text-sm font-semibold underline underline-offset-4 p-1 rounded transition-colors duration-200"
      style={{
        color: textColor,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        target.style.backgroundColor =
          textColor === "white" ? "black" : "white";
        target.style.color = textColor === "white" ? "white" : "black";
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.style.backgroundColor = "transparent";
        target.style.color = textColor;
      }}
    >
      {children}
    </button>
  );
}
