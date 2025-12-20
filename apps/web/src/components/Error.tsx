import { Activity } from "lucide-react";

type ErrorProps = {
  message?: string;
};

export function FullPageError({
  message = "Something went wrong.",
}: ErrorProps) {
  return (
    <div className="flex h-[100dvh] w-screen flex-col items-center justify-center space-y-4 text-center">
      <Activity className="h-10 w-10" />
      <p className="text-muted-foreground">ERROR: {message.toUpperCase()}</p>
    </div>
  );
}

export function PartialError({
  message = "Something went wrong.",
}: ErrorProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2 text-center">
      <Activity className="h-8 w-8" />
      <p className="text-muted-foreground">ERROR: {message.toUpperCase()}</p>
    </div>
  );
}
