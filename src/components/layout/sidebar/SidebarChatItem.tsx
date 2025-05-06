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
import { useUser } from "@/context/UserContext";
import { useTRPC } from "@/lib/trpc";
import { useChatStore } from "@/stores/useChatStore";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type * as Chat from "@/types/chat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EllipsisVertical, Pencil, Star, StarOff, Trash2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

export function SidebarChatItem({
  chat,
  isSidebar,
  onChatUpdate,
}: {
  chat: Chat.Data;
  isSidebar?: boolean;
  onChatUpdate: (chat: Chat.Data) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setOpenDrawer } = useDrawerStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(chat.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { isMobile, setCollapsed } = useSidebarStore();
  const { user } = useUser();
  if (!user) throw new Error("User must exist.");

  const updateChatMut = useMutation(
    trpc.chat.update.mutationOptions({
      onMutate: () => queryClient.cancelQueries(trpc.chat.list.queryFilter()),
      onSuccess: () =>
        queryClient.invalidateQueries(trpc.chat.list.queryFilter()),
    })
  );
  const deleteChat = useMutation(
    trpc.chat.delete.mutationOptions({
      onMutate: () => queryClient.cancelQueries(trpc.chat.list.queryFilter()),
      onSuccess: () => {
        if (isActive) router.push("/chat");
        queryClient.invalidateQueries(trpc.chat.list.queryFilter());
      },
    })
  );

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
      updateChatMut.mutate(
        { chatId: chat.id, title: newTitle },
        {
          onSuccess: () => {
            const updatedChat = { ...chat, title: newTitle };
            onChatUpdate(updatedChat);

            const currentChat = useChatStore.getState().chat;
            if (currentChat?.id === chat.id) {
              useChatStore.getState().setChat(updatedChat);
            }
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
          queryClient.invalidateQueries(trpc.chat.list.queryFilter());
        },
      }
    );
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
      className={`group relative flex items-center gap-2 no-underline px-2 ${mobileClassName} select-none rounded-md transition-colors hover:bg-white cursor-pointer active:bg-white ${isHoveredOrDropdown}`}
    >
      <div
        className={`flex items-center gap-2 flex-1 min-w-0 group-hover:font-semibold active:font-semibold`}
        onClick={handleLinkClick}
      >
        <div className="w-5 h-5 flex items-center justify-center relative">
          {getChatTypeIcon(chatType, iconClassName)}
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
                      fill: `rgb(${user.preferences.themeColor})`,
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
              className="h-5 w-5 p-0 transition-opacity bg-transparent hover:bg-transparent"
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
                        className={`flex items-center px-3 py-2 rounded-md text-left hover:bg-gray-100 ${
                          className ?? ""
                        }`}
                      >
                        <Icon size={16} className={`mr-2 ${iconClass ?? ""}`} />
                        {label}
                      </button>
                    )
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <DropdownMenu onOpenChange={(open) => setIsDropdownOpen(open)}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 transition-opacity bg-transparent hover:bg-transparent"
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
                )
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
