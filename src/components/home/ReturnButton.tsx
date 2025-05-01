import { Button } from "@/components/ui/button";
import Link from "next/link";

type ButtonSize = "default" | "sm" | "lg" | "icon";

export default function ReturnButton({ size = "sm" }: { size?: ButtonSize }) {
  return (
    <Button
      size={size}
      className={`text-${size} font-semibold cursor-pointer bg-[rgb(40,90,128)] text-white select-none`}
    >
      <Link href="/chat">Return to chat</Link>
    </Button>
  );
}
