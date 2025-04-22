import { ConfirmDeleteModal } from "@/components/modal/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/context/UserContext";
import { trpc } from "@/lib/trpc";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type { Chat } from "@/types/chat";
import {
  EllipsisVertical,
  FolderRoot,
  GitBranch,
  Pencil,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

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
  const { setOpenDrawer } = useDrawerStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(chat.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { isMobile, setCollapsed } = useSidebarStore();
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
    if (editMode || (isActive && isMobile)) {
      if (isMobile) {
        setCollapsed(true);
      }
      return;
    }

    if (isSidebar) {
      if (isMobile) {
        setCollapsed(true);
      }
      setOpenDrawer(null);
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
              : (() => {
                  const limit = isMobile ? 10 : 20;
                  return chat.title.length > limit
                    ? `${chat.title.slice(0, limit)}...`
                    : chat.title;
                })()}
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
