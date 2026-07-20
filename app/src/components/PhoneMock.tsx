/** 擬真 iPhone 畫面示意圖（SVG 手繪風，先頂著用；日後可換真實截圖）。
 * 外框統一，內容依 name 切換。 */

function Frame({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <figure className="mx-auto w-full max-w-[220px]">
      <svg viewBox="0 0 220 400" className="w-full drop-shadow-md" role="img">
        {/* 機身 */}
        <rect x="4" y="4" width="212" height="392" rx="30" fill="#0f172a" />
        <rect x="12" y="12" width="196" height="376" rx="22" fill="#f8fafc" />
        {/* 瀏海 */}
        <rect x="82" y="12" width="56" height="14" rx="7" fill="#0f172a" />
        {children}
      </svg>
      <figcaption className="mt-1 text-center text-xs font-bold text-slate-400">
        📱 示意圖・{caption}
      </figcaption>
    </figure>
  )
}

/** 設定 → 相機 → 格線 */
function SettingsGrid() {
  return (
    <Frame caption="設定 → 相機">
      <text x="24" y="52" fontSize="15" fontWeight="bold" fill="#0f172a">
        ‹ 相機
      </text>
      {/* 列表 */}
      <rect x="20" y="66" width="180" height="40" rx="10" fill="#ffffff" stroke="#e2e8f0" />
      <text x="30" y="91" fontSize="12" fill="#334155">
        格式
      </text>
      <rect x="20" y="112" width="180" height="44" rx="10" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
      <text x="30" y="139" fontSize="12" fontWeight="bold" fill="#0369a1">
        格線
      </text>
      {/* 開關 ON */}
      <rect x="158" y="126" width="34" height="18" rx="9" fill="#22c55e" />
      <circle cx="184" cy="135" r="7" fill="#ffffff" />
      <text x="30" y="182" fontSize="11" fill="#94a3b8">
        ☝️ 把這個開關打開
      </text>
    </Frame>
  )
}

/** 相機 App 模式列，切到「人像」 */
function PortraitMode() {
  return (
    <Frame caption="相機 → 人像模式">
      {/* 觀景窗 */}
      <rect x="20" y="40" width="180" height="240" rx="8" fill="#cbd5e1" />
      <circle cx="110" cy="150" r="42" fill="#94a3b8" />
      {/* 模式列 */}
      <text x="34" y="316" fontSize="11" fill="#94a3b8">
        影片
      </text>
      <text x="86" y="316" fontSize="12" fontWeight="bold" fill="#f59e0b">
        人像
      </text>
      <text x="150" y="316" fontSize="11" fill="#94a3b8">
        照片
      </text>
      <path d="M86 322 h26" stroke="#f59e0b" strokeWidth="2" />
      {/* 快門 */}
      <circle cx="110" cy="356" r="16" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
      <text x="60" y="300" fontSize="10" fill="#334155">
        ☝️ 左右滑，選「人像」
      </text>
    </Frame>
  )
}

/** 人像模式對主角，出現「自然光」黃字 */
function NaturalLight() {
  return (
    <Frame caption="出現「自然光」就能拍">
      <rect x="20" y="40" width="180" height="240" rx="8" fill="#e2e8f0" />
      {/* 主角清楚、背景糊 */}
      <circle cx="110" cy="150" r="40" fill="#fca5a5" />
      <circle cx="110" cy="128" r="16" fill="#fecaca" />
      {/* 自然光標籤 */}
      <rect x="72" y="52" width="76" height="22" rx="11" fill="#fde68a" />
      <text x="110" y="67" fontSize="11" fontWeight="bold" fill="#92400e" textAnchor="middle">
        自然光
      </text>
      <circle cx="110" cy="356" r="16" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
      <text x="52" y="300" fontSize="10" fill="#334155">
        ☝️ 黃字亮了就按快門
      </text>
    </Frame>
  )
}

/** 長按主角，出現 AE/AF 鎖定黃字 */
function AeAfLock() {
  return (
    <Frame caption="長按主角 → AE/AF 鎖定">
      <rect x="20" y="40" width="180" height="240" rx="8" fill="#e2e8f0" />
      <circle cx="110" cy="150" r="42" fill="#fca5a5" />
      {/* 對焦框 */}
      <rect x="74" y="114" width="72" height="72" fill="none" stroke="#fde047" strokeWidth="3" rx="4" />
      {/* AE/AF 鎖定標籤 */}
      <rect x="56" y="52" width="108" height="24" rx="6" fill="#fde68a" />
      <text x="110" y="69" fontSize="12" fontWeight="bold" fill="#92400e" textAnchor="middle">
        AE/AF 鎖定
      </text>
      {/* 長按手指 */}
      <text x="118" y="176" fontSize="34">👆</text>
      <text x="46" y="304" fontSize="10" fill="#334155">
        ☝️ 長按不放，鎖住對焦和亮度
      </text>
    </Frame>
  )
}

/** 相機畫面的倍率切換鈕 .5 / 1x / 3 */
function ZoomButtons() {
  return (
    <Frame caption="相機 → 倍率切換鈕">
      <rect x="20" y="40" width="180" height="230" rx="8" fill="#cbd5e1" />
      <circle cx="110" cy="150" r="34" fill="#94a3b8" />
      {/* 倍率膠囊 */}
      <rect x="56" y="288" width="108" height="30" rx="15" fill="#0f172a" />
      <circle cx="80" cy="303" r="13" fill="#334155" />
      <text x="80" y="308" fontSize="10" fill="#fbbf24" textAnchor="middle">.5</text>
      <circle cx="110" cy="303" r="14" fill="#fbbf24" />
      <text x="110" y="308" fontSize="10" fontWeight="bold" fill="#0f172a" textAnchor="middle">1x</text>
      <circle cx="140" cy="303" r="13" fill="#334155" />
      <text x="140" y="308" fontSize="10" fill="#fbbf24" textAnchor="middle">3</text>
      <text x="44" y="340" fontSize="10" fill="#334155">☝️ 點小圓鈕，畫面變遠或變近</text>
    </Frame>
  )
}

export function PhoneMock({ name }: { name: string }) {
  switch (name) {
    case 'zoom-buttons':
      return <ZoomButtons />
    case 'settings-grid':
      return <SettingsGrid />
    case 'portrait-mode':
      return <PortraitMode />
    case 'natural-light':
      return <NaturalLight />
    case 'ae-af-lock':
      return <AeAfLock />
    default:
      return null
  }
}
