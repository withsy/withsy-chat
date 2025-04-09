import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function BookmarkFilters() {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">Latest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Chats + Threads</SelectItem>
          <SelectItem value="chat">Chat</SelectItem>
          <SelectItem value="thread">Thread</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Models</SelectItem>
          <SelectItem value="gpt-4">GPT-4</SelectItem>
          <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
