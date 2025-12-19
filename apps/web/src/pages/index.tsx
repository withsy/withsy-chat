import BranchHistory from "@/components/home/BranchHistory";
import { Hero } from "@/components/home/Hero";
import PromptTransparency from "@/components/home/PromptTransparency";
import SaveStar from "@/components/home/SaveStar";
import ThemeAndPrefsSection from "@/components/home/ThemeAndPrefs";

function Page() {
  return (
    <div>
      <Hero />
      <ThemeAndPrefsSection />
      <PromptTransparency />
      <SaveStar />
      <BranchHistory />
    </div>
  );
}

(Page as any).layoutType = "home";
export default Page;
