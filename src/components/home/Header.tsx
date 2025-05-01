import { useHeaderScroll } from "@/hooks/useHeaderScroll";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type { User } from "@/types/user";
import { useRouter } from "next/router";
import LoginButton from "../login/LoginButton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import CategoryModalButton from "./CategoryModalButton";
import ReturnButton from "./ReturnButton";

export default function Component({ user }: { user: User | null }) {
  const router = useRouter();
  const scrolled = useHeaderScroll();
  const { isMobile } = useSidebarStore();

  const categories = [
    {
      label: "Why?",
      value: "why",
    },
    {
      label: "Withsy Chat",
      value: "withsy-chat",
    },
    {
      label: "Blog",
      value: "blog",
    },
  ];
  return (
    <div
      className={`w-full bg-white/70 backdrop-blur-lg sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b" : ""
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
          <div className="flex gap-8 text-muted-foreground">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => router.push(`/${category.value}`)}
                className="hover:text-primary transition-colors font-semibold"
              >
                {category.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          {user ? <ReturnButton /> : <LoginButton />}
          {isMobile && <CategoryModalButton categories={categories} />}
        </div>
      </div>
    </div>
  );
}
