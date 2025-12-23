import BranchHistory from "@/components/home/BranchHistory";
import { Hero } from "@/components/home/Hero";
import PromptTransparency from "@/components/home/PromptTransparency";
import SaveStar from "@/components/home/SaveStar";
import ThemeAndPrefsSection from "@/components/home/ThemeAndPrefs";
import HomeLayout from "@/components/layout/HomeLayout";

export default function Page() {
  return (
    <HomeLayout>
      <Hero />
      <ThemeAndPrefsSection />
      <PromptTransparency />
      <SaveStar />
      <BranchHistory />
    </HomeLayout>
  );
}
