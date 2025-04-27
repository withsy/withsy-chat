import { PartialLoading } from "@/components/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // shadcn dropdown
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import { MoreVertical, Star } from "lucide-react";
import { useState } from "react";

const samplePrompts: Prompt[] = [
  {
    id: "1",
    title: "Email Reply Template",
    content: "Write a polite and professional reply to the email below.",
    isDefault: false,
    isStar: true,
    preferredModel: "gpt-4o",
    createdAt: new Date("2025-03-01T10:00:00Z"),
    updatedAt: new Date("2025-03-01T10:00:00Z"),
  },
  {
    id: "2",
    title: "Brainstorm Ideas",
    content: "Help me brainstorm 10 creative ideas about the following topic.",
    isDefault: true,
    isStar: false,
    preferredModel: "gpt-4-turbo",
    createdAt: new Date("2025-03-05T14:30:00Z"),
    updatedAt: new Date("2025-03-05T14:30:00Z"),
  },
  {
    id: "3",
    title: "Summarize Article",
    content: "Summarize this article in a concise and clear way.",
    isDefault: false,
    isStar: false,
    preferredModel: "gemini-1.5-pro",
    createdAt: new Date("2025-03-10T09:15:00Z"),
    updatedAt: new Date("2025-03-10T09:15:00Z"),
  },
  {
    id: "4",
    title: "Daily Motivation",
    content: "Give me a short motivational quote for today.",
    isDefault: false,
    isStar: true,
    preferredModel: "gpt-4o",
    createdAt: new Date("2025-04-01T08:00:00Z"),
    updatedAt: new Date("2025-04-01T08:00:00Z"),
  },
  {
    id: "5",
    title: "Translate into French",
    content: "Translate the following text into natural French.",
    isDefault: false,
    isStar: false,
    preferredModel: "gpt-3.5-turbo",
    createdAt: new Date("2025-04-15T12:45:00Z"),
    updatedAt: new Date("2025-04-15T12:45:00Z"),
  },
];

type Prompt = {
  id: string;
  title: string;
  content: string;
  isDefault: boolean;
  isStar: boolean;
  preferredModel: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function PromptsPage() {
  const { user } = useUser();
  if (!user) throw new Error("User must exist.");

  const { themeColor } = user.preferences;
  const [tab, setTab] = useState<"manage" | "add">("manage");
  const [prompts, setPrompts] = useState<Prompt[]>(samplePrompts);
  const [filter, setFilter] = useState<string>("");

  if (!user) {
    return <PartialLoading />;
  }

  return (
    <div className="p-6 select-none">
      <Tabs
        defaultValue="manage"
        value={tab}
        onValueChange={(v) => setTab(v as "manage" | "add")}
      >
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
        {/* Manage Tab */}
        <TabsContent value="manage">
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Search by title or content..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Model</TableHead>
                    <TableHead className="font-semibold">Updated At</TableHead>
                    <TableHead className="font-semibold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prompts
                    .filter(
                      (p) =>
                        p.title.toLowerCase().includes(filter.toLowerCase()) ||
                        p.content.toLowerCase().includes(filter.toLowerCase())
                    )
                    .map((prompt) => (
                      <TableRow key={prompt.id}>
                        <TableCell className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPrompts((prev) =>
                                prev.map((p) =>
                                  p.id === prompt.id
                                    ? { ...p, isStar: !p.isStar }
                                    : p
                                )
                              );
                            }}
                            className="hover:text-yellow-500 transition-colors"
                          >
                            {prompt.isStar ? (
                              <Star
                                className="w-4 h-4 text-black"
                                style={{
                                  fill: `rgb(${themeColor})`,
                                }}
                              />
                            ) : (
                              <Star className="w-4 h-4 text-black" />
                            )}
                          </button>
                          {prompt.title}
                          {prompt.isDefault && <Badge>Default</Badge>}
                        </TableCell>
                        <TableCell>{prompt.preferredModel || "-"}</TableCell>
                        <TableCell>
                          {prompt.updatedAt.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  // handle edit
                                  console.log(`Edit ${prompt.title}`);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setPrompts((prev) =>
                                    prev.filter((p) => p.id !== prompt.id)
                                  );
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                              {prompt.isDefault ? (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setPrompts((prev) =>
                                      prev.map((p) =>
                                        p.id === prompt.id
                                          ? { ...p, isDefault: false }
                                          : p
                                      )
                                    );
                                  }}
                                >
                                  Remove Default
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setPrompts((prev) =>
                                      prev.map((p) =>
                                        p.id === prompt.id
                                          ? { ...p, isDefault: true }
                                          : p
                                      )
                                    );
                                  }}
                                >
                                  Make as Default
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Add Tab */}
        <TabsContent value="add">
          <form
            className="space-y-4 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              // handle add logic here
            }}
          >
            <div>
              <Label>Title</Label>
              <Input
                placeholder="Enter title"
                required
                // connect to your state
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                placeholder="Enter prompt content"
                required
                // connect to your state
              />
            </div>
            <div>
              <Label>Preferred Model (Optional)</Label>
              <Input
                placeholder="Enter preferred model"
                // connect to your state
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                // connect to your state
                className="w-4 h-4"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Always apply to every chat (Default Prompt)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isStar"
                // connect to your state
                className="w-4 h-4"
              />
              <Label htmlFor="isStar" className="cursor-pointer">
                Mark as Starred
              </Label>
            </div>
            <Button type="submit">Add Prompt</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
