import ResponsiveButton from "@/components/home/ResponsiveButton";
import Link from "next/link";

export default function Page() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start px-6 py-12 text-start">
      <div className="text-center md:text-left">
        <h2 className="mb-4 text-3xl font-bold">Pricing for Withsy</h2>
        <p className="mb-6 text-base leading-relaxed">
          Enjoy Withsy’s fast, free chats—perfect for everyone! To keep our
          servers running smoothly, we currently limit usage to 30 chats per
          day.
        </p>

        {/* Free Tier Card */}
        <div className="mb-6 w-full rounded-lg border p-6">
          <h3 className="text-xl font-semibold">Free Plan</h3>
          <p className="mt-2 text-2xl font-bold">
            $0<span className="text-sm font-normal">/month</span>
          </p>
          <ul className="my-4 space-y-2 text-sm">
            <li>✓ Up to 30 chats per day</li>
            <li>✓ Fast, reliable responses</li>
            <li>✓ Access to core Withsy features</li>
          </ul>
          <ResponsiveButton size="default" message="Try Withsy Free" />
        </div>

        {/* Future Plans */}
        <h3 className="mb-2 text-xl font-semibold">
          Premium Plans (Coming Soon)
        </h3>
        <p className="mb-6 text-base leading-relaxed">
          We’re working on paid plans with access to advanced models like GPT-4
          and Claude, plus higher usage limits for power users.
        </p>

        <div className="mt-6 text-sm text-gray-600">
          Questions?{" "}
          <Link
            href="/contact"
            className="text-[rgb(40,90,128)] hover:underline"
          >
            Contact us
          </Link>{" "}
          for more info.
        </div>
      </div>
    </div>
  );
}
