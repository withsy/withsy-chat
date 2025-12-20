import { type ReactNode } from "react";
import BmcWidget from "../BmcWidget";
import Header from "../home/Header";

type LayoutProps = {
  children: ReactNode;
  className: string;
};

export default function HomeLayout({ children, className }: LayoutProps) {
  return (
    <div className={`flex min-h-screen flex-col ${className}`}>
      <Header />
      <div>
        <main>{children}</main>
        <BmcWidget />
      </div>
      <footer className="text-muted-foreground flex flex-wrap justify-center gap-x-4 gap-y-2 p-4 text-center text-xs select-none">
        <div>© {new Date().getFullYear()} Withsy. All rights reserved.</div>
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
        <a href="/license" target="_blank">
          License
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
