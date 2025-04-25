import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  const { user } = useUser();
  if (!user) return null;

  return (
    <Button
      size="sm"
      onClick={() => signIn()}
      style={{
        backgroundColor: `rgb(${user.preferences.themeColor})`,
      }}
    >
      Log in
    </Button>
  );
}
