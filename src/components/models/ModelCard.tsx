import { ModelAvatar } from "@/components/ModelAvatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base64ToFile } from "@/lib/avatar-utils";
import { useTRPC } from "@/lib/trpc";
import { useAiProfileStore } from "@/stores/useAiProfileStore";
import type { Model } from "@/types/model";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import ConfirmResetModal from "./ConfirmResetModal";
import CropImageModal from "./CropImageModal";

type Props = {
  model: Model;
  name?: string;
  image?: string;
  csrfToken: string;
};

export default function ModelCard({ model, name, image, csrfToken }: Props) {
  const [newName, setNewName] = useState(name ?? "");
  const [loading, setLoading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { setProfile } = useAiProfileStore();

  const deleteImageMutation = useMutation(
    trpc.userAiProfile.deleteImage.mutationOptions({
      onSuccess: () => {
        toast.success("Profile image reset");
        queryClient.invalidateQueries(trpc.userAiProfile.getAll.queryFilter());
      },
      onError: () => {
        toast.error("Failed to reset profile image");
      },
      onSettled: () => {
        setLoading(false);
        setResetModalOpen(false);
      },
    })
  );

  const handleReset = () => {
    setLoading(true);
    deleteImageMutation.mutate({ model });
  };

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

      const res = await updateAiProfile({
        form,
        csrfToken,
      });

      const updated = await res.json();
      setProfile(model, updated);
      toast.success("Name updated");
    } catch (_e) {
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

      const res = await updateAiProfile({
        form,
        csrfToken,
      });

      const updated = await res.json();
      setProfile(model, updated);
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
          <ModelAvatar size="xl" name={name ?? model} />
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <div className="font-semibold">{model}</div>{" "}
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground hover:text-destructive"
            onClick={() => setResetModalOpen(true)}
          >
            Remove Custom Image
          </Button>
        </div>
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
            disabled={
              loading ||
              newName.trim().length < 1 ||
              newName.trim() === (name ?? "").trim()
            }
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

      {imageToCrop && (
        <CropImageModal
          open={cropModalOpen}
          imageUrl={imageToCrop}
          onClose={() => setCropModalOpen(false)}
          onCropDone={handleCropDone}
        />
      )}
      {resetModalOpen && (
        <ConfirmResetModal
          open={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          onConfirm={handleReset}
        />
      )}
    </div>
  );
}

async function updateAiProfile(input: { form: FormData; csrfToken: string }) {
  const { form, csrfToken } = input;

  const res = await fetch("/api/ai-profiles", {
    method: "POST",
    body: form,
    headers: {
      "Idempotency-Key": uuid(),
      "X-CSRF-Token": csrfToken,
    },
  });

  if (!res.ok) throw new Error("Server responded with error");

  return res;
}
