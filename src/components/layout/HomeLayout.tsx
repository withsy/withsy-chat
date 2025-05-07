import { useUser } from "@/context/UserContext";
import { type ReactNode } from "react";
import Header from "../home/Header";
import { useEffect, useState } from "react";

type LayoutProps = {
  children: ReactNode;
  className: string;
};

export default function HomeLayout({ children, className }: LayoutProps) {
  const { user } = useUser();
  const [year, setYear] = useState<number>();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className={`flex flex-col min-h-screen ${className}`}>
      <Header user={user} />
      <div>
        <main>{children}</main>
      </div>
      <footer className="text-center text-xs text-muted-foreground p-4 select-none flex flex-row justify-center space-x-4">
        <div>© {year} Withsy. All rights reserved.</div>
        <a href="#" className="termly-display-preferences">
          Consent Preferences
        </a>
      </footer>
    </div>
  );
}
