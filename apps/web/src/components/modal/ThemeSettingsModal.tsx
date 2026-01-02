import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useUserPreference } from "@/features/user/hooks/useUserPreference";
import { useUserUpdate } from "@/features/user/hooks/useUserUpdate";
import { useState } from "react";

const recommendedThemes = [
  { name: "Sunset Orange", color: "255,87,34", opacity: 0.2 },
  { name: "Mint Green", color: "0,200,150", opacity: 0.2 },
  { name: "Cotton Pink", color: "255,105,180", opacity: 0.2 },
  { name: "Lavender Haze", color: "128,90,213", opacity: 0.2 },
  { name: "Moonlight Shadow", color: "30,30,30", opacity: 0.0 },
  { name: "Ocean Blue", color: "0,123,255", opacity: 0.2 },
];

export function ThemeSettingsModal({
  open,
  setThemeModalOpen,
}: {
  open: boolean;
  setThemeModalOpen: (open: boolean) => void;
}) {
  const themeColor = useUserPreference("themeColor");
  const themeOpacity = useUserPreference("themeOpacity");
  const userUpdate = useUserUpdate();
  const [customColor, setCustomColor] = useState(themeColor);
  const [customOpacity, setCustomOpacity] = useState(themeOpacity);

  const handleApply = () => {
    userUpdate.mutate({
      preferences: {
        themeColor: customColor,
        themeOpacity: customOpacity,
      },
    });
    setThemeModalOpen(false);
  };

  const handleClose = () => {
    setThemeModalOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setThemeModalOpen}>
      <DialogContent
        className="z-[150] h-full max-h-[80%] w-full max-w-lg"
        aria-describedby="Customize the theme color and opacity for your application."
        style={{ pointerEvents: "auto" }}
        onPointerDownOutside={handleClose}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">THEME</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          <p id="theme-settings-description" className="sr-only">
            Customize the theme color and opacity for your application.
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 items-start gap-4">
              <div className="space-y-4">
                <div>
                  <Label>Custom Color</Label>
                  <input
                    type="color"
                    value={rgbToHex(customColor)}
                    onChange={(e) => setCustomColor(hexToRgb(e.target.value))}
                    className="mt-2 h-10 w-full cursor-pointer rounded-md"
                  />
                </div>
                <div>
                  <Label>Opacity ({customOpacity.toFixed(2)})</Label>
                  <Slider
                    className="mt-2"
                    value={[customOpacity]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([value]: [number]) =>
                      setCustomOpacity(value)
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Preview</Label>
                <div
                  className="mt-2 h-28 w-full rounded-md border"
                  style={{
                    backgroundColor: `rgba(${customColor}, ${customOpacity})`,
                  }}
                />
                <p className="text-muted-foreground mt-2 text-xs">
                  rgba({customColor}, {customOpacity.toFixed(2)})
                </p>
              </div>
            </div>
          </div>
          <div className="my-4 grid grid-cols-2 gap-4">
            {recommendedThemes.map((theme) => (
              <button
                key={theme.name}
                className="flex flex-col items-start rounded-xl border p-4 text-left hover:border-blue-500"
                style={{
                  backgroundColor: `rgba(${theme.color}, ${theme.opacity})`,
                }}
                onClick={() => {
                  setCustomColor(theme.color);
                  setCustomOpacity(theme.opacity);
                }}
              >
                <span className="mb-1 text-sm">{theme.name}</span>
                <span className="text-muted-foreground text-xs">
                  {theme.color} / {theme.opacity}
                </span>
              </button>
            ))}
          </div>
        </div>
        <Button
          onClick={handleApply}
          className="mt-4 w-full"
          style={{
            backgroundColor: `rgba(${themeColor})`,
          }}
        >
          SAVE
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function rgbToHex(rgb: string): string {
  const [r, g, b] = rgb.split(",").map((v) => parseInt(v.trim(), 10));
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "255,255,255";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(
    result[3],
    16,
  )}`;
}
