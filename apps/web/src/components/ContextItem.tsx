import type { ReactNode } from "react";

interface ContextItemProps {
  icon: ReactNode;
  date: string | Date;
}

export function ContextItem({ icon, date }: ContextItemProps) {
  return (
    <div className="text-muted-foreground flex cursor-default items-center gap-1">
      <div className="h-4 w-4">{icon}</div>
      <span>{new Date(date).toLocaleString()}</span>
    </div>
  );
}
