import { CloudHail } from "lucide-react";

type ErrorProps = {
  message?: string;
};

export function FullPageError({
  message = "Something went wrong.",
}: ErrorProps) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center text-center space-y-4">
      <CloudHail className="w-10 h-10" />
      <p className="text-muted-foreground">ERROR: {message.toUpperCase()}</p>
    </div>
  );
}

export function PartialError({
  message = "Something went wrong.",
}: ErrorProps) {
  return (
    <div className="flex w-full h-full flex-col items-center justify-center text-center space-y-2">
      <CloudHail className="w-8 h-8" />
      <p className="text-muted-foreground">ERROR: {message.toUpperCase()}</p>
    </div>
  );
}
