import { PackageOpen } from "lucide-react";

export function FullPageEmpty() {
  return (
    <div className="flex h-[100dvh] w-screen items-center justify-center">
      <PackageOpen />
    </div>
  );
}

export function PartialEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center select-none">
      <p className="p-4 text-2xl font-semibold">{message}</p>
    </div>
  );
}
