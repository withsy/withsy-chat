import {
  Badge,
  CircleUserRound,
  Github,
  LogIn,
  Mail,
  User,
} from "lucide-react";
import type { GetServerSideProps } from "next";
import { getProviders, signIn } from "next-auth/react";

const iconMap: Record<string, React.ReactNode> = {
  github: <Github size={18} />,
  email: <Mail size={18} />,
  credentials: <User size={18} />,
  slack: <Badge size={18} />,
  google: <CircleUserRound size={18} />,
};

type Props = {
  providers: Record<string, any> | null;
};

export default function SignInPage({ providers }: Props) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-xl">
        <div className="text-center">
          <img
            className="mx-auto h-16 w-16"
            src="/logo.png"
            alt="withsy logo"
          />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Welcome</h2>
          <p className="mt-2 text-sm text-gray-600">
            Use your Google account to continue
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {providers &&
            Object.entries(providers).map(([id, provider]: [string, any]) => (
              <div key={provider.name}>
                {id === "google" ? (
                  <button
                    onClick={() =>
                      signIn(provider.id, { callbackUrl: "/chat" })
                    }
                    className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 transition"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                  >
                    <img
                      src="/google_logo.svg"
                      alt="Google logo"
                      className="h-5 w-5"
                    />
                    <span className="text-sm">Continue with Google</span>
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      signIn(provider.id, { callbackUrl: "/chat" })
                    }
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-200 active:bg-gray-200 transition"
                  >
                    {iconMap[provider.id] || <LogIn size={18} />}
                    Continue with {provider.name}
                  </button>
                )}
              </div>
            ))}

          <div>
            <p className="text-xs text-gray-500 mt-1">
              by signing in you agree to our{" "}
              <a href="/terms" className="underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return {
    props: { providers: providers ?? null },
  };
};
