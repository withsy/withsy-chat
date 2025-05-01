import { User } from "@/types/user";
import Header from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import ThemeAndPrefsSection from "@/components/home/ThemeAndPrefs";

type Props = {
  user: User | null;
};

export default function Page({ user }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <div className="pb-30">
        <Hero />
        <ThemeAndPrefsSection />
      </div>
      <footer className="text-center text-xs text-muted-foreground p-4 select-none">
        <div>© {new Date().getFullYear()} Withsy. All rights reserved.</div>
        <div>
          Avatars generated using Thumbs by DiceBear, licensed under CC0 1.0.
        </div>
      </footer>
    </div>
  );
}
