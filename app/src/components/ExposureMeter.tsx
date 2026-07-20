/** 亮度計：0–1.6 的橫條，中間綠色是「剛剛好」區，黑色指針是目前亮度 */
export function ExposureMeter({ value, target }: { value: number; target: [number, number] }) {
  const MAX = 1.6
  const pct = (v: number) => `${Math.min(100, Math.max(0, (v / MAX) * 100))}%`
  const inBand = value >= target[0] && value <= target[1]
  return (
    <div className="mt-3">
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="absolute inset-y-0 bg-green-300"
          style={{ left: pct(target[0]), width: `calc(${pct(target[1])} - ${pct(target[0])})` }}
        />
        <div
          className="absolute inset-y-0 w-1.5 -translate-x-1/2 rounded bg-slate-800"
          style={{ left: pct(value) }}
        />
      </div>
      <p className={`mt-1 text-center text-sm font-black ${inBand ? 'text-green-600' : 'text-slate-400'}`}>
        {inBand ? '亮度剛剛好 ✓' : value < target[0] ? '太暗' : '太亮'}
      </p>
    </div>
  )
}
