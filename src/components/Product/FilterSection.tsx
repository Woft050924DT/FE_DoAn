import { Search } from "lucide-react";

interface FilterSectionProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
  extraContent?: React.ReactNode;
}

export function ProductFilterSection({
  search,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  tabs,
  activeTab,
  onTabChange,
  extraContent,
}: FilterSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E0E0E0] p-4">
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-4 py-2 border border-[#E0E0E0] dark:border-[#374151] rounded-lg text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
          />
        </div>
        {extraContent}
      </div>

      <div className="flex gap-1 mt-3 overflow-x-auto">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => onTabChange(i)}
            className={`px-4 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
              activeTab === i ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
