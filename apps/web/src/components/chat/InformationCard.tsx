import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface InformationCarddProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  isExternal?: boolean;
}

export function InformationCard({
  title,
  description,
  icon,
  onClick,
  isExternal = false,
}: InformationCarddProps) {
  return (
    <Card
      onClick={onClick}
      className="border-muted-foreground/10 group relative cursor-pointer border p-3 transition-shadow hover:shadow-sm"
    >
      {isExternal && (
        <ExternalLink className="text-muted-foreground absolute top-2 right-2 h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      )}

      <div className="flex h-full flex-col justify-between">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}
