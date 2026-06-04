export type BusinessFlowStep = 1 | 2 | 3 | 4;

const STEPS: { id: BusinessFlowStep; label: string }[] = [
  { id: 1, label: "Tạo sản phẩm" },
  { id: 2, label: "Nhập kho" },
  { id: 3, label: "Có tồn kho" },
  { id: 4, label: "Bán hàng" },
];

export function UIBusinessFlowSteps({ current }: { current: BusinessFlowStep }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-3 bg-[#F5F6FA] rounded-xl border border-[#E0E0E0] text-xs sm:text-sm">
      {STEPS.map((s, i) => (
        <span key={s.id} className="flex items-center gap-1.5 sm:gap-2">
          <span
            className={`px-2 py-0.5 rounded-md whitespace-nowrap ${
              current === s.id
                ? "bg-[#1565C0] text-white font-semibold"
                : current > s.id
                  ? "bg-[#E8F5E9] text-[#2E7D32] font-medium"
                  : "text-[#757575]"
            }`}
          >
            {s.label}
          </span>
          {i < STEPS.length - 1 && <span className="text-[#BDBDBD]">→</span>}
        </span>
      ))}
    </div>
  );
}
