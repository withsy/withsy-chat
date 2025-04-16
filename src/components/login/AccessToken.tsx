import { signIn, signOut, useSession } from "next-auth/react";

export default function AccessToken() {
  const { data } = useSession();
  if (!data) {
    return <div>No session</div>;
  }

  const accessToken = Reflect.get(data, "accessToken");
  return <div>Access Token: {accessToken}</div>;
}
