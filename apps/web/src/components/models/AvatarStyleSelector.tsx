import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useAvatarStyleStore } from "@/stores/useAvatarStyleStore";
import { ConfirmAvatarStyleModal } from "./ConfirmAvatarStyleModal";
import Image from "next/image";

const avatarStyles = [
  { id: "thumbs", label: "Thumbs" },
  { id: "notionists", label: "Notionists" },
  { id: "micah", label: "Micah" },
  { id: "open-peeps", label: "Open Peeps" },
  { id: "pixel-art", label: "Pixel Art" },
  { id: "bottts", label: "Bottts" },
];

export function AvatarStyleSelector() {
  const { user, setUserPrefsAndSave } = useUser();
  const currentStyle = useAvatarStyleStore((s) => s.style);
  const setStyle = useAvatarStyleStore((s) => s.setStyle);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  if (!user) return null;

  const newStyleLabel =
    avatarStyles.find((s) => s.id === selectedStyle)?.label ?? "";

  const confirmStyleChange = () => {
    if (selectedStyle && selectedStyle !== currentStyle) {
      setStyle(selectedStyle); // zustand
      setUserPrefsAndSave({ avatarStyle: selectedStyle }); // 서버 반영
    }
    setSelectedStyle(null);
  };

  return (
    <>
      <div className="mb-6 flex flex-row items-center space-x-2">
        <div className="flex flex-wrap gap-3">
          {avatarStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`relative h-12 w-12 overflow-hidden rounded-full border transition hover:scale-105 ${
                currentStyle === style.id
                  ? "ring-primary ring-2"
                  : "opacity-50 hover:opacity-100"
              }`}
              aria-label={`Select ${style.label}`}
            >
              <Image
                src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=preview`}
                alt={style.label}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {selectedStyle && (
        <ConfirmAvatarStyleModal
          open={true}
          newStyleLabel={newStyleLabel}
          onConfirm={confirmStyleChange}
          onCancel={() => setSelectedStyle(null)}
        />
      )}
    </>
  );
}
