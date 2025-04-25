import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <Button size="lg" onClick={() => signIn()} className="text-lg">
      Sign in
    </Button>
  );
}
