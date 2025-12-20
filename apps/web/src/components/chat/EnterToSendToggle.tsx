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
  const { user, setUserPrefsAndSave, userPrefLoadings } = useUser();
  if (!user) return null;

  const enterToSend = user.preferences.enterToSend;
  const isLoading = userPrefLoadings["enterToSend"];

  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <Switch
        id="enter-toggle"
        checked={enterToSend ?? false}
        onCheckedChange={(v) => setUserPrefsAndSave({ enterToSend: v })}
        disabled={isLoading}
        style={{
          backgroundColor: enterToSend
            ? `rgb(${user.preferences.themeColor})`
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
    <span className="mx-1 inline-block rounded border bg-gray-100 px-1 py-0.5 text-xs">
      {children}
    </span>
  );
}
