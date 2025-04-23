import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/context/UserContext";

export function EnterToSendToggle() {
  const { userPrefs, setUserPrefsAndSave, userPrefLoadings } = useUser();
  const enterToSend = userPrefs["enterToSend"];
  const isLoading = userPrefLoadings["enterToSend"];

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Switch
        id="enter-toggle"
        checked={enterToSend ?? false}
        onCheckedChange={(v) => setUserPrefsAndSave({ enterToSend: v })}
        disabled={isLoading}
        style={{
          backgroundColor: enterToSend
            ? `rgb(${userPrefs.themeColor})`
            : undefined,
        }}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label htmlFor="enter-toggle" className="cursor-help">
              {enterToSend ? (
                <>
                  <KeyCap>↩︎</KeyCap>
                  <span className="text-xs text-gray-500">send</span>
                </>
              ) : (
                <>
                  <KeyCap>⇧↩︎</KeyCap>
                  <span className="text-xs text-gray-500">send</span>
                </>
              )}
            </Label>
          </TooltipTrigger>
          <TooltipContent side="top">
            {enterToSend
              ? "Press Enter to send message, Shift + Enter for a new line"
              : "Press Shift + Enter to send message, Enter for a new line"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function KeyCap({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-1 py-0.5 bg-gray-100 rounded border text-xs mx-1">
      {children}
    </span>
  );
}
