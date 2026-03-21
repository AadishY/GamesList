import React, { useState, useEffect, useRef } from 'react';
import { getOptimizedImageUrl } from '../utils/imageUtils';

/**
 * OptimizedImage Component
 * 
 * Features:
 * - WebP conversion & compression via Proxy
 * - Dynamic dimension requesting
 * - Shimmer skeleton placeholder
 * - Smooth transition on load
 * - Fallback for broken images
 * - Supports native lazy loading or eager loading
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  width = 640, 
  className = "", 
  containerClassName = "",
  fit = "cover",
  position = "center",
  loading = "lazy",
  priority = false 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  const optimizedSrc = getOptimizedImageUrl(src, width);

  // If priority is true, we force eager loading
  const loadMode = priority ? "eager" : loading;

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true); // Stop shimmer on error
  };

  // Fallback image if original fails
  const fallbackSrc = `https://placehold.co/${width}x${Math.round(width * 0.5)}/1a1a1a/8b5cf6?text=${encodeURIComponent(alt || 'Game')}`;

  return (
    <div className={`relative overflow-hidden w-full h-full bg-black/5 dark:bg-white/5 ${containerClassName}`}>
      {/* Shimmer Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-black/10 dark:bg-white/10 animate-shimmer z-0"></div>
      )}
      
      <img
        ref={imgRef}
        src={error ? fallbackSrc : optimizedSrc}
        alt={alt}
        loading={loadMode}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{ objectFit: fit, objectPosition: position }}
        className={`w-full h-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} ${className}`}
      />
      
      {/* Subtle overlay gradient (optional, common in gaming UIs) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none opacity-40"></div>
    </div>
  );
};

export default React.memo(OptimizedImage);
