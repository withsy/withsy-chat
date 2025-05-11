import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect } from "react";
import { Cat } from "lucide-react";

const errorMessages: Record<string, string> = {
  Configuration:
    "There was a server configuration issue. Please contact support.",
  AccessDenied:
    "You don’t have access permission. Try signing in with a different account.",
  Verification: "The sign-in link has expired. Please try again.",
  OAuthSignin:
    "There was a problem during the sign-in process. Please try again.",
  OAuthCallback: "There was a problem handling the OAuth callback.",
  OAuthCreateAccount: "There was a problem creating your account.",
  OAuthAccountNotLinked:
    "This email is already linked with a different sign-in method.",
  default: "An error occurred during sign-in. Please try again.",
};

export default function AuthErrorPage() {
  const router = useRouter();
  const { error } = router.query;

  const message =
    typeof error === "string" && errorMessages[error]
      ? errorMessages[error]
      : errorMessages.default;

  useEffect(() => {
    if (error) {
      console.error(`Login error occurred: ${error}`);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
      <Cat size={48} className="text-blue-600 mb-4" />{" "}
      <h1 className="text-2xl font-bold">Sign-in Error</h1>
      <p className="mt-4 text-gray-700">{message}</p>
      <Link
        href="/auth/signin"
        className="mt-6 inline-block px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition"
      >
        Try Signing In Again
      </Link>
    </div>
  );
}
