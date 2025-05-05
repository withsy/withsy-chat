import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function Page() {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 px-6 py-12 max-w-4xl mx-auto">
      {/* Avatar on the left */}
      <div className="flex flex-col items-center shrink-0">
        <Avatar className="w-24 h-24 md:w-32 md:h-32 border rounded-full">
          <AvatarImage
            src="/characters/sara.svg"
            alt="Withsy Sara, our friendly guide"
          />
        </Avatar>
      </div>

      {/* Description on the right */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold mb-4">About Withsy</h2>
        <p className="text-base leading-relaxed mb-6">
          Withsy is your home for thoughtful, user-focused tools. Starting with
          Withsy Chat, we’re building a village of products that are gentle,
          customizable, and designed to grow with you. Our mission is to create
          technology that listens, adapts, and stays by your side.
        </p>

        {/* Key Values */}
        <div className="border rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-2">Our Philosophy</h3>
          <ul className="text-base leading-relaxed space-y-2">
            <li>
              <strong>Gentle</strong>: Tools that feel intuitive and human.
            </li>
            <li>
              <strong>Customizable</strong>: Built to fit your unique needs.
            </li>
            <li>
              <strong>Yours</strong>: Designed to grow with you, always.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
