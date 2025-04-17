import React from "react";

interface HoverSwitchIconProps {
  DefaultIcon: React.ElementType;
  HoverIcon: React.ElementType;
  size?: number;
  fill?: string;
  className?: string;
  isActive?: boolean;
}

const HoverSwitchIcon: React.FC<HoverSwitchIconProps> = ({
  DefaultIcon,
  HoverIcon,
  size = 16,
  fill,
  className = "",
  isActive = false,
}) => {
  return (
    <div
      className={`relative inline-block group ${className}`}
      style={{ width: size, height: size }}
    >
      <DefaultIcon
        className={`transition-all w-full h-full ${
          isActive ? "opacity-0" : "group-hover:opacity-0"
        }`}
        size={size}
      />
      <HoverIcon
        className={`transition-all absolute top-0 left-0 w-full h-full ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        size={size}
        fill={fill}
      />
    </div>
  );
};

export default HoverSwitchIcon;
