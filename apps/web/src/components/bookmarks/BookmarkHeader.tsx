type Props = {
  themeColor: string;
};

export function BookmarkHeader({ themeColor: _themeColor }: Props) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <h1 className="text-2xl font-semibold">All Saved</h1>
    </div>
  );
}
