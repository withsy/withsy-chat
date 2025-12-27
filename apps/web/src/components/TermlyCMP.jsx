import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SCRIPT_SRC_BASE = "https://app.termly.io";

export default function TermlyCMP({
  autoBlock,
  masterConsentsOrigin,
  websiteUUID,
}) {
  const src = new URL(SCRIPT_SRC_BASE);
  src.pathname = `/resource-blocker/${websiteUUID}`;
  if (autoBlock) {
    src.searchParams.set("autoBlock", "on");
  }
  if (masterConsentsOrigin) {
    src.searchParams.set("masterConsentsOrigin", masterConsentsOrigin);
  }
  const scriptSrc = src.toString();

  const isScriptAdded = useRef(false);

  useEffect(() => {
    if (isScriptAdded.current) return;
    const script = document.createElement("script");
    script.src = scriptSrc;
    document.head.appendChild(script);
    isScriptAdded.current = true;
  }, [scriptSrc]);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.Termly?.initialize();
  }, [pathname, searchParams]);

  return null;
}
