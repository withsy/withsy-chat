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
        <a
          href="https://app.termly.io/notify/9b1a8d6a-2bea-462c-a1af-16b9ec4a3cc7"
          target="_blank"
        >
          DSAR Request
        </a>
        <a href="/dpa" target="_blank">
          DPA
        </a>
        <a href="/privacy-policy.html" target="_blank">
          Privacy Policy
        </a>
        <a href="/cookie-policy.html" target="_blank">
          Cookie Policy
        </a>
        <a href="/terms-of-service.html" target="_blank">
          Terms of Service
        </a>
      </footer>
    </div>
  );
}
