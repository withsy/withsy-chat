// import type { MessageData } from "@/common-schemas";
// import { useChatListBranch, useChatUpdate } from "@/hooks/useChat";
// import { useUserDefaultPromptTryGet } from "@/hooks/useUserDefaultPrompt";
// import { useUserPromptList } from "@/hooks/useUserPrompt";
// import { cn } from "@/lib/utils";
// import { useDrawerStore } from "@/stores/useDrawerStore";
// import { useSidebarStore } from "@/stores/useSidebarStore";
// import { useUserStore } from "@/stores/useUserStore";
// import { FolderGit2, FolderRoot, GitBranch } from "lucide-react";
// import { useRouter } from "next/router";
// import { useEffect, useMemo, useState } from "react";
// import { BookmarkCard } from "../bookmarks/BookmarkCard";
// import { PartialError } from "../Error";
// import { PartialLoading } from "../Loading";
// import { PromptCard } from "../prompts/PromptCard";
// import { Drawer, DrawerContent } from "../ui/drawer";
// import ChatDrawerHeader from "./ChatDrawerHeader";

// type ChatDrawerProps = {
//   savedMessages?: MessageData[];
// };

// export const ChatDrawer = ({ savedMessages }: ChatDrawerProps) => {
//   const router = useRouter();
//   const { isMobile } = useSidebarStore();

//   const { openDrawer, setOpenDrawer } = useDrawerStore();
//   const isDrawerOpen = !!openDrawer;

//   const currentChatId = useUserStore((s) => s.currentChatId);
//   const chatListBranch = useChatListBranch({
//     chatId: currentChatId,
//     enabled: !!currentChatId && openDrawer === "branches",
//   });

//   const [ready, setReady] = useState(false);

//   useEffect(() => {
//     const { parentId, ...restQuery } = router.query;
//     if (typeof parentId === "string") {
//       setOpenDrawer(parentId);
//       router.replace(
//         { pathname: router.pathname, query: restQuery },
//         undefined,
//         { shallow: true },
//       );
//     }
//   }, [router.query.parentId, setOpenDrawer, router]);

//   useEffect(() => {
//     if (isDrawerOpen) {
//       const timer = setTimeout(() => setReady(true), 50);
//       return () => clearTimeout(timer);
//     } else {
//       Promise.try(() => setReady(false));
//     }
//   }, [isDrawerOpen]);

//   const handleCloseDrawer = () => {
//     setOpenDrawer(null);
//   };

//   let body;
//   if (openDrawer == null) {
//     body = <div className="text-muted-foreground text-sm">No content</div>;
//   } else if (openDrawer === "saved") {
//     body = <SavedMessages />;
//   } else if (openDrawer === "branches") {
//     body = <Branches chatBranchList={chatBranchList} />;
//   } else if (openDrawer === "prompt") {
//     body = <Prompts />;
//   } else {
//     body = <div className="text-muted-foreground text-sm">No content</div>;
//   }

//   if (isMobile) {
//     return (
//       <Drawer
//         open={isDrawerOpen}
//         onOpenChange={(open) => {
//           if (!open) handleCloseDrawer();
//           else setOpenDrawer(openDrawer);
//         }}
//       >
//         <DrawerContent className="flex h-full flex-col rounded-t-2xl">
//           {ready && body}
//         </DrawerContent>
//       </Drawer>
//     );
//   }

//   return (
//     <div
//       className={cn(
//         "h-full pb-15 transition-all duration-300",
//         isDrawerOpen ? "w-[30%] border-l" : "w-0 overflow-hidden",
//       )}
//     >
//       <ChatDrawerHeader
//         openDrawer={openDrawer}
//         setOpenDrawer={handleCloseDrawer}
//       />
//       {body}
//     </div>
//   );
// };

// function Prompts() {
//   const currentChat = useUserStore((s) => s.chatMap.get(s.currentChatId));
//   const userPromptList = useUserPromptList();
//   const userDefaultPromptTryGet = useUserDefaultPromptTryGet();
//   const chatUpdate = useChatUpdate();

//   const { userPrompts, appliedPrompt, remainingPrompts, userDefaultPrompt } =
//     useMemo(() => {
//       const userPrompts =
//         userPromptList.data?.pages.flatMap((page) => page.items) ?? [];
//       const userDefaultPrompt = userDefaultPromptTryGet.data;

//       const appliedPrompt = userPrompts.find(
//         (x) => x.id === currentChat?.userPromptId,
//       );
//       const remainingPrompts =
//         userPrompts.filter(
//           (x) =>
//             x.id !== userDefaultPrompt?.userPromptId &&
//             x.id !== currentChat?.userPromptId,
//         ) ?? [];

//       return {
//         userPrompts,
//         appliedPrompt,
//         remainingPrompts,
//         userDefaultPrompt,
//       };
//     }, [currentChat, userPromptList.data, userDefaultPromptTryGet.data]);

//   if (!currentChat) {
//     return null;
//   }

//   if (userDefaultPromptTryGet.isPending || userPromptList.isPending) {
//     return <div>Loading...</div>;
//   }

//   const handleApplyPrompt = (promptId: string | null) => {
//     chatUpdate.mutate({
//       chatId: currentChat.id,
//       userPromptId: promptId,
//     });
//   };

//   return (
//     <div className="flex max-h-[100%] flex-col space-y-6 overflow-y-auto p-4 select-none">
//       <div className="space-y-2">
//         <p className="text-sm font-semibold text-black">Applied</p>
//         <p className="text-muted-foreground text-sm">
//           These prompts are currently applied to this chat.
//         </p>
//         {userDefaultPrompt?.userPromptId && (
//           <PromptCard
//             key={userDefaultPrompt.userPromptId}
//             prompt={userDefaultPrompt.userPrompt}
//             onClick={() => handleApplyPrompt(userDefaultPrompt.userPromptId)}
//             isDefault={true}
//             isActive={
//               userDefaultPrompt.userPromptId === currentChat.userPromptId
//             }
//           />
//         )}
//         {appliedPrompt &&
//           appliedPrompt.id !== userDefaultPrompt?.userPrompt?.id && (
//             <PromptCard
//               key={appliedPrompt.id}
//               prompt={appliedPrompt}
//               onClick={() => handleApplyPrompt(appliedPrompt.id)}
//               isActive={true}
//             />
//           )}
//       </div>

//       {/* Prompts Section */}
//       {remainingPrompts.length > 0 && (
//         <div className="space-y-2">
//           <p className="text-sm font-semibold text-black">Prompts</p>
//           <p className="text-muted-foreground text-sm">
//             Click to apply a new prompt. It will replace the currently applied
//             prompt.
//           </p>

//           {remainingPrompts.map((prompt) => (
//             <PromptCard
//               key={prompt.id}
//               prompt={prompt}
//               onClick={() => handleApplyPrompt(prompt.id)}
//               isActive={false}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function SavedMessages({ messages }: { messages: MessageData[] }) {
//   if (messages.length === 0) {
//     return (
//       <div className="text-muted-foreground flex h-full w-full items-center justify-center">
//         No saved items yet.
//       </div>
//     );
//   }

//   return (
//     <div className="m-2 flex max-h-[100%] flex-col gap-y-4 overflow-y-auto bg-transparent">
//       <span className="text-sm select-none">
//         {"Here you can find the messages you've saved from this chat."}
//       </span>
//       {messages.map((msg) => (
//         <BookmarkCard
//           key={msg.id}
//           messageId={msg.id}
//           chatId={msg.chatId}
//           text={msg.text}
//           createdAt={msg.createdAt}
//           hideUnsave={true}
//         />
//       ))}
//     </div>
//   );
// }

// function Branches({ chatBranchList }: { chatBranchList: any }) {
//   const { chat } = useChatStore();
//   const router = useRouter();
//   if (chatBranchList.isLoading) {
//     return <PartialLoading />;
//   } else if (chatBranchList.isError) {
//     return <PartialError />;
//   } else if (chatBranchList.data) {
//     let originalChat;
//     if (chat && chat.type == "branch" && chat.parentMessage) {
//       const chatId = chat.parentMessage.chatId;
//       const messageId = chat.parentMessageId;
//       const parentMessageText = chat.parentMessage.text;
//       originalChat = (
//         <div className="m-2">
//           <div className="mb-3 flex items-center gap-2 text-sm font-semibold select-none">
//             <FolderRoot size={16} />
//             Original Chat
//           </div>
//           <span className="text-sm select-none">
//             You are viewing a branch. Tap below to go back to the original chat.
//           </span>
//           <div
//             key={chat.parentMessageId}
//             className="mt-2 flex items-center gap-2 border p-3 shadow-xs select-none hover:bg-gray-100 hover:font-semibold active:bg-gray-100 active:font-semibold"
//             onClick={() =>
//               router.push(`/chat/${chatId}?messageId=${messageId}`)
//             }
//             style={{
//               borderRadius: 10,
//             }}
//           >
//             <GitBranch size={16} />
//             {parentMessageText.length > 20
//               ? `${parentMessageText.slice(0, 20)}...`
//               : chat.parentMessage?.text}{" "}
//           </div>
//         </div>
//       );
//     }
//     if (chatBranchList.data.length == 0) {
//       if (originalChat) return originalChat;
//       return (
//         <div className="text-muted-foreground flex h-full w-full items-center justify-center">
//           No Branches Yet.
//         </div>
//       );
//     }
//     return (
//       <div className="m-2 flex max-h-[100%] flex-col gap-y-4 overflow-y-auto bg-transparent">
//         {originalChat}
//         <div className="flex items-center gap-2 text-sm font-semibold select-none">
//           <FolderGit2 size={16} />
//           Branch List
//         </div>
//         <span className="text-sm select-none">
//           Branches created from this chat. Tap to jump to a specific branch.
//         </span>
//         {chatBranchList.data.map((x: ChatData) => {
//           return (
//             <div
//               key={x.id}
//               className="flex items-center gap-2 border p-3 shadow-xs select-none hover:bg-gray-100 hover:font-semibold active:bg-gray-100 active:font-semibold"
//               onClick={() => router.push(`/chat/${x.id}`)}
//               style={{
//                 borderRadius: 10,
//               }}
//             >
//               <GitBranch size={16} />
//               {x.title.length > 20 ? `${x.title.slice(0, 20)}...` : x.title}
//             </div>
//           );
//         })}
//       </div>
//     );
//   }
//   return (
//     <div className="text-muted-foreground flex h-full w-full items-center justify-center">
//       No Branches Yet.
//     </div>
//   );
// }
