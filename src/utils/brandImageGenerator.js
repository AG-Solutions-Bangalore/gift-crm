/**
 * Brand Logo / Image Generator Utility
 * Generates clean, professional brand images from text name using HTML5 Canvas.
 */

/**
 * Generate a brand logo image file & data URL from brand name
 * @param {string} brandName - Name of the brand (e.g. "Borosil", "Milton")
 * @param {object} [options] - Customization options (theme, size, etc.)
 * @returns {Promise<{ file: File, dataUrl: string, fileName: string }>}
 */
export async function generateBrandImage(brandName, options = {}) {
  const name = String(brandName || '').trim() || 'Brand';
  const size = options.size || 600; // 600x600 high resolution
  const theme = options.theme || 'minimal-white'; // 'minimal-white' | 'dark-slate' | 'purple-accent' | 'warm-gold'

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  // Determine colors based on theme
  let bgColor = '#FFFFFF';
  let textColor = '#0F172A';
  let borderColor = '#E2E8F0';
  let accentColor = '#6366F1';
  let isDark = false;

  if (theme === 'dark-slate') {
    bgColor = '#0F172A';
    textColor = '#F8FAFC';
    borderColor = '#1E293B';
    accentColor = '#818CF8';
    isDark = true;
  } else if (theme === 'purple-accent') {
    bgColor = '#FAFAFE';
    textColor = '#4338CA';
    borderColor = '#E0E7FF';
    accentColor = '#6366F1';
  } else if (theme === 'warm-gold') {
    bgColor = '#FFFDF7';
    textColor = '#78350F';
    borderColor = '#FEF3C7';
    accentColor = '#D97706';
  }

  // 1. Draw Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // 2. Draw Soft Rounded Card Border
  const padding = 36;
  const cardWidth = size - padding * 2;
  const cardHeight = size - padding * 2;
  const radius = 32;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(padding, padding, cardWidth, cardHeight, radius);
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = borderColor;
  ctx.stroke();
  ctx.restore();

  // 3. Draw Subtle Accent Top Bar or Badge
  ctx.save();
  ctx.beginPath();
  const topBarWidth = 72;
  const topBarHeight = 6;
  ctx.roundRect((size - topBarWidth) / 2, padding + 28, topBarWidth, topBarHeight, 3);
  ctx.fillStyle = accentColor;
  ctx.fill();
  ctx.restore();

  // 4. Calculate Font Size dynamically to prevent overflow
  let fontSize = 56;
  if (name.length > 20) {
    fontSize = 32;
  } else if (name.length > 14) {
    fontSize = 40;
  } else if (name.length > 9) {
    fontSize = 48;
  }

  ctx.save();
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textColor;

  // Add subtle shadow for crisp text
  if (!isDark) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
  }

  // Draw Brand Name text in center
  ctx.fillText(name, size / 2, size / 2);
  ctx.restore();

  // 5. Draw Subtle Bottom Accent Tagline / Dot
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size - padding - 40, 4, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.fill();
  ctx.restore();

  // Convert canvas to Blob -> File
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));

  const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'brand';
  const fileName = `${cleanSlug}-logo.png`;
  const file = new File([blob], fileName, { type: 'image/png', lastModified: Date.now() });

  return { file, dataUrl, fileName };
}
