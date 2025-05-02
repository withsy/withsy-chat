import ResponsiveButton from "@/components/home/ResponsiveButton";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import type { GetServerSideProps } from "next";
import { service } from "@/server/service-registry";
import { User, UserSession } from "@/types/user";

type Props = {
  user: User | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  let user: User | null = null;
  if (session) {
    const userSession = UserSession.parse(session);
    user = await service.user.get(userSession.user.id);
  }

  return { props: { user } };
};

export default function Page({ user }: Props) {
  return (
    <div className="flex flex-col items-start text-start px-6 py-12 max-w-2xl mx-auto">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold mb-4">Pricing for Withsy</h2>
        <p className="text-base leading-relaxed mb-6">
          Enjoy Withsy’s fast, free chats—perfect for everyone! To keep our
          servers running smoothly, we currently limit usage to 30 chats per
          day.
        </p>

        {/* Free Tier Card */}
        <div className="border rounded-lg p-6 mb-6 w-full">
          <h3 className="text-xl font-semibold">Free Plan</h3>
          <p className="text-2xl font-bold mt-2">
            $0<span className="text-sm font-normal">/month</span>
          </p>
          <ul className="my-4 space-y-2 text-sm">
            <li>✓ Up to 30 chats per day</li>
            <li>✓ Fast, reliable responses</li>
            <li>✓ Access to core Withsy features</li>
          </ul>
          <ResponsiveButton
            user={user}
            size="default"
            message="Try Withsy Free"
          />
        </div>

        {/* Future Plans */}
        <h3 className="text-xl font-semibold mb-2">
          Premium Plans (Coming Soon)
        </h3>
        <p className="text-base leading-relaxed mb-6">
          We’re working on paid plans with access to advanced models like GPT-4
          and Claude, plus higher usage limits for power users.
        </p>
        <form className="flex gap-2">
          <input
            type="email"
            placeholder="Enter your email for updates"
            className="border rounded px-3 py-2 w-full"
          />
          <button className="bg-[rgb(40,90,128)] text-white px-4 py-2 rounded hover:bg-black">
            Join Waitlist
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          Questions?{" "}
          <a href="/contact" className="text-[rgb(40,90,128)] hover:underline">
            Contact us
          </a>{" "}
          for more info.
        </div>
      </div>
    </div>
  );
}
