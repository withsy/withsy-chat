import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  const { userPrefs } = useUser();
  return (
    <Button
      size="sm"
      onClick={() => signIn()}
      style={{
        backgroundColor: `rgb(${userPrefs.themeColor})`,
      }}
    >
      Log in
    </Button>
  );
}
