import { PartialError } from "@/components/Error";
import { PartialLoading } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ConfirmDeleteModal } from "@/components/modal/ConfirmDeleteModal";
import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import { formatDateLabel, toNewest } from "@/lib/date-utils";
import { trpc } from "@/lib/trpc";
import type { Chat } from "@/types/chat";
import { skipToken } from "@tanstack/react-query";
import {
  Bookmark,
  EllipsisVertical,
  FolderRoot,
  GitBranch,
  Pencil,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SidebarTooltip } from "./SidebarTooltip";

export default function SidebarChatList() {
  const { userSession } = useUser();
  const utils = trpc.useUtils();
  const listChats = trpc.chat.list.useQuery(
    userSession ? undefined : skipToken
  );
  const updateChatMut = trpc.chat.update.useMutation();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!listChats.data) return;
    setChats(listChats.data);
  }, [listChats]);

  const updateChat = (updatedChat: Chat) => {
    const prev = chats;

    setChats((prev) =>
      prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat))
    );

    updateChatMut.mutate(
      {
        chatId: updatedChat.id,
        isStarred: updatedChat.isStarred,
        title: updatedChat.title,
      },
      {
        onError: () => setChats(prev),
        onSuccess: () => utils.chat.list.invalidate(),
      }
    );
  };

  if (listChats.isLoading) return <PartialLoading />;
  if (listChats.isError) return <PartialError message="loading chat list" />;
  if (!listChats.data) return <></>;

  const starred: Chat[] = [];
  const nonStarredMap: Map<string, Chat[]> = new Map();
  listChats.data.forEach((chat) => {
    if (chat.isStarred) {
      starred.push(chat);
    } else {
      const dateLabel = formatDateLabel(chat.updatedAt);
      if (!nonStarredMap.has(dateLabel)) nonStarredMap.set(dateLabel, []);
      nonStarredMap.get(dateLabel)?.push(chat);
    }
  });
  starred.sort((a, b) => toNewest(a.updatedAt, b.updatedAt));
  nonStarredMap.forEach((chats) =>
    chats.sort((a, b) => toNewest(a.updatedAt, b.updatedAt))
  );
  const orderedEntries = [...nonStarredMap.entries()].sort(([a], [b]) => {
    if (a === "Today") return -1;
    if (b === "Today") return 1;
    if (a === "Yesterday") return b === "Today" ? 1 : -1;
    if (b === "Yesterday") return a === "Today" ? -1 : 1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="mt-4 space-y-2 ">
      <SidebarTooltip
        id={"saved"}
        icon={Bookmark}
        fill={true}
        label={"All Saved"}
        size={16}
      />
      {/* <SidebarTooltip
        id={"archive"}
        icon={Archive}
        fill={true}
        label={"Archived"}
        size={16}
      /> */}
      {starred.length > 0 && (
        <div>
          <div className="py-1 px-2 mb-1 text-sm font-semibold select-none">
            Starred
          </div>
          <div className="space-y-1 mt-1">
            {starred.map((chat) => (
              <SidebarChatItem
                key={chat.id}
                chat={chat}
                isSidebar={true}
                onChatUpdate={updateChat}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="space-y-4 mt-1">
          {orderedEntries.map(([date, chats]) => {
            if (chats.length === 0) return null;

            return (
              <div key={date}>
                <div className="py-1 px-2 mb-1 text-sm font-semibold select-none">
                  {date}
                </div>
                {chats.map((chat) => (
                  <SidebarChatItem
                    key={chat.id}
                    chat={chat}
                    isSidebar={true}
                    onChatUpdate={updateChat}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SidebarChatItem({
  chat,
  isSidebar,
  onChatUpdate,
}: {
  chat: Chat;
  isSidebar?: boolean;
  onChatUpdate: (chat: Chat) => void;
}) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(chat.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { isMobile, setCollapsed } = useSidebar();
  const { userPrefs } = useUser();

  const utils = trpc.useUtils();
  const updateChatMut = trpc.chat.update.useMutation({
    onMutate: () => utils.chat.list.cancel(),
    onSuccess: () => utils.chat.list.invalidate(),
  });
  const deleteChat = trpc.chat.delete.useMutation({
    onMutate: () => utils.chat.list.cancel(),
    onSuccess: () => {
      if (isActive) router.push("/chat");
      utils.chat.list.invalidate();
    },
  });

  const isActive = router.asPath === `/chat/${chat.id}`;
  const chatType = chat.type;

  const isHoveredOrDropdown = `${
    isDropdownOpen || isActive || isSidebar == undefined ? "font-semibold" : ""
  } ${isDropdownOpen && "bg-white"}`;
  const iconClassName = `opacity-100 transition-opacity ${
    isDropdownOpen ? "opacity-0" : "group-hover:opacity-0"
  }`;
  const mobileClassName = isMobile ? "py-3" : "py-2";

  const handleLinkClick = () => {
    if (isActive) return;
    if (editMode) return;
    if (isSidebar == true) {
      if (isMobile) {
        setCollapsed(true);
      }
      router.push(`/chat/${chat.id}?messageId=last`);
    }
  };

  const handleTitleSave = () => {
    if (editedTitle.trim() !== chat.title) {
      updateChatMut.mutate(
        { chatId: chat.id, title: editedTitle },
        {
          onSuccess: () => {
            const updatedChat = { ...chat, title: editedTitle };
            if (onChatUpdate) onChatUpdate(updatedChat);
          },
        }
      );
    }
    setEditMode(false);
  };

  const handleToggleStar = () => {
    const updatedChat = { ...chat, isStarred: !chat.isStarred };
    onChatUpdate(updatedChat);

    updateChatMut.mutate(
      { chatId: chat.id, isStarred: updatedChat.isStarred },
      {
        onError: () => {
          onChatUpdate(chat);
        },
        onSuccess: () => {
          utils.chat.list.invalidate();
        },
      }
    );
  };

  const dropdownItems = [
    {
      label: chat.isStarred ? "StarOff" : "Star",
      icon: chat.isStarred ? StarOff : Star,
      className: isMobile ? "text-lg py-2" : "",
      onClick: handleToggleStar,
    },
    {
      label: "Rename",
      icon: Pencil,
      className: isMobile ? "text-lg py-2" : "",
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditMode(true);
        setIsDropdownOpen(false);
      },
    },
    {
      label: "Delete",
      icon: Trash2,
      className: `text-red-500 ${isMobile ? "text-lg py-2" : ""}`,
      iconClass: "text-red-500",
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDropdownOpen(false);
        setShowDeleteModal(true);
      },
    },
  ];

  return (
    <div
      className={`group relative flex items-center gap-2 no-underline px-2 ${mobileClassName} select-none rounded-md transition-colors hover:bg-white cursor-pointer active:bg-white ${isHoveredOrDropdown}`}
    >
      <div
        className={`flex items-center gap-2 flex-1 min-w-0 group-hover:font-semibold active:font-semibold`}
        onClick={handleLinkClick}
      >
        <div className="w-5 h-5 flex items-center justify-center relative">
          {chatType == "chat" ? (
            <FolderRoot size={16} className={iconClassName} />
          ) : (
            <GitBranch size={16} className={iconClassName} />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStar();
            }}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Star
              size={16}
              className="transition-colors"
              style={
                chat.isStarred
                  ? {
                      fill: `rgb(${userPrefs.themeColor})`,
                    }
                  : {}
              }
            />
          </button>
        </div>

        {editMode ? (
          <input
            autoFocus
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleTitleSave();
              } else if (e.key === "Escape") {
                setEditMode(false);
                setEditedTitle(chat.title);
              }
            }}
            onBlur={handleTitleSave}
            className="flex-1 px-1 py-0.5 border rounded bg-white text-foreground"
          />
        ) : (
          <span className="truncate text-foreground flex-1">
            {isSidebar
              ? chat.title
              : chat.title.length > 10
              ? `${chat.title.slice(0, 10)}...`
              : chat.title}
          </span>
        )}
      </div>

      <DropdownMenu onOpenChange={(open) => setIsDropdownOpen(open)}>
        <DropdownMenuTrigger asChild>
          {!editMode && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 transition-opacity bg-transparent hover:bg-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <EllipsisVertical size={14} />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="start"
          className="z-[9999]"
          sideOffset={4}
        >
          {dropdownItems.map(
            ({ label, icon: Icon, className, iconClass, onClick }) => (
              <DropdownItem
                key={label}
                label={label}
                Icon={Icon}
                onClick={onClick}
                className={className}
                iconClass={iconClass}
              />
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {showDeleteModal && (
        <ConfirmDeleteModal
          open={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            deleteChat.mutate({ chatId: chat.id });
          }}
        />
      )}
    </div>
  );
}

function DropdownItem({
  label,
  Icon,
  onClick,
  className,
  iconClass,
}: {
  label: string;
  Icon: React.ElementType;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  iconClass?: string;
}) {
  return (
    <DropdownMenuItem
      onClick={(e) => {
        onClick(e);
      }}
      className={`active:bg-gray-100 ${className ?? ""}`}
    >
      <Icon size={14} className={`mr-2 ${iconClass ?? ""}`} />
      {label}
    </DropdownMenuItem>
  );
}
