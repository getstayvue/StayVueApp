// src/components/StayVueLogo.jsx
// Original outline pine tree mark + updated StayVue wordmark
//
// Variants: light, dark, mark, vertical, vertical-dark, wordmark, wordmark-dark
// Props: size (height px), className, onClick, style

const BRAND = '#5A7F4B';
const BRAND_LT = '#7BAF68';
const DARK = '#2C2C2A';
const LIGHT = '#FAFAF8';

// Base tree path — 3-tier outline pine with trunk
// Spans roughly x:-9..9 (18 wide), y:-12..11 (23 tall)
const TreePath = () => (
  <>
    <path d="M0,-12 C-0.8,-12 -4.5,-7 -4.5,-7 L-2.5,-7 C-2.5,-7 -7,-0.5 -7,-0.5 L-4,-0.5 C-4,-0.5 -9,6.5 -9,6.5 L9,6.5 C9,6.5 4,-0.5 4,-0.5 L7,-0.5 C7,-0.5 2.5,-7 2.5,-7 L4.5,-7 C4.5,-7 0.8,-12 0,-12 Z" />
    <line x1="0" y1="6.5" x2="0" y2="11" />
  </>
);

// Tree at a given scale, centered at origin
const Tree = ({ scale = 1, sw = 1.8 }) => (
  <g fill="none" stroke="white" strokeWidth={sw / scale} strokeLinecap="round" strokeLinejoin="round"
    transform={scale !== 1 ? `scale(${scale})` : undefined}>
    <TreePath />
  </g>
);

export default function StayVueLogo({ variant = 'light', size, className = '', onClick, style: extraStyle }) {
  const base = { display: 'block', ...(onClick ? { cursor: 'pointer' } : {}), ...extraStyle };

  // ── Mark only (square icon) ──
  // Tree scaled 1.5x to match original proportions (tree fills ~45% of square)
  if (variant === 'mark') {
    const s = size || 48;
    return (
      <svg width={s} height={s} viewBox="0 0 100 100" className={className} onClick={onClick} style={base}>
        <rect x="3" y="3" width="94" height="94" rx="24" fill={BRAND} />
        <g transform="translate(50,49)"><Tree scale={1.5} sw={2.2} /></g>
      </svg>
    );
  }

  // ── Vertical / stacked ──
  if (variant === 'vertical' || variant === 'vertical-dark') {
    const isDark = variant === 'vertical-dark';
    const s = size || 80;
    const w = s * (120 / 100);
    return (
      <svg width={w} height={s} viewBox="0 0 120 100" className={className} onClick={onClick} style={base}>
        <rect x="34" y="4" width="52" height="52" rx="14" fill={BRAND} />
        <g transform="translate(60,29)"><Tree scale={1.15} /></g>
        <text x="60" y="81" textAnchor="middle"
          fontFamily="'Plus Jakarta Sans',system-ui,sans-serif" fontSize="18" fontWeight="800"
          fill={isDark ? LIGHT : DARK} letterSpacing="-0.5">
          Stay<tspan fill={isDark ? BRAND_LT : BRAND}>Vue</tspan>
        </text>
      </svg>
    );
  }

  // ── Wordmark only (centered text, no icon) ──
  if (variant === 'wordmark' || variant === 'wordmark-dark') {
    const isDark = variant === 'wordmark-dark';
    const s = size || 28;
    const w = s * (140 / 32);
    return (
      <svg width={w} height={s} viewBox="0 0 140 32" className={className} onClick={onClick} style={base}>
        <text x="70" y="24" textAnchor="middle"
          fontFamily="'Plus Jakarta Sans',system-ui,sans-serif" fontSize="24" fontWeight="800"
          fill={isDark ? LIGHT : DARK} letterSpacing="-0.6">
          Stay<tspan fill={isDark ? BRAND_LT : BRAND}>Vue</tspan>
        </text>
      </svg>
    );
  }

  // ── Horizontal lockup (default) ──
  // Icon: 48×48, tree scaled up to match mark proportions
  const isDark = variant === 'dark';
  const s = size || 44;
  const w = s * (220 / 56);
  return (
    <svg width={w} height={s} viewBox="0 0 220 56" className={className} onClick={onClick} style={base}>
      <rect x="4" y="4" width="48" height="48" rx="13" fill={BRAND} />
      <g transform="translate(28,28)"><Tree scale={1.15} /></g>
      <text x="64" y="33" dominantBaseline="central"
        fontFamily="'Plus Jakarta Sans',system-ui,sans-serif" fontSize="23" fontWeight="800"
        fill={isDark ? LIGHT : DARK} letterSpacing="-0.5">
        Stay<tspan fill={isDark ? BRAND_LT : BRAND}>Vue</tspan>
      </text>
    </svg>
  );
}
