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
      className={`text-${size} cursor-pointer bg-[rgb(40,90,128)] font-semibold text-white select-none`}
    >
      <Link href="/chat">{message}</Link>
    </Button>
  );
}
