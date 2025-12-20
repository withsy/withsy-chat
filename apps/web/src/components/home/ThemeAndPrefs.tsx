// components/landing/ThemeAndPrefsSection.tsx
import Image from "next/image";

export default function ThemeAndPrefsSection() {
  return (
    <section className="bg-white px-4 py-16 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-12 md:flex-row">
        {/* Text Section */}
        <div className="w-full text-center md:w-1/2 md:text-left">
          <h2 className="mb-4 text-3xl font-bold">Make It Yours</h2>
          <p className="text-muted-foreground mb-4 text-lg">
            Choose from 6 beautiful presets — or go beyond. Adjust RGB color and
            opacity exactly the way you like. Not limited. Always yours.
          </p>

          <p className="text-muted-foreground mb-4 text-lg">
            {
              "Personalize the experience with flexible layout and behavior settings. You can even choose your AI companion's profile image and name."
            }
          </p>

          <ul className="text-muted-foreground list-inside list-disc space-y-2 text-left text-base">
            <li>
              <strong>Theme:</strong> 6 presets or fully custom color + opacity
            </li>
            <li>
              <strong>AI Profile:</strong> Customize name and profile image
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
        <div className="flex w-full flex-col items-center gap-6 md:w-1/2">
          <Image
            unoptimized
            src="/home/change-theme.webp"
            alt="Change Theme"
            width={600}
            height={350}
            className="rounded-xl shadow-md"
            placeholder="blur"
            blurDataURL="/home/change-theme.jpg"
          />
          <Image
            unoptimized
            src="/home/userprefs.webp"
            alt="User Preferences"
            width={600}
            height={350}
            className="rounded-xl shadow-md"
            placeholder="blur"
            blurDataURL="/home/userprefs.jpg"
          />
        </div>
      </div>
    </section>
  );
}
