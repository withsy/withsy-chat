import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Schema } from "@/types/user-prompt";
import { MoreVertical, Star } from "lucide-react";

interface PromptsTableProps {
  prompts: Schema[];
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  themeColor: string;
}

export function PromptsTable({
  prompts,
  onToggleStar,
  onDelete,
  onEdit,
  themeColor,
}: PromptsTableProps) {
  return (
    <div className="overflow-x-auto">
      <div className="border rounded-md" style={{ width: "auto" }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Prompt</TableHead>
              <TableHead className="font-semibold">Last Edited</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow
                key={prompt.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (
                    target.closest("button") ||
                    target.closest("[data-ignore-row-click]")
                  ) {
                    return;
                  }
                  onEdit(prompt.id);
                }}
                className="cursor-pointer hover:bg-muted"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleStar(prompt.id)}
                      className="flex items-center justify-center hover:text-yellow-500 transition-colors w-5 h-5"
                      data-ignore-row-click
                    >
                      {prompt.isStarred ? (
                        <Star
                          className="w-4 h-4 text-black"
                          style={{ fill: `rgb(${themeColor})` }}
                        />
                      ) : (
                        <Star className="w-4 h-4 text-black" />
                      )}
                    </button>
                    <span className="text-sm">{prompt.title}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[400px] truncate">
                  {prompt.text}
                </TableCell>
                <TableCell>{prompt.updatedAt.toLocaleString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        data-ignore-row-click
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(prompt.id)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(prompt.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
