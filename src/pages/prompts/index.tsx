import { PartialLoading } from "@/components/Loading";
import { EditPromptModal } from "@/components/prompts/EditPromptModal";
import { PromptsTable } from "@/components/prompts/PromptsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import type { Schema } from "@/types/user-prompt";

const samplePrompts = [
  {
    id: "1",
    title: "Email Reply Template",
    text: "Write a polite and professional reply to the email below.",
    isStarred: true,
    updatedAt: new Date("2025-03-01T10:00:00Z"),
  },
  {
    id: "2",
    title: "Brainstorm Ideas",
    text: "Help me brainstorm 10 creative ideas.",
    isStarred: false,
    updatedAt: new Date("2025-03-05T14:30:00Z"),
  },
];

export default function PromptsPage() {
  const { user } = useUser();
  if (!user) throw new Error("User must exist.");

  const { themeColor } = user.preferences;
  const [tab, setTab] = useState<"manage" | "add">("manage");
  const [prompts, setPrompts] = useState(samplePrompts);
  const [filter, setFilter] = useState("");
  const [editPrompt, setEditPrompt] = useState<Schema | null>(null);

  if (!user) {
    return <PartialLoading />;
  }

  return (
    <div className="p-6 select-none">
      <Tabs value={tab} onValueChange={(v) => setTab(v as "manage" | "add")}>
        <TabsList className="flex justify-center gap-2 bg-transparent">
          <TabsTrigger
            value="manage"
            className="text-xl font-semibold text-gray-400 data-[state=active]:text-black data-[state=active]:shadow-none"
          >
            Manage
          </TabsTrigger>
          <TabsTrigger
            value="add"
            className="text-xl font-semibold text-gray-400 data-[state=active]:text-black data-[state=active]:shadow-none"
          >
            Add
          </TabsTrigger>
        </TabsList>

        {/* Manage */}
        <TabsContent value="manage">
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Search by title or prompt..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <PromptsTable
              prompts={prompts.filter(
                (p) =>
                  p.title.toLowerCase().includes(filter.toLowerCase()) ||
                  p.text.toLowerCase().includes(filter.toLowerCase())
              )}
              onToggleStar={(id) => {
                setPrompts((prev) =>
                  prev.map((p) =>
                    p.id === id ? { ...p, isStar: !p.isStarred } : p
                  )
                );
              }}
              onDelete={(id) => {
                setPrompts((prev) => prev.filter((p) => p.id !== id));
              }}
              onEdit={(id) => {
                const found = prompts.find((p) => p.id === id);
                if (found) setEditPrompt(found);
              }}
              themeColor={themeColor}
            />
          </div>
        </TabsContent>

        {/* Add */}
        <TabsContent value="add">
          <form className="space-y-4 mt-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <Label>Title</Label>
              <Input placeholder="Enter title" required />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea placeholder="Enter prompt content" required />
            </div>
            <Button type="submit">Add Prompt</Button>
          </form>
        </TabsContent>
      </Tabs>

      {editPrompt && (
        <EditPromptModal
          prompt={editPrompt}
          onClose={() => setEditPrompt(null)}
          onSave={(updatedPrompt) => {
            setPrompts((prev) =>
              prev.map((p) => (p.id === updatedPrompt.id ? updatedPrompt : p))
            );
            setEditPrompt(null);
          }}
        />
      )}
    </div>
  );
}
