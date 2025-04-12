import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSidebar } from "@/context/SidebarContext";
import { useState } from "react";

const recommendedThemes = [
  { name: "Light", color: "255,255,255", opacity: 0.1 },
  { name: "Dark", color: "30,30,30", opacity: 0.15 },
  { name: "Ocean Blue", color: "0,123,255", opacity: 0.1 },
  { name: "Cotton Pink", color: "255,105,180", opacity: 0.1 },
  { name: "Sunset Orange", color: "255,87,34", opacity: 0.12 },
  { name: "Mint Green", color: "0,200,150", opacity: 0.1 },
];

export function ThemeSettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { userPrefs, setUserPrefAndSave } = useSidebar();
  const [customColor, setCustomColor] = useState(
    userPrefs.themeColor // TODO: || "255,255,255"
  );
  const [customOpacity, setCustomOpacity] = useState(userPrefs.themeOpacity);

  const handleApply = () => {
    setUserPrefAndSave("themeColor", customColor);
    setUserPrefAndSave("themeOpacity", customOpacity);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="text-xl">Theme Settings</DialogTitle>
        </DialogHeader>

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
              <span className="font-semibold text-sm mb-1">{theme.name}</span>
              <span className="text-xs text-muted-foreground">
                {theme.color} / {theme.opacity}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <Label>Custom Color (RGB)</Label>
            <Input
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              placeholder="e.g. 255,255,255"
            />
          </div>
          <div>
            <Label>Opacity ({customOpacity})</Label>
            <Slider
              value={[customOpacity]}
              min={0}
              max={0.5}
              step={0.01}
              onValueChange={([value]: [number]) => setCustomOpacity(value)}
            />
          </div>
          <Button onClick={handleApply} className="w-full mt-4">
            Save Theme
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
