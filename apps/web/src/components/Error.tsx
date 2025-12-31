import { Activity } from "lucide-react";
import type { FallbackProps } from "react-error-boundary";
import { Button } from "./ui/button";

const DEFAULT_ERROR_MESSAGE = "Something went wrong.";

export function FullPageError({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex h-[100dvh] w-screen flex-col items-center justify-center space-y-4 text-center">
      <Activity className="h-10 w-10" />
      <p className="text-muted-foreground">
        ERROR: {error.message || DEFAULT_ERROR_MESSAGE}
      </p>
      <Button onClick={() => resetErrorBoundary()}>Try again</Button>
    </div>
  );
}

export function PartialError({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2 text-center">
      <Activity className="h-8 w-8" />
      <p className="text-muted-foreground">
        ERROR: {error.message || DEFAULT_ERROR_MESSAGE}
      </p>
      <Button onClick={() => resetErrorBoundary()}>Try again</Button>
    </div>
  );
}
