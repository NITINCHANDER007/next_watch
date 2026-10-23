// Helper to generate elegant, modern cinematic SVG backdrop or poster as fallback
export const OTT_THEME_COLORS = {
  nf: '#E50914',
  pv: '#00A8E1',
  hs: '#113CCF',
  appleTV: '#A0A5AA',
  zee5: '#A12B88',
  viu: '#FACB12',
  hulu: '#1CE783',
  vivamax: '#FF5722',
  hoichoi: '#FF1744'
};

export function getFallbackImage(title = '', type = 'backdrop', themeColor = null, ott = 'nf') {
  const isPoster = type === 'poster';
  const width = isPoster ? 400 : 800;
  const height = isPoster ? 600 : 450;
  
  // Resolve theme color from ott or passed theme
  const brandColor = themeColor || OTT_THEME_COLORS[ott] || '#00A8E1';

  // Elegant dark cinematic SVG without duplicate text (title is rendered crisply by DOM)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <radialGradient id="cinematic-glow" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="${brandColor}" stop-opacity="0.28"/>
          <stop offset="60%" stop-color="#12151c" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#0a0b0e" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="bottom-vignette" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="50%" stop-color="transparent" stop-opacity="0"/>
          <stop offset="100%" stop-color="#07080a" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="accent-bar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${brandColor}" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
        </linearGradient>
      </defs>
      
      <!-- Base Background -->
      <rect width="100%" height="100%" fill="#0a0b0e"/>
      <rect width="100%" height="100%" fill="url(#cinematic-glow)"/>
      
      <!-- Subtle Ambient Film Texture / Grid Lines -->
      <g opacity="0.06">
        <line x1="0" y1="${height * 0.25}" x2="${width}" y2="${height * 0.25}" stroke="#ffffff" stroke-width="1"/>
        <line x1="0" y1="${height * 0.75}" x2="${width}" y2="${height * 0.75}" stroke="#ffffff" stroke-width="1"/>
        <line x1="${width * 0.3}" y1="0" x2="${width * 0.3}" y2="${height}" stroke="#ffffff" stroke-width="1"/>
        <line x1="${width * 0.7}" y1="0" x2="${width * 0.7}" y2="${height}" stroke="#ffffff" stroke-width="1"/>
      </g>
      
      <!-- Center Minimalist Cinematic Play / Cinema Reel Glyph -->
      <g transform="translate(${width / 2}, ${height / 2 - 15})" opacity="0.22">
        <circle cx="0" cy="0" r="${isPoster ? 38 : 46}" fill="none" stroke="${brandColor}" stroke-width="2.5" stroke-dasharray="4 4"/>
        <polygon points="-8,-14 -8,14 14,0" fill="${brandColor}"/>
      </g>

      <!-- Bottom Dark Vignette for Pristine DOM Text Legibility -->
      <rect width="100%" height="100%" fill="url(#bottom-vignette)"/>

      <!-- Sleek Top Accent Line -->
      <rect x="0" y="0" width="${width}" height="3" fill="url(#accent-bar)"/>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
