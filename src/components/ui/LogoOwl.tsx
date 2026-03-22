interface LogoOwlProps {
  className?: string
  size?: number
}

export default function LogoOwl({ className = '', size = 40 }: LogoOwlProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Jocha"
    >
      {/* ── Touffes d'oreilles ── */}
      <path d="M31 24 C29 18 26 10 30 6 C33 10 36 16 36 22 Z" fill="currentColor" opacity="0.95" />
      <path d="M69 24 C71 18 74 10 70 6 C67 10 64 16 64 22 Z" fill="currentColor" opacity="0.95" />

      {/* ── Tête (cercle principal) ── */}
      <circle cx="50" cy="46" r="29" fill="currentColor" opacity="0.18" />
      <circle cx="50" cy="46" r="27" fill="currentColor" />

      {/* ── Disque facial (zone claire autour des yeux, comme le hibou emoji) ── */}
      <ellipse cx="50" cy="48" rx="22" ry="20" fill="currentColor" opacity="0.22" />

      {/* ── Corps ── */}
      <ellipse cx="50" cy="76" rx="22" ry="19" fill="currentColor" opacity="0.88" />

      {/* ── Ailes ── */}
      <path d="M28 60 Q14 66 18 82 Q27 70 33 72 Z" fill="currentColor" opacity="0.7" />
      <path d="M72 60 Q86 66 82 82 Q73 70 67 72 Z" fill="currentColor" opacity="0.7" />

      {/* ── Ventre (texture plumes) ── */}
      <ellipse cx="50" cy="78" rx="13" ry="14" fill="currentColor" opacity="0.12" />
      <path d="M39 71 Q50 67 61 71" stroke="currentColor" strokeWidth="0.9" fill="none" opacity="0.35" strokeLinecap="round" />
      <path d="M37 77 Q50 73 63 77" stroke="currentColor" strokeWidth="0.9" fill="none" opacity="0.3" strokeLinecap="round" />
      <path d="M39 83 Q50 79 61 83" stroke="currentColor" strokeWidth="0.9" fill="none" opacity="0.25" strokeLinecap="round" />

      {/* ── Sockets des yeux (fond sombre) ── */}
      <circle cx="35" cy="45" r="12.5" fill="#0C0800" />
      <circle cx="65" cy="45" r="12.5" fill="#0C0800" />

      {/* ── Anneau externe iris ── */}
      <circle cx="35" cy="45" r="11" fill="currentColor" opacity="0.25" />
      <circle cx="65" cy="45" r="11" fill="currentColor" opacity="0.25" />

      {/* ── Iris (or vif) ── */}
      <circle cx="35" cy="45" r="9" fill="currentColor" />
      <circle cx="65" cy="45" r="9" fill="currentColor" />

      {/* ── Anneau intérieur iris (profondeur) ── */}
      <circle cx="35" cy="45" r="6.5" fill="#0C0800" opacity="0.45" />
      <circle cx="65" cy="45" r="6.5" fill="#0C0800" opacity="0.45" />

      {/* ── Pupilles ── */}
      <circle cx="36" cy="44" r="4.5" fill="#0C0800" />
      <circle cx="66" cy="44" r="4.5" fill="#0C0800" />

      {/* ── Reflets (signature emoji iPhone : 2 points lumineux) ── */}
      <circle cx="32" cy="41" r="2.2" fill="white" opacity="0.95" />
      <circle cx="34.5" cy="43.5" r="1" fill="white" opacity="0.55" />
      <circle cx="62" cy="41" r="2.2" fill="white" opacity="0.95" />
      <circle cx="64.5" cy="43.5" r="1" fill="white" opacity="0.55" />

      {/* ── Bec ── */}
      <path d="M44 53 L50 60 L56 53 Q50 49.5 44 53 Z" fill="#0C0800" opacity="0.6" />
      <path d="M50 53 L50 60" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />

      {/* ── Sourcils (légèrement inclinés pour look expressif) ── */}
      <path d="M25 36 Q31 33 38 35" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M62 35 Q69 33 75 36" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.5" strokeLinecap="round" />

      {/* ── Pattes ── */}
      <path d="M42 93 L39 99 M42 93 L42 99 M42 93 L46 99" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
      <path d="M58 93 L55 99 M58 93 L58 99 M58 93 L62 99" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.65" />

      {/* ── Branche ── */}
      <path d="M28 94 L72 94" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}
