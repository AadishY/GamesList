/**
 * NEW: Powerful image compression system using images.weserv.nl proxy 
 * for WebP conversion, exact resizing, and high performance.
 */
export const getOptimizedImageUrl = (url, width = 640) => {
  if (!url) return '';

  // 1. Identify native optimization support (already decent)
  let optimizedUrl = url;
  
  // Specific RAWG native resizer (no proxy needed for simple cases)
  if (url.includes('media.rawg.io/media/games/')) {
    if (!url.includes('/resize/')) {
      const mediaIndex = url.indexOf('/media/games/');
      if (mediaIndex !== -1) {
        const prefix = url.substring(0, mediaIndex + 7);
        const suffix = url.substring(mediaIndex + 7);
        const resizeWidth = width <= 200 ? 200 : width <= 420 ? 420 : width <= 640 ? 640 : 1280;
        optimizedUrl = `${prefix}resize/${resizeWidth}/-/${suffix}`;
      }
    }
  }

  // 2. Wrap EVERYTHING in a fast WebP Proxy for guaranteed compression & format
  // We use images.weserv.nl which is a very fast, free, and global image proxy.
  // This ensures WebP output even if the source is PNG/JPG.
  const cleanUrl = optimizedUrl.replace(/^https?:\/\//, '');
  
  // Parameters:
  // url: encoded source url
  // w: width
  // output: format (webp)
  // q: quality (82 is sweet spot)
  // il: interlaced (for progressive load feel)
  // n: number of iterations (for better compression)
  return `https://images.weserv.nl/?url=${encodeURIComponent(optimizedUrl)}&w=${width}&output=webp&q=82&il&fit=cover`;
};

/**
 * Helper to get different sizes for srcset
 */
export const getResponsiveSrcSet = (url, sizes = [320, 640, 1024]) => {
  return sizes.map(w => `${getOptimizedImageUrl(url, w)} ${w}w`).join(', ');
};
