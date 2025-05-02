import Cropper, { type Area } from "react-easy-crop";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { getCroppedImg } from "@/lib/avatar-utils";

type Props = {
  open: boolean;
  imageUrl: string;
  onClose: () => void;
  onCropDone: (croppedBase64: string) => void;
};

export default function CropImageModal({
  open,
  imageUrl,
  onClose,
  onCropDone,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleDone = async () => {
    const base64 = await getCroppedImg(imageUrl, croppedAreaPixels);
    onCropDone(base64);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[400px] h-[500px]">
        <div className="relative w-full h-[400px] bg-gray-200 rounded-md overflow-hidden">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={handleDone}>Apply</Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
