// components/common/ExpandableImage.tsx
import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function ExpandableImage({
  src,
  alt,
  width = 360,
  height = 300,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="rounded-xl border shadow-sm cursor-zoom-in hover:opacity-80 transition"
        />
      </DialogTrigger>
      <DialogContent className="max-w-6xl p-0 overflow-hidden rounded-xl shadow-lg">
        <Image
          src={src}
          alt={alt}
          width={1000}
          height={800}
          className="w-full h-auto"
        />
      </DialogContent>
    </Dialog>
  );
}
