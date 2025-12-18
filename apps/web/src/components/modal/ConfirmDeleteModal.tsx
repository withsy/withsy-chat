import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePreferences } from "@/context/PreferencesContext";

export function ConfirmDeleteModal({
  open,
  title = "Delete Chat",
  description = "Are you sure you want to delete this chat? This action cannot be undone.",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { usePreference } = usePreferences();
  const themeColor = usePreference("themeColor");

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogPortal>
        <DialogContent className="z-[9999] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              style={{
                background: `rgb(${themeColor})`,
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
