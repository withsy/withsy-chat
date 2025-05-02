import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlignJustify } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);

  const handleClick = async (value: string) => {
    setOpen(false); // 먼저 닫기
    await router.push(`/${value}`); // 그 다음 이동
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-sm font-semibold cursor-pointer border-[rgb(40,90,128)] text-[rgb(40,90,128)] bg-white"
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
              onClick={() => handleClick(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
