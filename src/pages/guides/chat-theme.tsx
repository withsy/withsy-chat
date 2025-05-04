import Image from "next/image";
import Link from "next/link";

export default function ChatThemeGuide() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl min-h-screen">
      <Link href="/guides">
        <p className="mb-6 text-center text-[rgb(40,90,128)] cursor-pointer hover:underline">
          Guides
        </p>
      </Link>
      <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
        Chat Theme Customization Guide
      </h1>

      {/* Introduction Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Introduction
        </h2>
        <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
          Customize the look and feel of your chat interface by selecting or
          creating a unique theme. This guide explains how to choose from preset
          themes or create a custom theme with your preferred colors and
          transparency.
        </p>
      </section>

      {/* How to Customize Section */}
      <section className="mb-12 border-b border-gray-200 pb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          How to Customize Your Chat Theme
        </h2>
        <ol className="list-decimal pl-6 space-y-6 text-gray-700 max-w-2xl mx-auto">
          <li>
            <strong className="text-gray-800">Access the Theme Settings</strong>
            <p>
              From the sidebar, click on your user profile area to open the
              dropdown menu. Select <em>Theme</em> to open the theme selection
              modal.
            </p>
            <Image
              src="/guides/select-theme.png"
              alt="Theme Selection Modal Screenshot"
              width={600}
              height={400}
              className="my-6 rounded-lg shadow-sm w-full max-w-md mx-auto"
            />
          </li>
          <li>
            <strong className="text-gray-800">
              Choose or Customize a Theme
            </strong>
            <p>
              In the theme selection modal, choose from six preset themes:{" "}
              <em>Moonlight Shadow</em>, <em>Ocean Blue</em>,{" "}
              <em>Sunset Orange</em>, <em>Mint Green</em>, <em>Cotton Pink</em>,
              or <em>Lavender Haze</em>. Alternatively, select custom colors and
              adjust transparency to create a personalized theme.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div>
                <Image
                  src="/guides/moonlight-shadow.png"
                  alt="Moonlight Shadow Theme Screenshot"
                  width={300}
                  height={200}
                  className="rounded-lg shadow-sm w-full"
                />
                <p className="text-center text-sm text-gray-600 mt-2">
                  Moonlight Shadow
                </p>
              </div>
              <div>
                <Image
                  src="/guides/ocean-blue.png"
                  alt="Ocean Blue Theme Screenshot"
                  width={300}
                  height={200}
                  className="rounded-lg shadow-sm w-full"
                />
                <p className="text-center text-sm text-gray-600 mt-2">
                  Ocean Blue
                </p>
              </div>
              <div>
                <Image
                  src="/guides/sunset-orange.png"
                  alt="Sunset Orange Theme Screenshot"
                  width={300}
                  height={200}
                  className="rounded-lg shadow-sm w-full"
                />
                <p className="text-center text-sm text-gray-600 mt-2">
                  Sunset Orange
                </p>
              </div>
            </div>
          </li>
        </ol>
      </section>

      {/* Video Tutorial Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Video Tutorial
        </h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Watch the video below for a step-by-step demonstration of how to
          customize your chat theme.
        </p>
        <div className="relative w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-sm transition-all duration-200">
          <iframe
            src="https://www.youtube.com/embed/PXhKY-XRvfo"
            title="Chat Theme Customization Tutorial"
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6 text-gray-700 max-w-2xl mx-auto">
          <div>
            <strong className="text-gray-800">
              Q: How many preset themes are available?
            </strong>
            <p>
              A: There are six preset themes: Moonlight Shadow, Ocean Blue,
              Sunset Orange, Mint Green, Cotton Pink, and Lavender Haze.
            </p>
          </div>
          <div>
            <strong className="text-gray-800">
              Q: Can I create a custom theme?
            </strong>
            <p>
              A: Yes, you can select custom colors and adjust transparency in
              the theme selection modal to create a unique theme.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
