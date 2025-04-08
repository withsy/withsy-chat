import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  isExternal?: boolean;
}

export function DashboardCard({
  title,
  description,
  icon,
  onClick,
  isExternal = false,
}: DashboardCardProps) {
  return (
    <Card
      onClick={onClick}
      className="aspect-square p-3 bg-muted border border-muted-foreground/10 hover:shadow-sm transition-shadow relative cursor-pointer group"
    >
      {isExternal && (
        <ExternalLink className="absolute top-2 right-2 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}

      <div className="flex flex-col h-full justify-between">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}
