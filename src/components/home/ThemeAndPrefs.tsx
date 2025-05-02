// components/landing/ThemeAndPrefsSection.tsx
import Image from "next/image";

export default function ThemeAndPrefsSection() {
  return (
    <section className="py-16 px-4 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
        {/* Text Section */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl font-bold mb-4">Make It Yours</h2>
          <p className="text-muted-foreground text-lg mb-4">
            Choose from 6 beautiful presets — or go beyond. Adjust RGB color and
            opacity exactly the way you like. Not limited. Always yours.
          </p>

          <p className="text-muted-foreground text-lg mb-4">
            Personalize the experience with flexible layout and behavior
            settings.
          </p>

          <ul className="list-disc list-inside text-left text-base text-muted-foreground space-y-2">
            <li>
              <strong>Theme:</strong> 6 presets or fully custom color + opacity
            </li>
            <li>
              <strong>Text Size:</strong> Medium or Large
            </li>
            <li>
              <strong>Layout:</strong> Compact or Large View
            </li>
            <li>
              <strong>Enter Key Behavior:</strong> Send on Enter or Shift+Enter
            </li>
          </ul>
        </div>

        {/* Media Section */}
        <div className="w-full md:w-1/2 flex flex-col gap-6 items-center">
          <Image
            unoptimized
            src="/home/change-theme.gif"
            alt="Change Theme"
            width={600}
            height={350}
            className="rounded-xl shadow-md"
          />
          <Image
            unoptimized
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
