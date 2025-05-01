import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlignJustify } from "lucide-react";
import { useRouter } from "next/router";

interface Category {
  label: string;
  value: string;
}

export default function CategoryModalButton({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="text-sm font-semibold cursor-pointer"
          style={{ backgroundColor: "rgb(40,90,128)" }}
        >
          <AlignJustify />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[90vw] max-w-sm">
        <DialogHeader />
        <div className="flex flex-col gap-8 mt-2 mb-4">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant="ghost"
              className="justify-start text-lg py-2 active:bg-gray-200"
              onClick={() => router.push(`/${category.value}`)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
