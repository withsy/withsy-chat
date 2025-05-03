import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModelAvatar } from "@/components/ModelAvatar";
import { toast } from "sonner";
import CropImageModal from "./CropImageModal";
import { base64ToFile } from "@/lib/avatar-utils";
import { useAiProfileStore } from "@/stores/useAiProfileStore";

type Props = {
  model: string;
  name?: string;
  image?: string;
};

export default function ModelCard({ model, name, image }: Props) {
  const [newName, setNewName] = useState(name ?? "");
  const [loading, setLoading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const { setProfile } = useAiProfileStore();

  const handleSave = async () => {
    if (newName.trim().length < 1) {
      toast.error("Name must be at least 1 character.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("model", model);
      form.append("name", newName.trim());

      const res = await fetch("/api/ai-profile", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Server responded with error");

      const updated = await res.json();
      setProfile(model, updated); // ✅ zustand 상태 동기화
      toast.success("Name updated");
    } catch (e) {
      toast.error("Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("Image must be under 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = () => {
    const fileInput = document.getElementById(
      `file-${model}`
    ) as HTMLInputElement;
    fileInput?.click();
  };

  const handleCropDone = async (croppedBase64: string) => {
    setLoading(true);
    try {
      const file = base64ToFile(croppedBase64, `${model}.jpg`);

      const form = new FormData();
      form.append("model", model);
      form.append("name", newName.trim());
      form.append("image", file);

      const res = await fetch("/api/ai-profile", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Server responded with error");

      const updated = await res.json();
      setProfile(model, updated); // ✅ 상태 갱신
      toast.success("Image updated");
    } catch (e) {
      toast.error("Failed to update image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-xl p-4 flex items-center gap-4">
      <div className="cursor-pointer" onClick={handleImageClick}>
        {image ? (
          <Avatar className="w-16 h-16">
            <AvatarImage src={image} alt={model} />
            <AvatarFallback>{model.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        ) : (
          <ModelAvatar size="xl" name={model} />
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="font-semibold">{model}</div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={`What would you like to call ${model}? (Max 20 characters)`}
            value={newName}
            onChange={(e) => {
              if (e.target.value.length <= 20) setNewName(e.target.value);
            }}
            maxLength={20}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={loading || newName.trim().length < 1}
          >
            Save
          </Button>
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          id={`file-${model}`}
          onChange={handleImageChange}
        />
      </div>

      {/* Crop Modal */}
      {imageToCrop && (
        <CropImageModal
          open={cropModalOpen}
          imageUrl={imageToCrop}
          onClose={() => setCropModalOpen(false)}
          onCropDone={handleCropDone}
        />
      )}
    </div>
  );
}
