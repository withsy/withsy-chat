import React from "react";

interface HoverSwitchIconProps {
  DefaultIcon: React.ElementType;
  HoverIcon: React.ElementType;
  size?: number;
  fill?: string;
  className?: string;
}

const HoverSwitchIcon: React.FC<HoverSwitchIconProps> = ({
  DefaultIcon,
  HoverIcon,
  size = 16,
  fill,
  className = "",
}) => {
  return (
    <div
      className={`relative inline-block group ${className}`}
      style={{ width: size, height: size }}
    >
      <DefaultIcon
        className="transition-all group-hover:opacity-0 w-full h-full"
        size={size}
      />
      <HoverIcon
        className="transition-all opacity-0 group-hover:opacity-100 absolute top-0 left-0 w-full h-full"
        size={size}
        fill={fill}
      />
    </div>
  );
};

export default HoverSwitchIcon;
