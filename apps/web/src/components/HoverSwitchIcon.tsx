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
      className={`group relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <DefaultIcon
        className={`h-full w-full transition-all ${
          isActive ? "opacity-0" : "group-hover:opacity-0"
        }`}
        size={size}
      />
      <HoverIcon
        className={`absolute top-0 left-0 h-full w-full transition-all ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        size={size}
        fill={fill}
      />
    </div>
  );
};

export default HoverSwitchIcon;
