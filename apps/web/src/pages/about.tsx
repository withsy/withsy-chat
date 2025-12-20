import { Avatar, AvatarImage } from "@/components/ui/avatar";

function Page() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-12 md:flex-row md:items-start md:gap-10">
      {/* Avatar on the left */}
      <div className="flex shrink-0 flex-col items-center">
        <Avatar className="h-24 w-24 rounded-full border md:h-32 md:w-32">
          <AvatarImage
            src="/characters/sara.svg"
            alt="Withsy Sara, our friendly guide"
          />
        </Avatar>
      </div>

      {/* Description on the right */}
      <div className="text-center md:text-left">
        <h2 className="mb-4 text-3xl font-bold">About Withsy</h2>
        <p className="mb-6 text-base leading-relaxed">
          Withsy is your home for thoughtful, user-focused tools. Starting with
          Withsy Chat, we’re building a village of products that are gentle,
          customizable, and designed to grow with you. Our mission is to create
          technology that listens, adapts, and stays by your side.
        </p>

        {/* Key Values */}
        <div className="mb-6 rounded-lg border p-6">
          <h3 className="mb-2 text-xl font-semibold">Our Philosophy</h3>
          <ul className="space-y-2 text-base leading-relaxed">
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

(Page as any).layoutType = "home";
export default Page;
