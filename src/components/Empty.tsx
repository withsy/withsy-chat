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
    <div className="flex flex-col items-center justify-center w-full h-full select-none">
      <p className="text-2xl font-semibold p-4">{message}</p>
    </div>
  );
}
