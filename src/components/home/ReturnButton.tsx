import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ReturnButton() {
  return (
    <Button
      size="sm"
      className="text-sm font-semibold cursor-pointer border-[rgb(40,90,128)] text-[rgb(40,90,128)]"
      variant="outline"
    >
      <Link href="/chat">Return to chat</Link>
    </Button>
  );
}
