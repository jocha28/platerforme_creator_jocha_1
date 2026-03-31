interface CertificationDiscProps {
  type: 'or' | 'platine' | 'diamant'
  size?: number
}

const COLORS = {
  or: {
    outer:  '#FFD700',
    ring:   '#B8860B',
    inner:  '#E8A000',
    center: '#7A5500',
    glow:   '#FFD70066',
  },
  platine: {
    outer:  '#E8E8F0',
    ring:   '#A0A0B8',
    inner:  '#C8C8DC',
    center: '#606078',
    glow:   '#E8E8F066',
  },
  diamant: {
    outer:  '#A8EEFF',
    ring:   '#40C8F0',
    inner:  '#70DCFF',
    center: '#0080A8',
    glow:   '#A8EEFF66',
  },
}

export default function CertificationDisc({ type, size = 28 }: CertificationDiscProps) {
  const c = COLORS[type]
  const r = size / 2

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 4px ${c.glow})` }}
    >
      {/* Disque principal */}
      <circle cx="50" cy="50" r="48" fill={c.outer} />

      {/* Reflet brillant */}
      <ellipse cx="35" cy="28" rx="18" ry="10" fill="white" fillOpacity="0.25" transform="rotate(-30 35 28)" />

      {/* Sillon 1 */}
      <circle cx="50" cy="50" r="40" stroke={c.ring} strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* Sillon 2 */}
      <circle cx="50" cy="50" r="34" stroke={c.ring} strokeWidth="1" fill="none" opacity="0.4" />
      {/* Sillon 3 */}
      <circle cx="50" cy="50" r="28" stroke={c.ring} strokeWidth="1" fill="none" opacity="0.4" />
      {/* Sillon 4 */}
      <circle cx="50" cy="50" r="22" stroke={c.ring} strokeWidth="1" fill="none" opacity="0.3" />

      {/* Zone centrale (label) */}
      <circle cx="50" cy="50" r="16" fill={c.inner} />
      <circle cx="50" cy="50" r="12" fill={c.center} opacity="0.6" />

      {/* Trou central */}
      <circle cx="50" cy="50" r="4" fill="#111" />

      {/* Bord extérieur */}
      <circle cx="50" cy="50" r="48" stroke={c.ring} strokeWidth="2" fill="none" opacity="0.6" />

      {/* Lettre initiale selon type */}
      <text
        x="50"
        y="54"
        textAnchor="middle"
        fontSize="10"
        fontWeight="900"
        fontFamily="sans-serif"
        fill={c.outer}
        opacity="0.9"
      >
        {type === 'or' ? 'OR' : type === 'platine' ? 'PL' : 'DIA'}
      </text>
    </svg>
  )
}