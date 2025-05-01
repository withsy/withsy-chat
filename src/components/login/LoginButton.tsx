import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

type ButtonSize = "default" | "sm" | "lg" | "icon";

export default function LoginButton({ size = "sm" }: { size?: ButtonSize }) {
  return (
    <Button
      variant="outline"
      size={size}
      onClick={() => signIn()}
      className={`text-${size} font-semibold cursor-pointer bg-[rgb(40,90,128)] text-white`}
    >
      Start Chatting
    </Button>
  );
}
