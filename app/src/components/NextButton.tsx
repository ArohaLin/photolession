/** 通用「繼續」按鈕，手指友善尺寸 */
export function NextButton({
  onClick,
  label = '繼續 →',
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 min-h-12 rounded-full bg-sky-500 px-8 py-3 text-lg font-black text-white shadow-lg transition active:scale-95"
    >
      {label}
    </button>
  )
}
