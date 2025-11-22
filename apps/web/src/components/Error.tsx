import { Activity } from "lucide-react";

type ErrorProps = {
  message?: string;
};

export function FullPageError({
  message = "Something went wrong.",
}: ErrorProps) {
  return (
    <div className="flex h-[100dvh] w-screen flex-col items-center justify-center text-center space-y-4">
      <Activity className="w-10 h-10" />
      <p className="text-muted-foreground">ERROR: {message.toUpperCase()}</p>
    </div>
  );
}

export function PartialError({
  message = "Something went wrong.",
}: ErrorProps) {
  return (
    <div className="flex w-full h-full flex-col items-center justify-center text-center space-y-2">
      <Activity className="w-8 h-8" />
      <p className="text-muted-foreground">ERROR: {message.toUpperCase()}</p>
    </div>
  );
}
