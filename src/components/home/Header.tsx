import { useHeaderScroll } from "@/hooks/useHeaderScroll";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type { UserData } from "@/types/user";
import { useRouter } from "next/router";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import CategoryModalButton from "./CategoryModalButton";
import ResponsiveButton from "./ResponsiveButton";

export default function Component({ user }: { user: UserData | null }) {
  const router = useRouter();
  const scrolled = useHeaderScroll();
  const { isMobile, hydrated } = useSidebarStore();

  const categories = [
    { label: "About", value: "about" },
    { label: "Guides", value: "guides" },
    { label: "Roadmap", value: "roadmap" },
    // { label: "Blog", value: "blog" },
    // { label: "Pricing", value: "pricing" },
    { label: "Contact", value: "contact" },
  ];

  if (!hydrated) return null;

  return (
    <div
      className={`w-full backdrop-blur-lg sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 border-b" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto p-2 px-4 flex justify-between items-center select-none">
        <div
          className="flex items-center gap-2 p-2 cursor-pointer"
          onClick={() => {
            router.push("/");
          }}
        >
          <Avatar className="mx-auto h-8 w-8">
            <AvatarImage src="/characters/emery.svg" alt="withsy logo" />
            <AvatarFallback>W</AvatarFallback>
          </Avatar>
          <div
            className="text-md font-bold"
            style={{ color: "rgb(40,90,128)" }}
          >
            Withsy
          </div>
        </div>

        {!isMobile && (
          <div className="flex gap-8">
            {categories.map((category) => {
              const isActive = router.pathname === `/${category.value}`;
              return (
                <button
                  key={category.value}
                  onClick={() => router.push(`/${category.value}`)}
                  className={`transition-colors font-semibold ${
                    isActive
                      ? "text-[rgb(40,90,128)]"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          <ResponsiveButton user={user} />
          {isMobile && <CategoryModalButton categories={categories} />}
        </div>
      </div>
    </div>
  );
}
