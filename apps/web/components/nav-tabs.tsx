export function FeedTabs() {
  return (
    <div className="tab-container">
      <div className="flex items-center gap-4 border-b border-nobelBlack-200 tab-wrapper-width mx-auto">
        <button className="h-7 text-blue-200 text-sm font-medium border-b border-blue-600">Discover</button>
        <button className="h-7 text-black-200 text-sm font-medium">Trending</button>
      </div>
    </div>
  );
}
