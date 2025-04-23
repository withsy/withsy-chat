import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/context/UserContext";
import { Badge, TriangleAlert } from "lucide-react";

interface StatusIndicatorProps {
  status: "pending" | "processing" | "succeeded" | "failed";
}

export const StatusIndicator = ({ status }: StatusIndicatorProps) => {
  const { userPrefs } = useUser();
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
      <span className="flex items-center gap-1 text-muted-foreground text-sm mt-5 justify-end">
        <Badge
          className="animate-bounce"
          fill={`rgb(${userPrefs.themeColor})`}
          color="none"
        />
      </span>
    );
  }

  return null;
};
