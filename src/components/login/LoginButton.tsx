import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <Button
      size="sm"
      onClick={() => signIn()}
      className="text-sm font-semibold"
      style={{ backgroundColor: "rgb(40,90,128)" }}
    >
      Start Chatting
    </Button>
  );
}
