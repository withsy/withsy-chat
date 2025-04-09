export function BookmarkFilters() {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select className="border p-2 rounded">
        <option value="latest">Latest</option>
        <option value="oldest">Oldest</option>
      </select>

      <select className="border p-2 rounded">
        <option value="all">Chats + Threads</option>
        <option value="chat">Chat</option>
        <option value="thread">Thread</option>
      </select>

      <select className="border p-2 rounded">
        <option value="all">All Models</option>
        <option value="gpt-4">GPT-4</option>
        <option value="gpt-3.5">GPT-3.5</option>
        {/* etc... */}
      </select>
    </div>
  );
}
