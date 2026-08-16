import React, { useState } from "react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  containerClassName?: string;
}

/**
 * Component hiển thị ảnh thông minh:
 * - Có hiệu ứng CSS Skeleton Loading (animate-pulse Shimmer) trong khi chờ tải ảnh.
 * - Ưu tiên tải `src` (URL từ CDN/ImageKit).
 * - Nếu tải thất bại, tự động fallback về `fallbackSrc` (file local).
 */
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt,
  className = "",
  containerClassName = "",
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc || "");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
      console.warn(`[IMAGE FALLBACK] Lỗi tải ảnh (${imgSrc}), chuyển sang fallback (${fallbackSrc})`);
      setHasError(true);
      setImgSrc(fallbackSrc);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* CSS Skeleton Loading Shimmer Effect */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-slate-200/80 dark:bg-slate-700/60 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-slate-400/40 border-t-slate-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Actual Image */}
      <img
        src={imgSrc}
        alt={alt || ""}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-500 ease-out ${
          isLoading ? "opacity-0 scale-98" : "opacity-100 scale-100"
        } ${className}`}
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;
