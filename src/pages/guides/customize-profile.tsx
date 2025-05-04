import Link from "next/link";

import dynamic from "next/dynamic";

const SafeImage = dynamic(() => import("next/image"), { ssr: false });

export default function CustomizeProfileGuide() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl min-h-screen">
      <Link
        href="/guides"
        className="mb-6 text-center text-[rgb(40,90,128)] cursor-pointer hover:underline block"
      >
        Guides
      </Link>
      <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
        AI Model Profile Customization Guide
      </h1>

      {/* Introduction Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Introduction
        </h2>
        <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
          Personalize your AI model by setting a custom name and profile image.
          This guide walks you through the steps to make your AI interactions
          more unique and engaging.
        </p>
      </section>

      {/* How to Customize Section */}
      <section className="mb-12 border-b border-gray-200 pb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          How to Customize Your AI Model Profile
        </h2>
        <ol className="list-decimal pl-6 space-y-6 text-gray-700 max-w-2xl mx-auto">
          <li>
            <strong className="text-gray-800">Go to the Models Section</strong>
            <p>
              Log in and navigate to the <em>Models</em> section from the
              sidebar.
            </p>
            <SafeImage
              src="/guides/models-section.png"
              alt="Models Section Screenshot"
              width={600}
              height={400}
              className="my-6 rounded-lg shadow-sm w-full max-w-md mx-auto"
            />
          </li>
          <li>
            <strong className="text-gray-800">Edit Profile</strong>
            <p>
              Click the profile image area to upload and crop a new image; the
              change will apply immediately without needing to click{" "}
              <em>Save</em>. To change the name, use the input field and click{" "}
              <em>Save</em> to apply the update. You can also click{" "}
              <em>Remove Custom Image</em> to revert to the default image.
            </p>
            <SafeImage
              src="/guides/edit-profile.png"
              alt="Edit Profile Screenshot"
              width={1700}
              height={276}
              className="my-6 rounded-lg shadow-sm w-full max-w-md mx-auto"
            />
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
          customize your AI model profile.
        </p>
        <div className="relative w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-sm transition-all duration-200">
          <iframe
            src="https://www.youtube.com/embed/TD7GXh6Hh9w"
            title="AI Model Profile Customization Tutorial"
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
              Q: What image formats are supported?
            </strong>
            <p>
              A: You can upload PNG or JPEG images, with a size limit of 1MB.
            </p>
          </div>
          <div>
            <strong className="text-gray-800">
              Q: How long can the model name be?
            </strong>
            <p>A: Model names can be up to 20 characters long.</p>
          </div>
          <div>
            <strong className="text-gray-800">
              Q: Can I revert to the default profile?
            </strong>
            <p>
              A: Yes, click <em>Remove Custom Image</em> in the edit profile
              section to restore the default image.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
