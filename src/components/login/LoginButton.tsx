import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <Button size="sm" onClick={() => signIn()}>
      Log in
    </Button>
  );
}
