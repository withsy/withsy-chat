import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signIn()}
      className="text-sm font-semibold cursor-pointer border-[rgb(40,90,128)] text-[rgb(40,90,128)]"
    >
      Start Chatting
    </Button>
  );
}
