import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Star,
  AlignJustify,
  StarOff,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatDateLabel } from "@/lib/date-utils";
import { useState } from "react";
import SidebarBookmark from "./SidebarBookmark";

export default function SidebarChatList() {
  const [starred, setStarred] = useState(["Chat A", "Chat C"]);
  const chats = {
    "2025-04-07": ["Chat A", "Chat B"],
    "2025-04-06": ["Chat C"],
    "2025-04-05": ["Chat D", "Chat E"],
    "2025-04-04": ["Chat D", "Chat E"],
    "2025-04-03": ["Chat D", "Chat E"],
  };

  const toggleStar = (chat: string) => {
    setStarred((prev) =>
      prev.includes(chat) ? prev.filter((c) => c !== chat) : [...prev, chat]
    );
  };

  return (
    <Accordion
      type="multiple"
      defaultValue={["Starred", "Chats"]}
      className="mt-4 space-y-6"
    >
      <SidebarBookmark />
      {starred.length > 0 && (
        <AccordionItem value="Starred" className="border-none">
          <AccordionTrigger className="text-m font-semibold no-underline hover:bg-gray-300 hover:no-underline px-2 py-2 rounded-md transition-colors">
            Starred
          </AccordionTrigger>
          <AccordionContent className="space-y-1">
            {starred.map((chat) => (
              <SidebarChatItem
                key={`starred-${chat}`}
                chat={chat}
                isStarred
                onToggleStar={toggleStar}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      )}
      <AccordionItem value="Chats" className="border-none">
        <AccordionTrigger className="text-m font-semibold no-underline hover:bg-gray-300 hover:no-underline px-2 py-2 rounded-md transition-colors">
          Chats
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          {Object.entries(chats).map(([date, chats]) => {
            const filteredChats = chats.filter(
              (chat) => !starred.includes(chat)
            );
            if (filteredChats.length === 0) return null;

            return (
              <div key={date}>
                <div className="text-xs text-muted-foreground py-1 px-2 mb-1">
                  {formatDateLabel(date)}
                </div>
                {filteredChats.map((chat, idx) => (
                  <SidebarChatItem
                    key={`${date}-${idx}`}
                    chat={chat}
                    isStarred={false}
                    onToggleStar={toggleStar}
                  />
                ))}
              </div>
            );
          })}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function SidebarChatItem({
  chat,
  isStarred,
  onToggleStar,
}: {
  chat: string;
  isStarred: boolean;
  onToggleStar: (chat: string) => void;
}) {
  return (
    <div className="group flex items-center px-2 py-2 rounded-md hover:bg-gray-300 transition-colors">
      <div className="relative w-5 h-5 mr-2">
        <AlignJustify
          size={16}
          className="absolute top-0 left-0 text-muted-foreground opacity-100 group-hover:opacity-0 transition-opacity"
        />
        <button
          onClick={() => onToggleStar(chat)}
          className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Star
            size={16}
            className={
              isStarred ? "text-black fill-black" : "text-muted-foreground"
            }
          />
        </button>
      </div>

      <div className="flex justify-between items-center flex-1 pr-2">
        <span className="text-sm font-medium text-foreground">{chat}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuItem onClick={() => onToggleStar(chat)}>
              {isStarred ? (
                <>
                  <StarOff size={14} className="mr-2" />
                  Unstar
                </>
              ) : (
                <>
                  <Star size={14} className="mr-2" />
                  Star
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Pencil size={14} className="mr-2" />
              Rename
            </DropdownMenuItem>

            <DropdownMenuItem className="text-red-500">
              <Trash2 size={14} className="mr-2 text-red-500" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
