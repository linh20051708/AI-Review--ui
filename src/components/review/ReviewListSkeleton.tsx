export default function ReviewListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Đang tải danh sách yêu cầu review...">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-[12px] border border-line bg-white p-4 animate-pulse"
        >
          {/* Header row: Context pills & status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 rounded bg-line/80" />
              <div className="h-5 w-24 rounded bg-line/60" />
            </div>
            <div className="h-6 w-20 rounded-full bg-line/70" />
          </div>

          {/* Title & file */}
          <div className="flex flex-col gap-1.5">
            <div className="h-5 w-3/4 rounded bg-line/90" />
            <div className="h-4 w-1/2 rounded bg-line/50" />
          </div>

          {/* Footer metadata & button placeholder */}
          <div className="flex items-center justify-between border-t border-line/60 pt-2.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-28 rounded bg-line/60" />
              <div className="h-4 w-20 rounded bg-line/40" />
            </div>
            <div className="h-10 w-28 rounded-[8px] bg-line/70" />
          </div>
        </div>
      ))}
    </div>
  )
}
