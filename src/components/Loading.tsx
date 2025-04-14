import { Spinner } from "./Spinner";

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spinner />
    </div>
  );
}
