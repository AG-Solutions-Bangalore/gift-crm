import React, { useState, useEffect, useMemo } from 'react';
import { resolveImageUrl } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const DEFAULT_NO_IMAGE = 'https://memorycreators.in/crmapi/public/assets/images/no_image.jpg';
const INLINE_FALLBACK_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="3" ry="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';

/**
 * Extracts all valid image URLs from a product, variant, image array, or string.
 */
export const extractAllImageUrls = (source, imageUrlList = []) => {
  if (!source) return [];
  const urls = [];

  const pushValid = (raw, type = 'product') => {
    if (!raw || raw === 'null' || raw === 'undefined' || raw === 'none' || String(raw).trim() === '') return;
    
    let resolved = '';
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('blob:')
      ) {
        resolved = trimmed;
      } else {
        resolved = resolveImageUrl(type, trimmed, imageUrlList);
      }
    } else if (raw instanceof File) {
      resolved = URL.createObjectURL(raw);
    } else if (raw?.file instanceof File) {
      resolved = URL.createObjectURL(raw.file);
    } else if (raw?.preview) {
      resolved = raw.preview;
    } else if (typeof raw?.product_images === 'string') {
      resolved = resolveImageUrl(type, raw.product_images, imageUrlList);
    } else if (typeof raw?.product_variant_images === 'string') {
      resolved = resolveImageUrl('variant', raw.product_variant_images, imageUrlList);
    } else if (typeof raw?.image === 'string') {
      resolved = resolveImageUrl(type, raw.image, imageUrlList);
    } else if (typeof raw?.url === 'string') {
      resolved = raw.url;
    }

    if (resolved && !urls.includes(resolved)) {
      urls.push(resolved);
    }
  };

  // 1. If source is a string URL
  if (typeof source === 'string') {
    pushValid(source);
    return urls;
  }

  // 2. If source is an array of images/strings
  if (Array.isArray(source)) {
    source.forEach((item) => {
      if (typeof item === 'string') {
        pushValid(item);
      } else if (item) {
        const raw = item.product_images || item.product_variant_images || item.image || item.url || item.preview || item.file;
        const type = item.product_variant_images ? 'variant' : 'product';
        pushValid(raw || item, type);
      }
    });
    return urls;
  }

  // 3. If source is a Product object
  if (typeof source === 'object') {
    // A. Direct product images
    if (Array.isArray(source.images) && source.images.length > 0) {
      source.images.forEach((img) => {
        if (typeof img === 'string') {
          pushValid(img, 'product');
        } else if (img) {
          const raw = img.product_images || img.product_variant_images || img.image || img.url || img.preview || img.file || img.image_name;
          const type = img.product_variant_images ? 'variant' : 'product';
          pushValid(raw, type);
        }
      });
    }

    // B. product_images field
    if (source.product_images) {
      if (Array.isArray(source.product_images)) {
        source.product_images.forEach((img) => {
          const raw = typeof img === 'string' ? img : img.product_images || img.image || img.url || img.preview;
          pushValid(raw, 'product');
        });
      } else if (typeof source.product_images === 'string') {
        pushValid(source.product_images, 'product');
      }
    }

    // C. Single image fields
    if (source.image) pushValid(source.image, 'product');
    if (source.product_image) pushValid(source.product_image, 'product');
    if (source.thumbnail) pushValid(source.thumbnail, 'product');

    // D. Variant images if available
    const vList = source.variants || source.product_variants || [];
    if (Array.isArray(vList) && vList.length > 0) {
      vList.forEach((v) => {
        if (Array.isArray(v.images) && v.images.length > 0) {
          v.images.forEach((vImg) => {
            const raw = typeof vImg === 'string' ? vImg : vImg.product_variant_images || vImg.product_images || vImg.image || vImg.url || vImg.preview;
            pushValid(raw, 'variant');
          });
        } else if (Array.isArray(v.product_variant_images)) {
          v.product_variant_images.forEach((vImg) => {
            const raw = typeof vImg === 'string' ? vImg : vImg.product_variant_images || vImg.product_images || vImg.image || vImg.url || vImg.preview;
            pushValid(raw, 'variant');
          });
        } else if (v.product_variant_images || v.product_images || v.image) {
          const raw = v.product_variant_images || v.product_images || v.image;
          pushValid(raw, 'variant');
        }
      });
    }
  }

  return urls;
};

/**
 * AutoMovingImage Component
 * Automatically cycles through multiple images with smooth cross-fade animation and fallback handling.
 */
export default function AutoMovingImage({
  images,
  product,
  alt = 'Product image',
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full relative overflow-hidden flex items-center justify-center',
  interval = 2400,
  showDots = false,
  showCounter = false,
  fallbackSrc = DEFAULT_NO_IMAGE,
  imageUrlList
}) {
  let contextImageUrls = [];
  try {
    const appContext = useAppContext();
    contextImageUrls = appContext?.imageUrls || [];
  } catch {
    contextImageUrls = [];
  }

  const effectiveImageUrlList = imageUrlList || contextImageUrls || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState(() => new Set());

  // Resolve all image URLs from provided source
  const rawImages = useMemo(() => {
    return extractAllImageUrls(images || product, effectiveImageUrlList);
  }, [images, product, effectiveImageUrlList]);

  // Filter out any broken/failed URLs
  const validImages = useMemo(() => {
    const filtered = rawImages.filter((url) => !failedUrls.has(url));
    if (filtered.length > 0) return filtered;
    return [fallbackSrc];
  }, [rawImages, failedUrls, fallbackSrc]);

  const totalImages = validImages.length;

  // Auto-move / slideshow timer
  useEffect(() => {
    if (totalImages <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalImages);
    }, interval);

    return () => clearInterval(timer);
  }, [totalImages, interval]);

  // Handle image load error safely
  const handleImageError = (failedUrl, e) => {
    if (failedUrl && !failedUrls.has(failedUrl)) {
      setFailedUrls((prev) => {
        const next = new Set(prev);
        next.add(failedUrl);
        return next;
      });
    }
    if (e?.currentTarget) {
      e.currentTarget.onerror = null;
      e.currentTarget.src = INLINE_FALLBACK_SVG;
    }
  };

  const safeIndex = totalImages > 0 ? currentIndex % totalImages : 0;

  // Single Image Render
  if (totalImages <= 1) {
    const singleSrc = validImages[0] || fallbackSrc;
    return (
      <div className={containerClassName}>
        <img
          src={singleSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={className}
          onError={(e) => handleImageError(singleSrc, e)}
        />
      </div>
    );
  }

  // Multi-Image Slideshow Render
  return (
    <div className={containerClassName}>
      {validImages.map((src, idx) => {
        const isActive = idx === safeIndex;
        return (
          <img
            key={`${src}_${idx}`}
            src={src}
            alt={`${alt} (${idx + 1}/${totalImages})`}
            loading={idx === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={`${className} absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
            }`}
            onError={(e) => handleImageError(src, e)}
          />
        );
      })}

      {/* Counter Badge */}
      {showCounter && totalImages > 1 && (
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-slate-900/70 text-white text-[9px] font-bold z-2 pointer-events-none backdrop-blur-xs">
          {safeIndex + 1}/{totalImages}
        </span>
      )}

      {/* Mini Dot Indicators */}
      {showDots && totalImages > 1 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-2 pointer-events-none">
          {validImages.map((_, idx) => (
            <span
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === safeIndex
                  ? 'w-3 bg-purple-600 shadow-xs'
                  : 'w-1 bg-slate-300/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
