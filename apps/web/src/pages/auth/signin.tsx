import {
  Badge,
  CircleUserRound,
  LogIn,
  Mail,
  SquareArrowOutUpRight,
  User,
} from "lucide-react";
import { getProviders, signIn } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const iconMap: Record<string, React.ReactNode> = {
  email: <Mail size={18} />,
  credentials: <User size={18} />,
  slack: <Badge size={18} />,
  google: <CircleUserRound size={18} />,
};

export default function Page() {
  const [providers, setProviders] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    getProviders().then((providers) => {
      setProviders(providers);
    });
  }, []);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4 select-none">
      <div className="w-full max-w-lg space-y-8 p-10">
        <div className="text-center">
          <Image
            className="mx-auto"
            src="/logo.png"
            alt="withsy logo"
            width={64}
            height={64}
          />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Welcome to Withsy
          </h2>
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
                    className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                  >
                    <Image
                      src="/google_logo.svg"
                      alt="Google logo"
                      width={20}
                      height={20}
                    />
                    <span className="text-sm">Continue with Google</span>
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      signIn(provider.id, { callbackUrl: "/chat" })
                    }
                    className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-200 active:bg-gray-200"
                  >
                    {iconMap[provider.id] || <LogIn size={18} />}
                    Continue with {provider.name}
                  </button>
                )}
              </div>
            ))}

          <div>
            <p className="mt-1 flex flex-row flex-wrap space-x-1 text-xs text-gray-500">
              <span>by signing in you agree to our</span>
              <a
                href="/privacy-policy.html"
                className="ml-1 inline-flex items-center underline"
                target="_blank"
              >
                Privacy Policy
                <SquareArrowOutUpRight
                  size={10}
                  className="ml-1 inline align-middle"
                />
              </a>
              <span>and</span>
              <a
                href="/terms-of-service.html"
                className="ml-1 inline-flex items-center underline"
                target="_blank"
              >
                Terms of Service
                <SquareArrowOutUpRight
                  size={10}
                  className="ml-1 inline align-middle"
                />
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
