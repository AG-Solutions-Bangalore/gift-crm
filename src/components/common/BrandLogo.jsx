import React, { useState, useEffect } from 'react';

// Brand color mapping
const BRAND_COLORS = {
  borosil: { bg: '#0267B5', text: '#0267B5' },
  larah: { bg: '#4F46E5', text: '#4F46E5' },
  neelam: { bg: '#0891B2', text: '#0891B2' },
  prestige: { bg: '#DC2626', text: '#DC2626' },
  judge: { bg: '#D97706', text: '#D97706' },
  milton: { bg: '#E11D48', text: '#E11D48' },
  pigeon: { bg: '#059669', text: '#059669' },
  wonderchef: { bg: '#7C3AED', text: '#7C3AED' },
  hawkins: { bg: '#D97706', text: '#0F172A' },
  cello: { bg: '#0267B5', text: '#0267B5' },
  bajaj: { bg: '#2563EB', text: '#2563EB' },
  philips: { bg: '#1D4ED8', text: '#1D4ED8' },
  samsung: { bg: '#1E3A8A', text: '#1E3A8A' },
  boat: { bg: '#DC2626', text: '#DC2626' },
};

const PALETTE = [
  { bg: '#0267B5', text: '#0267B5' }, // Blue
  { bg: '#DC2626', text: '#DC2626' }, // Red
  { bg: '#4F46E5', text: '#4F46E5' }, // Indigo
  { bg: '#059669', text: '#059669' }, // Emerald
  { bg: '#7C3AED', text: '#7C3AED' }, // Purple
  { bg: '#D97706', text: '#D97706' }, // Amber
  { bg: '#0891B2', text: '#0891B2' }, // Cyan
  { bg: '#E11D48', text: '#E11D48' }, // Rose
];

function getBrandColor(name) {
  if (!name) return PALETTE[0];
  const clean = name.toLowerCase().trim();
  
  for (const [key, color] of Object.entries(BRAND_COLORS)) {
    if (clean.includes(key)) {
      return color;
    }
  }

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

/**
 * Format string to Title Case (e.g. "BOROSIL" -> "Borosil")
 */
function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

/**
 * Split brand name into First Letter (inside circle) and Rest (outside circle)
 */
function splitBrandName(name) {
  const formatted = toTitleCase(String(name || '').trim() || 'Brand');
  const words = formatted.split(/\s+/);
  const firstWord = words[0] || 'Brand';
  
  // First letter in circle, rest outside
  const first = firstWord.charAt(0);
  const restOfFirst = firstWord.slice(1);
  const otherWords = words.slice(1).join(' ');
  const rest = otherWords ? `${restOfFirst} ${otherWords}` : restOfFirst;

  return { first, rest };
}

/**
 * BrandLogo: Renders the user's attached brand image if present,
 * or falls back to the clean circle emblem & typography if no image is attached.
 */
export default function BrandLogo({
  name = 'Brand',
  src = null,
  className = '',
  imgClassName = 'w-full h-full object-contain',
  fallbackClassName = '',
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const hasValidImage = Boolean(src && !imgError && typeof src === 'string' && src.trim() !== '');

  if (hasValidImage) {
    return (
      <div
        className={`bg-white flex items-center justify-center select-none overflow-hidden ${className}`}
        title={name}
      >
        <img
          src={src}
          alt={name}
          className={imgClassName}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  const color = getBrandColor(name);
  const { first, rest } = splitBrandName(name);

  return (
    <div
      className={`bg-white flex items-center justify-center p-1 select-none overflow-hidden ${className} ${fallbackClassName}`}
      title={name}
    >
      <svg
        viewBox="0 0 170 56"
        className="w-full h-full max-h-full max-w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Solid Colored Circle Emblem */}
        <circle cx="30" cy="28" r="22" fill={color.bg} />

        {/* First Letter in Crisp White inside Circle */}
        <text
          x="30"
          y="30"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
          fontWeight="900"
          fontSize="24"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {first}
        </text>

        {/* Remaining Brand Letters in Matching Brand Color outside Circle */}
        <text
          x="58"
          y="30"
          fill={color.text}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
          fontWeight="800"
          fontSize={rest.length > 15 ? "12" : rest.length > 10 ? "14" : rest.length > 6 ? "17" : "21"}
          dominantBaseline="central"
        >
          {rest}
        </text>
      </svg>
    </div>
  );
}
