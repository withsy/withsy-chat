import { Spinner } from "./Spinner";

export function FullPageLoading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spinner />
    </div>
  );
}

export function PartialLoading() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Spinner />
    </div>
  );
}
