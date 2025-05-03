import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useAvatarStyleStore } from "@/stores/useAvatarStyleStore";
import { ConfirmAvatarStyleModal } from "./ConfirmAvatarStyleModal";

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
      <div className="space-x-2 flex flex-row items-center mb-6">
        <div className="flex gap-3 flex-wrap">
          {avatarStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`relative border rounded-full w-12 h-12 overflow-hidden transition hover:scale-105 ${
                currentStyle === style.id
                  ? "ring-2 ring-primary"
                  : "opacity-50 hover:opacity-100"
              }`}
              aria-label={`Select ${style.label}`}
            >
              <img
                src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=preview`}
                alt={style.label}
                className="w-full h-full"
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
