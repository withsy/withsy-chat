type Props = {
  themeColor: string;
};

export function BookmarkHeader({ themeColor: _themeColor }: Props) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h1 className="text-2xl font-bold">All Saved</h1>
    </div>
  );
}
