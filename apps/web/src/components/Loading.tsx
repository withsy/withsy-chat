import { Spinner } from "./Spinner";

export function FullPageLoading() {
  return (
    <div className="flex h-[100dvh] w-screen items-center justify-center">
      <Spinner />
    </div>
  );
}

export function PartialLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner />
    </div>
  );
}
