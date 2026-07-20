import { CropView } from './CropView'

/** 概念示意圖（手繪風 SVG）：抽象觀念用畫的比用照片更清楚。各課以 step.art 代號引用。 */

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <svg viewBox="0 0 320 200" className="w-full" role="img">
        {children}
      </svg>
    </div>
  )
}

/** 曝光階梯：太暗 → 剛剛好 → 太亮 */
function ExposureLadder() {
  const cell = (x: number, fill: string, face: string, label: string, sub: string) => (
    <g>
      <rect x={x} y={30} width={84} height={84} rx={12} fill={fill} stroke="#cbd5e1" strokeWidth={2} />
      <text x={x + 42} y={80} fontSize={34} textAnchor="middle">
        {face}
      </text>
      <text x={x + 42} y={134} fontSize={15} fontWeight="bold" textAnchor="middle" fill="#334155">
        {label}
      </text>
      <text x={x + 42} y={154} fontSize={11} textAnchor="middle" fill="#94a3b8">
        {sub}
      </text>
    </g>
  )
  return (
    <Wrap>
      {cell(14, '#1e293b', '🙀', '太暗', '吃的光太少')}
      {cell(118, '#fde68a', '😄', '剛剛好', '主角清楚')}
      {cell(222, '#ffffff', '🥵', '太亮', '白成一片')}
    </Wrap>
  )
}

/** 光的方向：畫出 👁️眼睛(你/相機)、☀️光源、●主角 三者的位置關係與明暗結果 */
function LightDirections() {
  const OBJ = 150
  /** 一列小場景：眼睛在左、主角在中、太陽位置變化、結果在主角正下方 */
  const row = (
    yC: number,
    name: string,
    result: string,
    sun: { x: number; y: number },
    ray: [number, number, number, number],
    obj: React.ReactNode,
  ) => (
    <g>
      <text x={12} y={yC - 34} fontSize={13} fontWeight="bold" fill="#0369a1">
        {name}
      </text>
      {/* 眼睛（你/相機） */}
      <text x={34} y={yC + 7} fontSize={22} textAnchor="middle">👁️</text>
      {/* 視線（虛線，眼睛看向主角） */}
      <line x1={52} y1={yC} x2={124} y2={yC} stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" />
      {obj}
      {/* 太陽＋光線 */}
      <text x={sun.x} y={sun.y} fontSize={20} textAnchor="middle">☀️</text>
      <line x1={ray[0]} y1={ray[1]} x2={ray[2]} y2={ray[3]} stroke="#f59e0b" strokeWidth={3} markerEnd="url(#ld)" />
      {/* 結果（主角正下方） */}
      <text x={OBJ} y={yC + 40} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#334155">
        {result}
      </text>
    </g>
  )
  return (
    <div className="mx-auto w-full max-w-xs">
      <svg viewBox="0 0 300 336" className="w-full" role="img">
        <text x={12} y={16} fontSize={11} fill="#94a3b8">
          👁️ 你（相機）　☀️ 光　● 主角
        </text>
        {/* 順光：太陽在你這邊 → 主角正面被照亮 */}
        {row(
          78,
          '順光（光在你背後）',
          '主角亮又清楚 ✅',
          { x: 34, y: 54 },
          [46, 60, 124, 70],
          <g>
            <circle cx={OBJ} cy={78} r={22} fill="#fcd34d" />
            <text x={OBJ} y={85} fontSize={18} textAnchor="middle">🙂</text>
          </g>,
        )}
        {/* 逆光：太陽在主角後面 → 主角面向你的那面變黑（剪影） */}
        {row(
          172,
          '逆光（光在主角後面）',
          '主角變黑＝剪影 🌑',
          { x: 272, y: 178 },
          [258, 172, 176, 172],
          <g>
            <circle cx={OBJ + 2} cy={172} r={24} fill="#facc15" />
            <circle cx={OBJ} cy={172} r={22} fill="#334155" />
          </g>,
        )}
        {/* 側光：太陽在旁邊 → 一半亮一半暗 */}
        {row(
          266,
          '側光（光從旁邊來）',
          '一半亮一半暗',
          { x: 236, y: 236 },
          [224, 244, 172, 260],
          <g>
            <path d={`M${OBJ} 244 A22 22 0 0 0 ${OBJ} 288 Z`} fill="#64748b" />
            <path d={`M${OBJ} 244 A22 22 0 0 1 ${OBJ} 288 Z`} fill="#fcd34d" />
          </g>,
        )}
        <defs>
          <marker id="ld" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" fill="#f59e0b" />
          </marker>
        </defs>
      </svg>
    </div>
  )
}

/** 對焦：點螢幕，主角清楚、背景糊 */
function FocusTap() {
  return (
    <Wrap>
      {/* 手機外框 */}
      <rect x={90} y={16} width={140} height={168} rx={20} fill="#0f172a" />
      <rect x={98} y={24} width={124} height={152} rx={14} fill="#dbeafe" />
      {/* 背景（糊）—淡色圓 */}
      <circle cx={140} cy={70} r={16} fill="#93c5fd" opacity="0.6" />
      <circle cx={185} cy={130} r={20} fill="#93c5fd" opacity="0.6" />
      {/* 主角（清楚） */}
      <circle cx={160} cy={110} r={26} fill="#f59e0b" />
      <circle cx={160} cy={100} r={10} fill="#fcd34d" />
      {/* 對焦框 */}
      <rect x={135} y={85} width={50} height={50} fill="none" stroke="#fde047" strokeWidth={3} rx={4} />
      {/* 手指 */}
      <text x={158} y={150} fontSize={30}>👆</text>
      <text x={160} y={198} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#334155">
        點誰，誰就清楚！
      </text>
    </Wrap>
  )
}

/** 用光作畫：太陽拿畫筆 */
function PaintWithLight() {
  return (
    <Wrap>
      <circle cx={110} cy={95} r={42} fill="#fde047" />
      {[...Array(12)].map((_, i) => {
        const a = (i * Math.PI) / 6
        return (
          <line
            key={i}
            x1={110 + Math.cos(a) * 48}
            y1={95 + Math.sin(a) * 48}
            x2={110 + Math.cos(a) * 62}
            y2={95 + Math.sin(a) * 62}
            stroke="#facc15"
            strokeWidth={5}
            strokeLinecap="round"
          />
        )
      })}
      <text x={110} y={108} fontSize={34} textAnchor="middle">😊</text>
      {/* 畫筆與筆觸 */}
      <rect x={186} y={70} width={70} height={14} rx={7} fill="#f472b6" transform="rotate(20 186 70)" />
      <text x={250} y={120} fontSize={26}>🖌️</text>
      <text x={210} y={165} fontSize={14} fontWeight="bold" textAnchor="middle" fill="#334155">
        光＝照片的顏料
      </text>
    </Wrap>
  )
}

/** 光圈大小：大光圈(f/1.8) vs 小光圈(f/16) */
function ApertureSizes() {
  const iris = (cx: number, r: number, f: string, sub: string) => (
    <g>
      <circle cx={cx} cy={78} r={42} fill="#1e293b" />
      <circle cx={cx} cy={78} r={r} fill="#fde047" />
      <text x={cx} y={146} fontSize={16} fontWeight="bold" textAnchor="middle" fill="#0369a1">{f}</text>
      <text x={cx} y={166} fontSize={11} textAnchor="middle" fill="#64748b">{sub}</text>
    </g>
  )
  return (
    <Wrap>
      {iris(90, 34, 'f/1.8', '洞大大・進光多・背景糊')}
      {iris(230, 10, 'f/16', '洞小小・進光少・都清楚')}
    </Wrap>
  )
}

/** 景深：淺景深（只有主角清楚）vs 深景深（都清楚） */
function DepthOfField() {
  return (
    <Wrap>
      {/* 淺景深 */}
      <g>
        <circle cx={40} cy={90} r={20} fill="#f59e0b" />
        <circle cx={90} cy={70} r={14} fill="#cbd5e1" opacity="0.6" />
        <circle cx={128} cy={95} r={11} fill="#cbd5e1" opacity="0.5" />
        <text x={84} y={140} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#0369a1">淺景深</text>
        <text x={84} y={158} fontSize={10} textAnchor="middle" fill="#64748b">f/1.8・背景糊</text>
      </g>
      <line x1={165} y1={40} x2={165} y2={150} stroke="#e2e8f0" strokeWidth={2} />
      {/* 深景深 */}
      <g>
        <circle cx={205} cy={90} r={20} fill="#f59e0b" />
        <circle cx={252} cy={70} r={14} fill="#f59e0b" />
        <circle cx={290} cy={95} r={11} fill="#f59e0b" />
        <text x={248} y={140} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#0369a1">深景深</text>
        <text x={248} y={158} fontSize={10} textAnchor="middle" fill="#64748b">f/16・都清楚</text>
      </g>
    </Wrap>
  )
}

/** 快門：快門快＝凍結 vs 快門慢＝拖影 */
function ShutterSpeed() {
  return (
    <Wrap>
      {/* 快 */}
      <g>
        <circle cx={80} cy={78} r={22} fill="#38bdf8" />
        <text x={80} y={132} fontSize={14} fontWeight="bold" textAnchor="middle" fill="#0369a1">1/1000 秒</text>
        <text x={80} y={152} fontSize={11} textAnchor="middle" fill="#64748b">凍結！超清楚</text>
      </g>
      {/* 慢 */}
      <g>
        {[0, 1, 2, 3].map((k) => (
          <circle key={k} cx={190 + k * 18} cy={78} r={20} fill="#38bdf8" opacity={0.2 + k * 0.2} />
        ))}
        <text x={230} y={132} fontSize={14} fontWeight="bold" textAnchor="middle" fill="#0369a1">1 秒</text>
        <text x={230} y={152} fontSize={11} textAnchor="middle" fill="#64748b">拖影～會糊掉</text>
      </g>
    </Wrap>
  )
}

/** ISO：低 ISO 乾淨 vs 高 ISO 雜訊 */
function IsoNoise() {
  return (
    <Wrap>
      <g>
        <rect x={22} y={40} width={110} height={80} rx={10} fill="#93c5fd" />
        <text x={77} y={140} fontSize={14} fontWeight="bold" textAnchor="middle" fill="#0369a1">ISO 100</text>
        <text x={77} y={160} fontSize={11} textAnchor="middle" fill="#64748b">乾淨、滑順</text>
      </g>
      <g>
        <rect x={188} y={40} width={110} height={80} rx={10} fill="#93c5fd" />
        {Array.from({ length: 60 }).map((_, k) => (
          <circle
            key={k}
            cx={196 + ((k * 37) % 94)}
            cy={48 + ((k * 53) % 64)}
            r={1.6}
            fill={k % 2 ? '#1e293b' : '#f8fafc'}
            opacity={0.7}
          />
        ))}
        <text x={243} y={140} fontSize={14} fontWeight="bold" textAnchor="middle" fill="#0369a1">ISO 3200</text>
        <text x={243} y={160} fontSize={11} textAnchor="middle" fill="#64748b">雜訊顆粒多</text>
      </g>
    </Wrap>
  )
}

/** 曝光三角：光圈＋快門＋ISO 合力決定亮度 */
function ExposureTriangle() {
  return (
    <Wrap>
      <polygon points="160,34 262,150 58,150" fill="#fef3c7" stroke="#f59e0b" strokeWidth={3} />
      <text x={160} y={100} fontSize={15} fontWeight="black" textAnchor="middle" fill="#b45309">曝光</text>
      <text x={160} y={28} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#0369a1">🔵 光圈</text>
      <text x={44} y={168} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#0369a1">⏱️ 快門</text>
      <text x={276} y={168} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#0369a1">🔆 ISO</text>
    </Wrap>
  )
}

/** 色溫：暖／中性／冷 */
function ColorTemp() {
  const sw = (x: number, fill: string, label: string, sub: string) => (
    <g>
      <rect x={x} y={40} width={80} height={70} rx={12} fill={fill} />
      <text x={x + 40} y={132} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#334155">{label}</text>
      <text x={x + 40} y={152} fontSize={10} textAnchor="middle" fill="#94a3b8">{sub}</text>
    </g>
  )
  return (
    <Wrap>
      {sw(18, '#fdba74', '暖', '日出・日落')}
      {sw(120, '#f8fafc', '中性', '中午')}
      {sw(222, '#93c5fd', '冷', '陰天・傍晚')}
    </Wrap>
  )
}

/** 變焦：手機背面三顆「大小不同」的鏡頭（越長焦鏡頭越大） */
function ZoomLenses() {
  const lens = (cx: number, r: number, x: string, sub: string) => (
    <g>
      <circle cx={cx} cy={64} r={r} fill="#0f172a" />
      <circle cx={cx} cy={64} r={r - 5} fill="#334155" />
      <circle cx={cx} cy={64} r={r - 12} fill="#0ea5e9" />
      <circle cx={cx - r / 3} cy={64 - r / 3} r={r / 5} fill="#bae6fd" opacity="0.9" />
      <text x={cx} y={118} fontSize={16} fontWeight="black" textAnchor="middle" fill="#0369a1">{x}</text>
      <text x={cx} y={136} fontSize={10} textAnchor="middle" fill="#64748b">{sub}</text>
    </g>
  )
  return (
    <Wrap>
      {/* 手機背板 */}
      <rect x={40} y={18} width={240} height={92} rx={16} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={2} />
      {lens(90, 16, '0.5x', '超廣角')}
      {lens(160, 22, '1x', '主鏡頭')}
      {lens(232, 30, '3x', '長焦')}
      <text x={160} y={158} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">手機背後藏著好幾顆鏡頭</text>
    </Wrap>
  )
}

/** 變焦取景：同一個場景，0.5x 裝很多、1x 剛好、3x 拉最近 */
function ZoomFraming() {
  const scene = (x: number, treeScale: number, label: string) => (
    <g>
      <rect x={x} y={30} width={84} height={84} rx={8} fill="#dbeafe" stroke="#94a3b8" strokeWidth={2} />
      {/* 太陽 */}
      <circle cx={x + 18} cy={48} r={7} fill="#fcd34d" />
      {/* 樹（主角）大小隨倍率變 */}
      <rect x={x + 42 - 4 * treeScale} y={92 - 44 * treeScale} width={8 * treeScale} height={44 * treeScale} fill="#92400e" />
      <circle cx={x + 42} cy={92 - 44 * treeScale} r={14 * treeScale} fill="#22c55e" />
      <text x={x + 42} y={132} fontSize={14} fontWeight="black" textAnchor="middle" fill="#0369a1">{label}</text>
    </g>
  )
  return (
    <Wrap>
      {scene(14, 0.6, '0.5x')}
      {scene(118, 1.0, '1x')}
      {scene(222, 1.7, '3x')}
      <text x={160} y={158} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#64748b">同一棵樹，倍率越大主角越大</text>
    </Wrap>
  )
}

/** 光學 vs 數位變焦：清晰方格 vs 破碎馬賽克 */
function ZoomQuality() {
  return (
    <Wrap>
      <g>
        <rect x={26} y={36} width={100} height={80} rx={8} fill="#38bdf8" />
        <circle cx={76} cy={76} r={22} fill="#0ea5e9" />
        <circle cx={68} cy={68} r={6} fill="#e0f2fe" />
        <text x={76} y={140} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#16a34a">光學・清楚</text>
      </g>
      <g>
        {Array.from({ length: 40 }).map((_, k) => (
          <rect key={k} x={194 + (k % 8) * 12} y={36 + Math.floor(k / 8) * 16} width={12} height={16} fill={['#38bdf8', '#0ea5e9', '#7dd3fc', '#0284c7'][(k * 3) % 4]} />
        ))}
        <text x={242} y={140} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#f43f5e">數位・馬賽克</text>
      </g>
    </Wrap>
  )
}

/** 先用腳：走近拍畫質最好 */
function WalkCloser() {
  return (
    <Wrap>
      <text x={60} y={96} fontSize={30} textAnchor="middle">🚶</text>
      <path d="M84 88 L150 88" stroke="#22c55e" strokeWidth={3} strokeDasharray="6 4" markerEnd="url(#wc)" />
      <text x={196} y={92} fontSize={34} textAnchor="middle">🐱</text>
      <text x={160} y={140} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#16a34a">先用腳走近 → 畫質最好</text>
      <text x={160} y={160} fontSize={10} textAnchor="middle" fill="#64748b">不能靠近時，才交給 3x 長焦</text>
      <defs>
        <marker id="wc" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill="#22c55e" />
        </marker>
      </defs>
    </Wrap>
  )
}

/** 潛望鏡長焦：光轉個彎 */
function Periscope() {
  return (
    <Wrap>
      <rect x={40} y={70} width={200} height={40} rx={8} fill="#cbd5e1" />
      <rect x={240} y={40} width={40} height={70} rx={8} fill="#cbd5e1" />
      {/* 光線 */}
      <line x1={20} y1={90} x2={250} y2={90} stroke="#fcd34d" strokeWidth={4} markerEnd="url(#pz)" />
      <line x1={260} y1={90} x2={260} y2={44} stroke="#fcd34d" strokeWidth={4} markerEnd="url(#pz)" />
      {/* 稜鏡 */}
      <polygon points="248,78 272,78 260,102" fill="#a5b4fc" stroke="#6366f1" strokeWidth={2} />
      <text x={260} y={30} fontSize={16} textAnchor="middle">📷</text>
      <text x={150} y={140} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#0369a1">鏡頭橫躺＋稜鏡轉彎＝潛望鏡</text>
      <defs>
        <marker id="pz" markerWidth="7" markerHeight="7" refX="4" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 Z" fill="#f59e0b" />
        </marker>
      </defs>
    </Wrap>
  )
}

/** 防手震：手抖糊掉 vs 拿穩清楚 */
function SteadyHold() {
  return (
    <Wrap>
      <g>
        <text x={80} y={70} fontSize={30} textAnchor="middle">🤳</text>
        <path d="M50 96 q10 -8 20 0 t20 0" stroke="#f43f5e" strokeWidth={3} fill="none" />
        <circle cx={80} cy={120} r={14} fill="#93c5fd" opacity="0.5" />
        <circle cx={86} cy={120} r={14} fill="#93c5fd" opacity="0.5" />
        <text x={80} y={158} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#f43f5e">手抖 → 糊掉</text>
      </g>
      <g>
        <text x={240} y={70} fontSize={30} textAnchor="middle">🙌</text>
        <line x1={210} y1={96} x2={270} y2={96} stroke="#22c55e" strokeWidth={3} />
        <circle cx={240} cy={120} r={15} fill="#38bdf8" />
        <text x={240} y={158} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#16a34a">拿穩 → 清楚</text>
      </g>
    </Wrap>
  )
}

/** 三分法：井字九宮格＋交叉點，主角放在交叉點 */
function ThirdsGridArt() {
  return (
    <Wrap>
      <rect x={70} y={20} width={180} height={160} rx={8} fill="#e0f2fe" stroke="#cbd5e1" strokeWidth={2} />
      <line x1={130} y1={20} x2={130} y2={180} stroke="#ffffff" strokeWidth={2} />
      <line x1={190} y1={20} x2={190} y2={180} stroke="#ffffff" strokeWidth={2} />
      <line x1={70} y1={73} x2={250} y2={73} stroke="#ffffff" strokeWidth={2} />
      <line x1={70} y1={127} x2={250} y2={127} stroke="#ffffff" strokeWidth={2} />
      {[130, 190].flatMap((x) => [73, 127].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={4} fill="#94a3b8" />))}
      <circle cx={130} cy={73} r={16} fill="#f59e0b" />
      <text x={160} y={198} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#0369a1">主角放交叉點更好看</text>
    </Wrap>
  )
}

/** 色環＋互補色 */
function ColorWheel() {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']
  return (
    <Wrap>
      {colors.map((c, i) => {
        const a0 = (i / colors.length) * 2 * Math.PI - Math.PI / 2
        const a1 = ((i + 1) / colors.length) * 2 * Math.PI - Math.PI / 2
        const R = 56
        const cx = 160
        const cy = 90
        return (
          <path
            key={i}
            d={`M${cx} ${cy} L${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} A${R} ${R} 0 0 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} Z`}
            fill={c}
          />
        )
      })}
      <circle cx={160} cy={90} r={20} fill="#ffffff" />
      <line x1={160} y1={40} x2={160} y2={140} stroke="#334155" strokeWidth={2} strokeDasharray="4 3" />
      <text x={160} y={190} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#0369a1">對面的顏色最搭（互補色）</text>
    </Wrap>
  )
}

/** 計算攝影：連拍多張 → 合成一張最棒的 */
function Computational() {
  return (
    <Wrap>
      {[0, 1, 2].map((k) => (
        <rect key={k} x={30 + k * 10} y={50 + k * 10} width={70} height={54} rx={8} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={2} />
      ))}
      <text x={165} y={90} fontSize={26} textAnchor="middle">→</text>
      <rect x={210} y={55} width={84} height={64} rx={8} fill="#fde047" stroke="#f59e0b" strokeWidth={3} />
      <text x={252} y={95} fontSize={22} textAnchor="middle">✨</text>
      <text x={65} y={150} fontSize={11} textAnchor="middle" fill="#64748b">偷拍好幾張</text>
      <text x={252} y={150} fontSize={11} textAnchor="middle" fill="#64748b">合成最棒一張</text>
    </Wrap>
  )
}

/** 擦鏡頭：髒→霧 vs 乾淨→清楚 */
function LensClean() {
  return (
    <Wrap>
      <g>
        <circle cx={80} cy={78} r={40} fill="#93c5fd" />
        <circle cx={80} cy={78} r={40} fill="#f8fafc" opacity="0.6" />
        <circle cx={64} cy={66} r={5} fill="#cbd5e1" />
        <circle cx={96} cy={88} r={6} fill="#cbd5e1" />
        <text x={80} y={140} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#f43f5e">鏡頭髒 → 霧霧的</text>
      </g>
      <text x={160} y={84} fontSize={22} textAnchor="middle">🧻→</text>
      <g>
        <circle cx={240} cy={78} r={40} fill="#38bdf8" />
        <circle cx={224} cy={60} r={7} fill="#ffffff" opacity="0.85" />
        <text x={240} y={140} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#16a34a">擦乾淨 → 清楚！</text>
      </g>
    </Wrap>
  )
}

/** 古董拍照手機 */
function OldPhone() {
  return (
    <Wrap>
      <rect x={120} y={24} width={80} height={140} rx={12} fill="#334155" />
      <rect x={132} y={40} width={56} height={40} rx={4} fill="#7dd3fc" />
      <circle cx={160} cy={60} r={10} fill="#0f172a" />
      <circle cx={160} cy={60} r={5} fill="#38bdf8" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <circle key={`${r}-${c}`} cx={144 + c * 16} cy={100 + r * 16} r={5} fill="#64748b" />
        )),
      )}
      <text x={160} y={190} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#0369a1">2000 年・只有 0.1 百萬畫素</text>
    </Wrap>
  )
}

/** 配件總覽 */
function Accessories() {
  const item = (x: number, emoji: string, label: string) => (
    <g>
      <rect x={x} y={40} width={64} height={64} rx={12} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={2} />
      <text x={x + 32} y={82} fontSize={30} textAnchor="middle">{emoji}</text>
      <text x={x + 32} y={124} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#334155">{label}</text>
    </g>
  )
  return (
    <Wrap>
      {item(14, '📐', '腳架')}
      {item(90, '🤳', '自拍棒')}
      {item(166, '💡', '補光燈')}
      {item(242, '🧻', '拭鏡布')}
    </Wrap>
  )
}

/** 閃光燈打玻璃反光 */
function FlashReflection() {
  return (
    <Wrap>
      <rect x={90} y={30} width={140} height={110} rx={6} fill="#bae6fd" stroke="#7dd3fc" strokeWidth={3} />
      <line x1={160} y1={30} x2={160} y2={140} stroke="#7dd3fc" strokeWidth={2} />
      <circle cx={150} cy={80} r={26} fill="#ffffff" />
      <circle cx={150} cy={80} r={16} fill="#fef9c3" />
      {[...Array(8)].map((_, i) => {
        const a = (i * Math.PI) / 4
        return <line key={i} x1={150 + Math.cos(a) * 28} y1={80 + Math.sin(a) * 28} x2={150 + Math.cos(a) * 40} y2={80 + Math.sin(a) * 40} stroke="#fde047" strokeWidth={3} strokeLinecap="round" />
      })}
      <text x={40} y={86} fontSize={22}>📸</text>
      <text x={160} y={166} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#f43f5e">閃光打玻璃 → 一團白反光</text>
    </Wrap>
  )
}

/** 硬光 vs 柔光 */
function HardSoftLight() {
  return (
    <Wrap>
      <g>
        <text x={80} y={40} fontSize={20} textAnchor="middle">☀️</text>
        <circle cx={80} cy={86} r={20} fill="#fca5a5" />
        <path d="M100 92 L140 104 L100 100 Z" fill="#0f172a" />
        <text x={80} y={140} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#0369a1">硬光</text>
        <text x={80} y={158} fontSize={10} textAnchor="middle" fill="#64748b">影子又黑又利</text>
      </g>
      <g>
        <text x={230} y={40} fontSize={20} textAnchor="middle">⛅</text>
        <circle cx={230} cy={86} r={20} fill="#fca5a5" />
        <path d="M250 92 L286 104 L250 100 Z" fill="#94a3b8" opacity="0.5" />
        <text x={230} y={140} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#0369a1">柔光</text>
        <text x={230} y={158} fontSize={10} textAnchor="middle" fill="#64748b">影子淡淡軟軟</text>
      </g>
    </Wrap>
  )
}

/** 直幅 vs 橫幅 */
function Orientation() {
  return (
    <Wrap>
      <g>
        <rect x={54} y={30} width={64} height={110} rx={10} fill="#0f172a" />
        <rect x={62} y={40} width={48} height={90} rx={4} fill="#dbeafe" />
        <rect x={80} y={54} width={12} height={64} rx={3} fill="#f59e0b" />
        <text x={86} y={160} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#0369a1">直幅</text>
        <text x={86} y={178} fontSize={10} textAnchor="middle" fill="#64748b">高的主角</text>
      </g>
      <g>
        <rect x={172} y={54} width={110} height={64} rx={10} fill="#0f172a" />
        <rect x={182} y={62} width={90} height={48} rx={4} fill="#dbeafe" />
        <rect x={196} y={92} width={62} height={10} rx={3} fill="#22c55e" />
        <text x={227} y={160} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#0369a1">橫幅</text>
        <text x={227} y={178} fontSize={10} textAnchor="middle" fill="#64748b">寬的風景</text>
      </g>
    </Wrap>
  )
}

/** 旅行細節小物 */
function TravelDetails() {
  const item = (x: number, y: number, emoji: string, label: string) => (
    <g>
      <rect x={x} y={y} width={70} height={54} rx={10} fill="#fef3c7" stroke="#fcd34d" strokeWidth={2} />
      <text x={x + 35} y={y + 34} fontSize={26} textAnchor="middle">{emoji}</text>
      <text x={x + 35} y={y + 50} fontSize={9} textAnchor="middle" fill="#92400e">{label}</text>
    </g>
  )
  return (
    <Wrap>
      {item(30, 34, '🎫', '車票')}
      {item(125, 50, '🍦', '點心')}
      {item(220, 34, '🪧', '路牌')}
      <text x={160} y={168} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#0369a1">拍下小細節＝旅行的驚喜</text>
    </Wrap>
  )
}

/** 照片醫生：看照片 → 找病因 → 開藥方 */
function PhotoDoctor() {
  const box = (x: number, emoji: string, label: string) => (
    <g>
      <rect x={x} y={44} width={72} height={60} rx={12} fill="#ecfeff" stroke="#67e8f9" strokeWidth={2} />
      <text x={x + 36} y={82} fontSize={26} textAnchor="middle">{emoji}</text>
      <text x={x + 36} y={122} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">{label}</text>
    </g>
  )
  return (
    <Wrap>
      {box(14, '🖼️', '看照片')}
      <text x={100} y={82} fontSize={22} textAnchor="middle">→</text>
      {box(124, '🔍', '找病因')}
      <text x={210} y={82} fontSize={22} textAnchor="middle">→</text>
      {box(234, '💊', '開藥方')}
      <text x={160} y={24} fontSize={22} textAnchor="middle">🩺 照片醫生</text>
    </Wrap>
  )
}

/** 三秒口訣：拍照前四個檢查 */
function ThreeSecondCheck() {
  const row = (y: number, q: string) => (
    <g>
      <rect x={40} y={y} width={22} height={22} rx={5} fill="#ffffff" stroke="#22c55e" strokeWidth={2} />
      <path d={`M45 ${y + 11} l4 5 l8 -9`} stroke="#22c55e" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x={72} y={y + 17} fontSize={14} fontWeight="bold" fill="#334155">{q}</text>
    </g>
  )
  return (
    <div className="mx-auto w-full max-w-xs">
      <svg viewBox="0 0 300 190" className="w-full" role="img">
        <text x={150} y={22} fontSize={14} fontWeight="black" textAnchor="middle" fill="#0369a1">拍照前・三秒口訣</text>
        {row(40, '主角是誰？')}
        {row(74, '光從哪來？')}
        {row(108, '背景亂嗎？')}
        {row(142, '要不要換角度？')}
      </svg>
    </div>
  )
}

/** 曝光補償小太陽滑桿 */
function ExposureComp() {
  return (
    <Wrap>
      <rect x={40} y={82} width={240} height={14} rx={7} fill="#e2e8f0" />
      <circle cx={160} cy={89} r={20} fill="#fcd34d" stroke="#f59e0b" strokeWidth={3} />
      <text x={160} y={96} fontSize={18} textAnchor="middle">☀️</text>
      <text x={44} y={60} fontSize={12} fontWeight="bold" fill="#0369a1">往上滑 → 變亮</text>
      <text x={224} y={130} fontSize={12} fontWeight="bold" fill="#64748b">往下滑 → 變暗</text>
      <path d="M160 60 L160 74" stroke="#22c55e" strokeWidth={3} markerEnd="url(#ec)" />
      <path d="M160 104 L160 118" stroke="#94a3b8" strokeWidth={3} markerEnd="url(#ec2)" />
      <text x={160} y={160} fontSize={11} textAnchor="middle" fill="#0369a1">點主角，拖小太陽調亮暗</text>
      <defs>
        <marker id="ec" markerWidth="8" markerHeight="8" refX="4" refY="7" orient="auto"><path d="M0 8 L4 0 L8 8 Z" fill="#22c55e" /></marker>
        <marker id="ec2" markerWidth="8" markerHeight="8" refX="4" refY="1" orient="auto"><path d="M0 0 L4 8 L8 0 Z" fill="#94a3b8" /></marker>
      </defs>
    </Wrap>
  )
}
/** 散景：背景糊成光球 */
function Bokeh() {
  return (
    <Wrap>
      {[[70, 50, 16], [110, 90, 22], [250, 44, 14], [270, 100, 20], [90, 130, 12], [230, 130, 16]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={['#fbbf24', '#f472b6', '#38bdf8', '#a78bfa', '#fbbf24', '#34d399'][i]} opacity="0.5" />
      ))}
      <circle cx={160} cy={90} r={26} fill="#f59e0b" />
      <circle cx={160} cy={80} r={10} fill="#fcd34d" />
      <text x={160} y={158} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#0369a1">背景的光糊成一顆顆光球＝散景</text>
    </Wrap>
  )
}
/** 快門時間軸 快→慢 */
function ShutterTimeline() {
  return (
    <Wrap>
      <line x1={30} y1={80} x2={290} y2={80} stroke="#94a3b8" strokeWidth={3} markerEnd="url(#st)" />
      {[['1/1000', 50, '凍結'], ['1/125', 120, '一般'], ['1/15', 190, '易糊'], ['1s', 262, '拖影']].map(([t, x, s], i) => (
        <g key={i}>
          <circle cx={x as number} cy={80} r={5} fill="#0ea5e9" />
          <text x={x as number} y={64} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#0369a1">{t}</text>
          <text x={x as number} y={102} fontSize={10} textAnchor="middle" fill="#64748b">{s}</text>
        </g>
      ))}
      <text x={40} y={135} fontSize={11} fill="#16a34a">快 → 凍結動作</text>
      <text x={230} y={135} fontSize={11} fill="#f43f5e">慢 → 拖影</text>
      <text x={160} y={160} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">快門越慢，動的東西越糊</text>
      <defs><marker id="st" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#94a3b8" /></marker></defs>
    </Wrap>
  )
}
/** ISO 轉盤 */
function IsoDial() {
  return (
    <Wrap>
      <circle cx={160} cy={82} r={54} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={3} />
      {['100', '400', '1600', '3200'].map((v, i) => {
        const a = (-120 + i * 80) * Math.PI / 180
        return <text key={i} x={160 + Math.cos(a) * 38} y={86 + Math.sin(a) * 38} fontSize={12} fontWeight="bold" textAnchor="middle" fill={i < 2 ? '#16a34a' : '#f43f5e'}>{v}</text>
      })}
      <line x1={160} y1={82} x2={196} y2={54} stroke="#0ea5e9" strokeWidth={4} strokeLinecap="round" />
      <text x={90} y={158} fontSize={11} fill="#16a34a">低＝乾淨</text>
      <text x={230} y={158} fontSize={11} fill="#f43f5e">高＝亮但有雜訊</text>
    </Wrap>
  )
}
/** 白平衡校正 */
function WhiteBalance() {
  return (
    <Wrap>
      <rect x={30} y={44} width={80} height={70} rx={10} fill="#fdba74" />
      <text x={70} y={132} fontSize={11} textAnchor="middle" fill="#64748b">太橘</text>
      <text x={130} y={86} fontSize={22} textAnchor="middle">→</text>
      <rect x={155} y={44} width={80} height={70} rx={10} fill="#f8fafc" stroke="#cbd5e1" />
      <text x={195} y={132} fontSize={11} textAnchor="middle" fill="#0369a1">校正成正常</text>
      <text x={270} y={70} fontSize={22} textAnchor="middle">🎚️</text>
      <text x={160} y={158} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">白平衡＝相機的調色小管家</text>
    </Wrap>
  )
}
/** 一天的光色：黃金/中午/藍調 */
function DayLight() {
  const sw = (x: number, fill: string, label: string) => (
    <g><rect x={x} y={44} width={72} height={60} rx={10} fill={fill} /><text x={x + 36} y={126} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#334155">{label}</text></g>
  )
  return (
    <Wrap>
      {sw(16, '#fb923c', '黃金時刻')}
      {sw(100, '#fde68a', '中午')}
      {sw(184, '#7dd3fc', '藍調時刻')}
      <text x={268} y={78} fontSize={24} textAnchor="middle">🌅</text>
      <text x={160} y={158} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">光的顏色一整天都在變</text>
    </Wrap>
  )
}
/** HDR：亮部＋暗部合成 */
function HdrMerge() {
  return (
    <Wrap>
      <rect x={26} y={40} width={80} height={60} rx={8} fill="#fde68a" /><text x={66} y={120} fontSize={10} textAnchor="middle" fill="#64748b">亮部清楚</text>
      <rect x={26} y={70} width={80} height={40} rx={8} fill="#334155" opacity="0.35" />
      <text x={150} y={78} fontSize={22} textAnchor="middle">+</text>
      <rect x={180} y={40} width={80} height={60} rx={8} fill="#1e293b" /><rect x={180} y={40} width={80} height={30} rx={8} fill="#93c5fd" opacity="0.4" /><text x={220} y={120} fontSize={10} textAnchor="middle" fill="#64748b">暗部清楚</text>
      <text x={285} y={78} fontSize={20} textAnchor="middle">→</text>
      <text x={160} y={158} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">HDR：亮暗各拍一張，合成都清楚</text>
    </Wrap>
  )
}
/** 夜間模式 */
function NightMode() {
  return (
    <Wrap>
      <rect x={110} y={26} width={100} height={130} rx={16} fill="#0f172a" />
      <rect x={120} y={40} width={80} height={92} rx={6} fill="#1e293b" />
      <text x={160} y={70} fontSize={20} textAnchor="middle">🌙</text>
      {[...Array(6)].map((_, i) => <circle key={i} cx={132 + (i % 3) * 24} cy={92 + Math.floor(i / 3) * 20} r={3} fill="#fbbf24" />)}
      <rect x={140} y={140} width={40} height={8} rx={4} fill="#fbbf24" />
      <text x={160} y={182} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">夜間模式：慢慢收光再疊圖</text>
    </Wrap>
  )
}
/** 弱光找光 */
function FindLight() {
  return (
    <Wrap>
      <rect x={40} y={30} width={240} height={120} rx={10} fill="#1e293b" />
      <rect x={210} y={30} width={70} height={120} fill="#fde68a" opacity="0.85" />
      <text x={245} y={96} fontSize={22} textAnchor="middle">🪟</text>
      <circle cx={190} cy={95} r={18} fill="#fca5a5" />
      <path d="M150 95 L172 95" stroke="#22c55e" strokeWidth={3} markerEnd="url(#fl)" />
      <text x={110} y={99} fontSize={12} fontWeight="bold" fill="#fef9c3">往光移過去</text>
      <text x={160} y={172} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">暗暗的？先找光，把主角帶到亮的地方</text>
      <defs><marker id="fl" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#22c55e" /></marker></defs>
    </Wrap>
  )
}
/** 單一配件圖：腳架/自拍棒/補光燈/拭鏡布 */
function Gadget({ emoji, name, desc }: { emoji: string; name: string; desc: string }) {
  return (
    <Wrap>
      <rect x={110} y={30} width={100} height={90} rx={16} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={2} />
      <text x={160} y={90} fontSize={44} textAnchor="middle">{emoji}</text>
      <text x={160} y={140} fontSize={15} fontWeight="black" textAnchor="middle" fill="#0369a1">{name}</text>
      <text x={160} y={162} fontSize={11} textAnchor="middle" fill="#64748b">{desc}</text>
    </Wrap>
  )
}

/** 光圈環刻度 */
function ApertureRing() {
  return (
    <Wrap>
      <circle cx={160} cy={82} r={54} fill="none" stroke="#334155" strokeWidth={10} />
      {['1.8', '2.8', '4', '5.6', '8', '11', '16'].map((f, i) => {
        const a = (-150 + i * 50) * Math.PI / 180
        return <text key={i} x={160 + Math.cos(a) * 40} y={86 + Math.sin(a) * 40} fontSize={11} fontWeight="bold" textAnchor="middle" fill={i < 3 ? '#16a34a' : '#f43f5e'}>{f}</text>
      })}
      <polygon points="160,60 172,90 148,90" fill="#0ea5e9" />
      <text x={90} y={158} fontSize={10} fill="#16a34a">小數字＝大光圈</text>
      <text x={230} y={158} fontSize={10} fill="#f43f5e">大數字＝小光圈</text>
    </Wrap>
  )
}
/** 對焦平面：前景/主角/背景 誰清楚 */
function FocusPlane() {
  return (
    <Wrap>
      <rect x={30} y={40} width={260} height={80} rx={8} fill="#eff6ff" />
      <circle cx={80} cy={80} r={12} fill="#cbd5e1" opacity="0.6" />
      <rect x={148} y={54} width={26} height={52} rx={4} fill="#22c55e" />
      <text x={161} y={44} fontSize={10} textAnchor="middle" fill="#16a34a">對焦面</text>
      <circle cx={250} cy={80} r={14} fill="#cbd5e1" opacity="0.55" />
      <text x={80} y={135} fontSize={10} textAnchor="middle" fill="#94a3b8">前景糊</text>
      <text x={161} y={135} fontSize={10} textAnchor="middle" fill="#16a34a">主角清楚</text>
      <text x={250} y={135} fontSize={10} textAnchor="middle" fill="#94a3b8">背景糊</text>
      <text x={160} y={158} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">對焦面上最清楚，前後會糊</text>
    </Wrap>
  )
}
/** 快門簾開合 */
function ShutterCurtain() {
  return (
    <Wrap>
      {[[36, '關', '#334155', 74], [130, '開一半', '#334155', 40], [224, '全開', '#fef9c3', 0]].map(([x, l, c, h], i) => (
        <g key={i}>
          <rect x={x as number} y={40} width={64} height={64} rx={6} fill="#fef9c3" />
          <rect x={x as number} y={40} width={64} height={h as number} fill={c as string} />
          <rect x={x as number} y={40} width={64} height={64} rx={6} fill="none" stroke="#334155" strokeWidth={2} />
          <text x={(x as number) + 32} y={124} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">{l as string}</text>
        </g>
      ))}
      <text x={160} y={158} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#64748b">快門像窗簾，開越久收越多光</text>
    </Wrap>
  )
}
/** 連拍時間軸 */
function BurstTimeline() {
  return (
    <Wrap>
      {[...Array(6)].map((_, i) => (
        <g key={i}>
          <rect x={22 + i * 46} y={54} width={40} height={54} rx={5} fill="#e2e8f0" stroke="#94a3b8" />
          <circle cx={42 + i * 46} cy={81} r={10} fill={i === 3 ? '#22c55e' : '#cbd5e1'} />
        </g>
      ))}
      <text x={42 + 3 * 46} y={44} fontSize={16} textAnchor="middle">👍</text>
      <text x={160} y={132} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">連拍：一秒好多張，挑最棒的一格</text>
    </Wrap>
  )
}
/** 感光元件敏感度 */
function SensorIso() {
  return (
    <Wrap>
      <rect x={60} y={44} width={200} height={80} rx={8} fill="#0f172a" />
      {[...Array(48)].map((_, i) => <rect key={i} x={68 + (i % 12) * 16} y={52 + Math.floor(i / 12) * 16} width={13} height={13} rx={2} fill="#1e3a8a" />)}
      <text x={160} y={90} fontSize={22} textAnchor="middle">🔆</text>
      <text x={160} y={140} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">感光元件：ISO 越高，對光越敏感</text>
      <text x={160} y={158} fontSize={10} textAnchor="middle" fill="#f43f5e">但太敏感就會冒雜訊</text>
    </Wrap>
  )
}
/** 低光顆粒對照 */
function GrainCompare() {
  return (
    <Wrap>
      <rect x={26} y={40} width={110} height={80} rx={8} fill="#475569" />
      <text x={81} y={136} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#16a34a">ISO 低・乾淨</text>
      <rect x={184} y={40} width={110} height={80} rx={8} fill="#475569" />
      {Array.from({ length: 90 }).map((_, k) => <circle key={k} cx={190 + (k * 41) % 98} cy={46 + (k * 57) % 68} r={1.5} fill={k % 2 ? '#f8fafc' : '#0f172a'} opacity={0.8} />)}
      <text x={239} y={136} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#f43f5e">ISO 高・雜訊</text>
    </Wrap>
  )
}
/** 等曝光互換條 */
function ExposureSwap() {
  return (
    <Wrap>
      <text x={160} y={30} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#0369a1">亮度一樣，可以有很多種調法</text>
      {[['光圈↑', '快門↓', 60], ['快門↑', 'ISO↓', 90], ['ISO↑', '光圈↓', 120]].map(([a, b, y], i) => (
        <g key={i}>
          <rect x={40} y={y as number} width={100} height={22} rx={11} fill="#bbf7d0" /><text x={90} y={(y as number) + 15} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#166534">{a}</text>
          <text x={160} y={(y as number) + 16} fontSize={14} textAnchor="middle">⇄</text>
          <rect x={180} y={y as number} width={100} height={22} rx={11} fill="#fecaca" /><text x={230} y={(y as number) + 15} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#991b1b">{b}</text>
        </g>
      ))}
    </Wrap>
  )
}
/** 測光錶 */
function LightMeter() {
  return (
    <Wrap>
      <path d="M40 120 A120 120 0 0 1 280 120" fill="none" stroke="#e2e8f0" strokeWidth={14} />
      <text x={60} y={110} fontSize={12} fill="#f43f5e">太暗</text>
      <text x={150} y={40} fontSize={12} fontWeight="bold" fill="#16a34a">剛好</text>
      <text x={250} y={110} fontSize={12} fill="#f43f5e">太亮</text>
      <line x1={160} y1={120} x2={160} y2={54} stroke="#0ea5e9" strokeWidth={4} strokeLinecap="round" />
      <circle cx={160} cy={120} r={7} fill="#0f172a" />
      <text x={160} y={150} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">相機的測光錶：指針停中間＝剛好</text>
    </Wrap>
  )
}
/** HDR 疊圖（多張堆疊） */
function HdrStack() {
  return (
    <Wrap>
      {[0, 1, 2, 3].map((k) => <rect key={k} x={40 + k * 12} y={40 + k * 10} width={90} height={62} rx={8} fill={['#1e293b', '#475569', '#94a3b8', '#fde68a'][k]} stroke="#fff" strokeWidth={2} />)}
      <text x={190} y={82} fontSize={22} textAnchor="middle">→</text>
      <rect x={220} y={52} width={80} height={60} rx={8} fill="#7dd3fc" stroke="#0ea5e9" strokeWidth={3} />
      <text x={260} y={90} fontSize={20} textAnchor="middle">✨</text>
      <text x={160} y={158} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">堆疊好多張，暗處亮處都清楚</text>
    </Wrap>
  )
}
/** 開爾文色溫刻度 */
function KelvinScale() {
  return (
    <Wrap>
      <defs><linearGradient id="kv" x1="0" x2="1"><stop offset="0" stopColor="#fb923c" /><stop offset="0.5" stopColor="#f8fafc" /><stop offset="1" stopColor="#60a5fa" /></linearGradient></defs>
      <rect x={30} y={60} width={260} height={30} rx={15} fill="url(#kv)" />
      <text x={50} y={116} fontSize={11} fill="#c2410c">2000K 橘</text>
      <text x={150} y={116} fontSize={11} fill="#334155">5500K 白</text>
      <text x={240} y={116} fontSize={11} fill="#1d4ed8">8000K 藍</text>
      <text x={60} y={48} fontSize={10} textAnchor="middle">🌅</text>
      <text x={160} y={48} fontSize={10} textAnchor="middle">☀️</text>
      <text x={260} y={48} fontSize={10} textAnchor="middle">☁️</text>
      <text x={160} y={150} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">色溫刻度：數字小偏橘、大偏藍</text>
    </Wrap>
  )
}
/** 拿穩姿勢：企鵝式夾手肘 */
function BracePoses() {
  return (
    <Wrap>
      <text x={80} y={80} fontSize={40} textAnchor="middle">🐧</text>
      <text x={80} y={120} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#16a34a">手肘夾緊</text>
      <text x={160} y={80} fontSize={36} textAnchor="middle">🧱</text>
      <text x={160} y={120} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#16a34a">靠牆</text>
      <text x={240} y={80} fontSize={34} textAnchor="middle">😮‍💨</text>
      <text x={240} y={120} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#16a34a">呼氣再按</text>
      <text x={160} y={152} fontSize={11} fontWeight="bold" textAnchor="middle" fill="#0369a1">三招拿穩，照片不糊</text>
    </Wrap>
  )
}
/** 格線畫面（純井字，不同於 thirds-grid 的放主角） */
function GridLines() {
  return (
    <Wrap>
      <rect x={70} y={20} width={180} height={160} rx={10} fill="#dbeafe" stroke="#94a3b8" strokeWidth={2} />
      <line x1={130} y1={20} x2={130} y2={180} stroke="#fff" strokeWidth={3} />
      <line x1={190} y1={20} x2={190} y2={180} stroke="#fff" strokeWidth={3} />
      <line x1={70} y1={73} x2={250} y2={73} stroke="#fff" strokeWidth={3} />
      <line x1={70} y1={127} x2={250} y2={127} stroke="#fff" strokeWidth={3} />
      <text x={160} y={106} fontSize={22} textAnchor="middle">＃</text>
      <text x={160} y={198} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#0369a1">打開格線，畫面出現井字線</text>
    </Wrap>
  )
}

export function ConceptArt({ name }: { name: string }) {
  switch (name) {
    case 'aperture-ring':
      return <ApertureRing />
    case 'focus-plane':
      return <FocusPlane />
    case 'shutter-curtain':
      return <ShutterCurtain />
    case 'burst-timeline':
      return <BurstTimeline />
    case 'sensor-iso':
      return <SensorIso />
    case 'grain-compare':
      return <GrainCompare />
    case 'exposure-swap':
      return <ExposureSwap />
    case 'light-meter':
      return <LightMeter />
    case 'hdr-stack':
      return <HdrStack />
    case 'kelvin-scale':
      return <KelvinScale />
    case 'brace-poses':
      return <BracePoses />
    case 'grid-lines':
      return <GridLines />
    case 'exposure-comp':
      return <ExposureComp />
    case 'bokeh':
      return <Bokeh />
    case 'shutter-timeline':
      return <ShutterTimeline />
    case 'iso-dial':
      return <IsoDial />
    case 'white-balance':
      return <WhiteBalance />
    case 'day-light':
      return <DayLight />
    case 'hdr-merge':
      return <HdrMerge />
    case 'night-mode':
      return <NightMode />
    case 'find-light':
      return <FindLight />
    case 'tripod':
      return <Gadget emoji="🎥" name="腳架" desc="幫手機站穩，拍暗處/合照" />
    case 'selfie-stick':
      return <Gadget emoji="🤳" name="自拍棒" desc="伸遠一點，裝進更多人" />
    case 'fill-light':
      return <Gadget emoji="💡" name="補光燈" desc="暗處幫主角的臉補光" />
    case 'cleaning-cloth':
      return <Gadget emoji="🧻" name="拭鏡布" desc="比衣角更專業的擦鏡頭神器" />
    case 'lens-clean':
      return <LensClean />
    case 'old-phone':
      return <OldPhone />
    case 'accessories':
      return <Accessories />
    case 'flash-reflection':
      return <FlashReflection />
    case 'hard-soft-light':
      return <HardSoftLight />
    case 'orientation':
      return <Orientation />
    case 'travel-details':
      return <TravelDetails />
    case 'photo-doctor':
      return <PhotoDoctor />
    case 'three-second-check':
      return <ThreeSecondCheck />
    case 'exposure-ladder':
      return <ExposureLadder />
    case 'light-directions':
      return <LightDirections />
    case 'focus-tap':
      return <FocusTap />
    case 'paint-with-light':
      return <PaintWithLight />
    case 'aperture-sizes':
      return <ApertureSizes />
    case 'depth-of-field':
      return <DepthOfField />
    case 'shutter-speed':
      return <ShutterSpeed />
    case 'iso-noise':
      return <IsoNoise />
    case 'exposure-triangle':
      return <ExposureTriangle />
    case 'color-temp':
      return <ColorTemp />
    case 'zoom-lenses':
      return <ZoomLenses />
    case 'zoom-framing':
      return <ZoomFraming />
    case 'zoom-quality':
      return <ZoomQuality />
    case 'periscope':
      return <Periscope />
    case 'walk-closer':
      return <WalkCloser />
    case 'steady-hold':
      return <SteadyHold />
    case 'thirds-grid':
      return <ThirdsGridArt />
    case 'color-wheel':
      return <ColorWheel />
    case 'computational':
      return <Computational />
    default:
      return null
  }
}

/** 通用配圖：art（概念示意圖）優先，否則 photo（真實照片）。都沒有回 null。 */
export function Media({
  art,
  photo,
  className = '',
}: {
  art?: string
  photo?: string
  className?: string
}) {
  if (art) {
    const el = <ConceptArt name={art} />
    if (!el) return null
    return <div className={className}>{el}</div>
  }
  if (photo) {
    return (
      <div className={`mx-auto max-w-sm ${className}`}>
        <CropView pid={photo} />
      </div>
    )
  }
  return null
}
