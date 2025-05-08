import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { AlignJustify } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import clsx from "clsx"; // className 조건부 조합용 (선택 사항)

interface Category {
  label: string;
  value: string;
}

export default function CategoryButton({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleClick = async (value: string) => {
    setOpen(false);
    await router.push(`/${value}`);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-sm font-semibold cursor-pointer border-[rgb(40,90,128)] text-[rgb(40,90,128)] bg-white"
        >
          <AlignJustify />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="p-4 pb-12">
        <DrawerHeader>
          <DrawerTitle>Select Category</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4 mt-2">
          {categories.map((category) => {
            const isActive = router.pathname === `/${category.value}`;
            return (
              <Button
                key={category.value}
                variant="ghost"
                className={clsx(
                  "justify-start text-lg py-2",
                  isActive ? "bg-gray-100 font-semibold" : "active:bg-gray-200"
                )}
                onClick={() => handleClick(category.value)}
              >
                {category.label}
              </Button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
