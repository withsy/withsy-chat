import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Props = {
  title: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  onSubmit: (title: string) => void;
};

export function EditTitleModal({ title, open, setOpen, onSubmit }: Props) {
  const [value, setValue] = useState(title);

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Chat Title</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Enter new title"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
