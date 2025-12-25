import type { ChatData } from "@/common-schemas";
import { getChatTypeIcon } from "@/components/chat/ChatTypeIcon";
import { ConfirmDeleteModal } from "@/components/modal/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatDelete, useChatUpdate } from "@/hooks/useChat";
import { useUserPreference } from "@/hooks/useUser";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { EllipsisVertical, Pencil, Star, StarOff, Trash2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

export function SidebarChatItem({
  chat,
  isSidebar,
}: {
  chat: ChatData;
  isSidebar?: boolean;
}) {
  const router = useRouter();
  const { setOpenDrawer } = useDrawerStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(chat.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isMobile, setCollapsed } = useSidebarStore();
  const themeColor = useUserPreference("themeColor");
  const chatDelete = useChatDelete();
  const chatUpdate = useChatUpdate();

  const isActive = router.asPath === `/chat/${chat.id}`;
  const chatType = chat.type;

  const isHoveredOrDropdown = `${isActive && isSidebar && "bg-white"} ${
    isDropdownOpen && "bg-white"
  }`;
  const iconClassName = `opacity-100 transition-opacity ${
    isDropdownOpen ? "opacity-0" : "group-hover:opacity-0"
  }`;
  const mobileClassName = isMobile ? "px-2.5 py-3" : "px-2.5 py-1.5";
  const dropdownItemClassName = isMobile ? "text-lg py-2" : "";

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
      router.push(`/chat/${chat.id}`);
    }
  };

  const handleTitleSave = () => {
    if (editedTitle.trim() !== chat.title) {
      const newTitle = editedTitle.trim();
      chatUpdate.mutate({
        chatId: chat.id,
        title: newTitle,
      });
    }
    setEditMode(false);
  };

  const handleToggleStar = () => {
    chatUpdate.mutate({
      chatId: chat.id,
      isStarred: !chat.isStarred,
    });
  };

  const dropdownItems = [
    {
      label: chat.isStarred ? "StarOff" : "Star",
      icon: chat.isStarred ? StarOff : Star,
      className: dropdownItemClassName,
      onClick: handleToggleStar,
    },
    {
      label: "Rename",
      icon: Pencil,
      className: dropdownItemClassName,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditMode(true);
        setIsDropdownOpen(false);
      },
    },
    {
      label: "Delete",
      icon: Trash2,
      className: `text-red-500 ${dropdownItemClassName}`,
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
      className={`group relative flex items-center gap-2 px-2 no-underline ${mobileClassName} cursor-pointer rounded-md transition-colors select-none hover:bg-white active:bg-white ${isHoveredOrDropdown}`}
    >
      <div
        className={`flex min-w-0 flex-1 items-center gap-2 group-hover:font-semibold active:font-semibold`}
        onClick={handleLinkClick}
      >
        <div className="relative flex h-5 w-5 items-center justify-center">
          {getChatTypeIcon(chatType, iconClassName)}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStar();
            }}
            className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Star
              size={16}
              className="transition-colors"
              style={
                chat.isStarred
                  ? {
                      fill: `rgb(${themeColor})`,
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
            className="text-foreground flex-1 rounded border bg-white px-1 py-0.5"
          />
        ) : (
          <span className="text-foreground flex-1 truncate">
            {isSidebar
              ? chat.title
              : (() => {
                  const limit = isMobile ? 10 : 20;
                  const title =
                    chat.title.length > limit
                      ? `${chat.title.slice(0, limit)}...`
                      : chat.title;
                  return title;
                })()}
          </span>
        )}
      </div>

      {!editMode &&
        (isMobile ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 bg-transparent p-0 transition-opacity hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(true);
              }}
            >
              <EllipsisVertical size={14} />
            </Button>
            <Dialog open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DialogContent className="w-[90%] max-w-xs">
                <DialogHeader>
                  <DialogTitle>Chat Options</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  {dropdownItems.map(
                    ({ label, icon: Icon, onClick, className, iconClass }) => (
                      <button
                        key={label}
                        onClick={(e) => {
                          onClick(e);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex items-center rounded-md px-3 py-2 text-left hover:bg-gray-100 ${
                          className ?? ""
                        }`}
                      >
                        <Icon size={16} className={`mr-2 ${iconClass ?? ""}`} />
                        {label}
                      </button>
                    ),
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <DropdownMenu
            open={isDropdownOpen}
            onOpenChange={(open) => setIsDropdownOpen(open)}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 bg-transparent p-0 transition-opacity hover:bg-transparent"
                onClick={(e) => e.stopPropagation()}
              >
                <EllipsisVertical size={14} />
              </Button>
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
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}

      {showDeleteModal && (
        <ConfirmDeleteModal
          open={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);

            chatDelete.mutateAsync({ chatId: chat.id }).then(() => {
              if (isActive) {
                router.push("/chat");
              }
            });
          }}
          isPending={chatDelete.isPending}
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
