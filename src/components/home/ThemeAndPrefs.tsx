// components/landing/ThemeAndPrefsSection.tsx
import Image from "next/image";

export default function ThemeAndPrefsSection() {
  return (
    <section className="py-16 px-4 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
        {/* Text */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl font-bold mb-4">Make It Yours</h2>
          <p className="text-muted-foreground text-lg mb-6">
            Customize your theme, layout, and preferences. Withsy remembers what
            you love and adapts to your style.
          </p>
        </div>

        {/* GIFs */}
        <div className="w-full md:w-1/2 flex flex-col gap-6 items-center">
          <Image
            src="/home/change-theme.gif"
            alt="Change Theme"
            width={600}
            height={350}
            className="rounded-xl shadow-md"
          />
          <Image
            src="/home/userprefs.gif"
            alt="User Preferences"
            width={600}
            height={350}
            className="rounded-xl shadow-md"
          />
        </div>
      </div>
    </section>
  );
}
