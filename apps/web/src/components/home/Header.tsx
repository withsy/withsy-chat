import { useHeaderScroll } from "@/hooks/useHeaderScroll";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useRouter } from "next/router";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import CategoryButton from "./CategoryDrawerButton";
import ResponsiveButton from "./ResponsiveButton";

export default function Header() {
  const router = useRouter();
  const scrolled = useHeaderScroll();
  const { isMobile, hydrated: _hydrated } = useSidebarStore();

  const categories = [
    { label: "About", value: "about" },
    { label: "Guides", value: "guides" },
    { label: "Roadmap", value: "roadmap" },
    // { label: "Blog", value: "blog" },
    // { label: "Pricing", value: "pricing" },
    { label: "Contact", value: "contact" },
  ];

  // if (!hydrated) return null;

  return (
    <div
      className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${
        scrolled ? "border-b bg-white/80" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between p-2 px-4 select-none">
        <div
          className="flex cursor-pointer items-center gap-2 p-2"
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
                  className={`font-semibold transition-colors ${
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
          <ResponsiveButton />
          {isMobile && <CategoryButton categories={categories} />}
        </div>
      </div>
    </div>
  );
}
