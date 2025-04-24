import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useUser } from "@/context/UserContext";
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
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { userPrefs, setUserPrefsAndSave } = useUser();
  const [customColor, setCustomColor] = useState(userPrefs.themeColor);
  const [customOpacity, setCustomOpacity] = useState(userPrefs.themeOpacity);

  const handleApply = () => {
    setUserPrefsAndSave({
      themeColor: customColor,
      themeOpacity: customOpacity,
    });
    onClose();
  };

  return (
    <div className="z-150">
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="z-[9999] max-w-lg max-h-[80%] w-full h-full">
          <DialogHeader>
            <DialogTitle className="text-xl">THEME</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 items-start">
                <div className="space-y-4">
                  <div>
                    <Label>Custom Color</Label>
                    <input
                      type="color"
                      value={rgbToHex(customColor)}
                      onChange={(e) => setCustomColor(hexToRgb(e.target.value))}
                      className="w-full h-10 rounded-md cursor-pointer mt-2"
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
                    className="w-full h-28 rounded-md border mt-2"
                    style={{
                      backgroundColor: `rgba(${customColor}, ${customOpacity})`,
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    rgba({customColor}, {customOpacity.toFixed(2)})
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 my-4">
              {recommendedThemes.map((theme) => (
                <button
                  key={theme.name}
                  className="rounded-xl p-4 border hover:border-blue-500 flex flex-col items-start text-left"
                  style={{
                    backgroundColor: `rgba(${theme.color}, ${theme.opacity})`,
                  }}
                  onClick={() => {
                    setCustomColor(theme.color);
                    setCustomOpacity(theme.opacity);
                  }}
                >
                  <span className="text-sm mb-1">{theme.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {theme.color} / {theme.opacity}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={handleApply}
            className="w-full mt-4 "
            style={{
              backgroundColor: `rgba(${userPrefs.themeColor}`,
            }}
          >
            SAVE
          </Button>
        </DialogContent>
      </Dialog>
    </div>
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
    16
  )}`;
}
