import { Button } from "@/components/ui/button";
import { AlignJustify } from "lucide-react";

interface Category {
  label: string;
  value: string;
}

export default function CategoryButton({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <Button
      size="sm"
      className="text-sm font-semibold cursor-pointer"
      style={{ backgroundColor: "rgb(40,90,128)" }}
    >
      <AlignJustify />
    </Button>
  );
}
