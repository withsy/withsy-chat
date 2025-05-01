import { useUser } from "@/context/UserContext";
import { type ReactNode } from "react";
import Header from "../home/Header";

type LayoutProps = {
  children: ReactNode;
  className: string;
};

export default function HomeLayout({ children, className }: LayoutProps) {
  const { user } = useUser();

  return (
    <div className={`flex flex-col min-h-screen ${className}`}>
      <Header user={user} />
      <div className="pb-30">
        <main>{children}</main>
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
