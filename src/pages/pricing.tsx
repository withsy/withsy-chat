export default function Page() {
  return (
    <div className="flex flex-col items-start text-start px-6 py-12 max-w-2xl mx-auto select-none">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
        <p className="text-base leading-relaxed whitespace-pre-line">
          We want to keep Withsy free and fast for everyone. To manage server
          costs, daily usage is currently limited to 30 chats.{"\n\n"}
          In the future, we plan to offer paid options with access to GPT-4 and
          Claude,{"\n"}
          as well as higher usage limits for power users.
        </p>

        <div className="mt-6 text-sm text-muted-foreground">
          More details coming soon
        </div>
      </div>
    </div>
  );
}
