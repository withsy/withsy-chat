import {
  Badge,
  CircleUserRound,
  LogIn,
  Mail,
  SquareArrowOutUpRight,
  User,
} from "lucide-react";
import type { GetServerSideProps } from "next";
import { getProviders, signIn } from "next-auth/react";
import Image from "next/image";
import { Browser } from "@capacitor/browser";

const iconMap: Record<string, React.ReactNode> = {
  email: <Mail size={18} />,
  credentials: <User size={18} />,
  slack: <Badge size={18} />,
  google: <CircleUserRound size={18} />,
};

type Props = {
  providers: Record<string, any> | null;
};

const isNativeApp = () => {
  if (typeof window === "undefined") return false;
  return /withsy-app/i.test(navigator.userAgent);
};

export default function SignInPage({ providers }: Props) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4 select-none">
      <div className="max-w-lg w-full space-y-8 p-10">
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
                    onClick={async () => {
                      if (isNativeApp()) {
                        await Browser.open({
                          url: "https://withsy.chat/auth/signin/google?callbackUrl=/auth/mobile/google",
                        });
                      } else {
                        signIn(provider.id, { callbackUrl: "/chat" });
                      }
                    }}
                    className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 transition"
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
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-200 active:bg-gray-200 transition"
                  >
                    {iconMap[provider.id] || <LogIn size={18} />}
                    Continue with {provider.name}
                  </button>
                )}
              </div>
            ))}

          <div>
            <p className="text-xs text-gray-500 mt-1 flex flex-row flex-wrap space-x-1">
              <span>by signing in you agree to our</span>
              <a
                href="/privacy-policy.html"
                className="underline inline-flex items-center ml-1"
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
                className="underline inline-flex items-center ml-1"
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

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return {
    props: { providers: providers ?? null },
  };
};
