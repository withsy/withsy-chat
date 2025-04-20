import { useUser } from "@/context/UserContext";
import { useEffect, type ReactNode } from "react";
import Header from "./Header";
import Main from "./Main";
import Sidebar from "./sidebar/Sidebar";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { userPrefs } = useUser();
  const themeColor = userPrefs.themeColor;
  const themeOpacity = userPrefs.themeOpacity;

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  return (
    <div
      className="flex overflow-hidden"
      style={{
        backgroundColor: `rgba(${themeColor}, ${themeOpacity})`,
        height: "calc(var(--vh, 1vh) * 100)",
      }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 h-full">
        <Header />
        <Main>{children}</Main>
      </div>
    </div>
  );
}
