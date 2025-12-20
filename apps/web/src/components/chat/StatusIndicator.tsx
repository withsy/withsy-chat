import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { Badge, TriangleAlert } from "lucide-react";

interface StatusIndicatorProps {
  status: "pending" | "processing" | "succeeded" | "failed";
}

export const StatusIndicator = ({ status }: StatusIndicatorProps) => {
  const { useUserPreference } = useUserPreferences();
  const themeColor = useUserPreference("themeColor");

  if (status === "succeeded") return null;
  if (status === "failed") {
    return (
      <div>
        <Alert className="mt-5 select-none">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle className="text-gray-500">Error</AlertTitle>
          <AlertDescription>
            Something went wrong while processing your message. Please try
            again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (status === "pending" || status === "processing") {
    return (
      <span className="text-muted-foreground mt-5 flex items-center justify-end gap-1 text-sm">
        <Badge
          className="animate-bounce"
          fill={`rgb(${themeColor})`}
          color="none"
        />
      </span>
    );
  }

  return null;
};
