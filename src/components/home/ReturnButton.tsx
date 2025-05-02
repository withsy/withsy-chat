import { Button } from "@/components/ui/button";
import Link from "next/link";

type ButtonSize = "default" | "sm" | "lg" | "icon";

export default function ReturnButton({
  size = "sm",
  message = "Return to chat",
}: {
  size?: ButtonSize;
  message?: string;
}) {
  return (
    <Button
      size={size}
      className={`text-${size} font-semibold cursor-pointer bg-[rgb(40,90,128)] text-white select-none`}
    >
      <Link href="/chat">{message}</Link>
    </Button>
  );
}
