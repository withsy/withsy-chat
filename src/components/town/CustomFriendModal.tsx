import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const fields = [
  {
    title: "What kind of personality do they have?",
    options: ["Kind", "Funny", "Calm", "Honest", "Cheerful", "Other"],
  },
  {
    title: "How do they usually speak?",
    options: ["Polite", "Casual", "Cheerful", "Serious", "Playful", "Other"],
  },
  {
    title: "What are their favorite things?",
    options: ["Gaming", "Music", "Art", "Fitness", "Reading", "Other"],
  },
  {
    title: "What role will they play in your life?",
    options: [
      "Good Listener",
      "Cheerleader",
      "Life Coach",
      "Daily Journal Buddy",
      "Other",
    ],
  },
  {
    title: "How do they like to communicate?",
    options: [
      "Short and Concise",
      "Long and Detailed",
      "Light with Jokes",
      "Serious Only",
      "Expressive",
      "Other",
    ],
  },
  {
    title: "What are their little habits or routines?",
    options: ["Morning Greeting", "Daily Quote", "Goal Reminder", "Other"],
  },
  {
    title: "What kind of relationship will you share?",
    options: [
      "Friend",
      "Older Sibling",
      "Younger Sibling",
      "Mentor",
      "Parent-like",
      "Other",
    ],
  },
];

export default function CustomFriendModal() {
  const [open, setOpen] = useState(false);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});

  const toggleOption = (field: string, option: string) => {
    const current = selections[field] || [];
    if (current.includes(option)) {
      const updated = current.filter((item) => item !== option);
      setSelections({ ...selections, [field]: updated });
      if (option === "Other") {
        setOtherTexts({ ...otherTexts, [field]: "" });
      }
    } else {
      setSelections({ ...selections, [field]: [...current, option] });
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="text-lg">
        Invite
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{"Let's Meet Your New Friend!"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {fields.map((field) => (
              <div key={field.title}>
                <h3 className="text-lg font-semibold mb-2">{field.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {field.options.map((option) => (
                    <Badge
                      key={option}
                      variant="outline"
                      className={`cursor-pointer ${
                        selections[field.title]?.includes(option)
                          ? "border-primary text-primary"
                          : "border-muted text-muted-foreground"
                      }`}
                      onClick={() => toggleOption(field.title, option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
                {selections[field.title]?.includes("Other") && (
                  <div className="mt-4">
                    <Textarea
                      placeholder={`Describe your friend's ${field.title.toLowerCase()}...`}
                      value={otherTexts[field.title] || ""}
                      onChange={(e) =>
                        setOtherTexts({
                          ...otherTexts,
                          [field.title]: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={() => setOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
