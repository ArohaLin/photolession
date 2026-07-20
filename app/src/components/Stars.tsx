/** 星星評等顯示（最多 3 顆） */
export function Stars({ n, max = 3, size = 'text-3xl' }: { n: number; max?: number; size?: string }) {
  return (
    <div className={`flex justify-center gap-1 ${size}`} aria-label={`${n} 顆星`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < n ? '' : 'opacity-25 grayscale'}>
          ⭐
        </span>
      ))}
    </div>
  )
}
