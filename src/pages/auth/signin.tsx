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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-xl">
        <div className="text-center">
          <img
            className="mx-auto h-16 w-16"
            src="/logo.png"
            alt="withsy logo"
          />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose a provider to continue
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {providers &&
            Object.values(providers).map((provider: any) => (
              <div key={provider.name}>
                <button
                  onClick={() => signIn(provider.id, { callbackUrl: "/" })}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 transition"
                >
                  {iconMap[provider.id] || <LogIn size={18} />}
                  Sign in with {provider.name}
                </button>
              </div>
            ))}
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
