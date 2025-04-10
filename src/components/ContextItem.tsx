import type { ReactNode } from "react";

interface ContextItemProps {
  icon: ReactNode;
  date: string | Date;
}

export function ContextItem({ icon, date }: ContextItemProps) {
  return (
    <div className="flex items-center gap-1 text-muted-foreground cursor-default">
      <div className="w-4 h-4">{icon}</div>
      <span>{new Date(date).toLocaleString()}</span>
    </div>
  );
}
