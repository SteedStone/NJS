"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
}

// Function to validate and clean image URL
function validateImageSrc(src: string): string {
  // Handle null, undefined, or non-string values
  if (!src || typeof src !== 'string') {
    console.warn('Invalid image src provided:', src);
    return "/images/placeholder-product.svg";
  }

  // Remove any whitespace
  const cleanSrc = src.trim();
  
  // If empty after trim, return placeholder
  if (!cleanSrc) {
    console.warn('Empty image src after trim:', src);
    return "/images/placeholder-product.svg";
  }

  // Handle data URLs
  if (cleanSrc.startsWith('data:')) {
    return cleanSrc;
  }

  // Check if it's a valid URL format
  try {
    // For absolute URLs, validate with URL constructor
    if (cleanSrc.startsWith('http://') || cleanSrc.startsWith('https://')) {
      new URL(cleanSrc);
      return cleanSrc;
    }
    
    // For relative URLs, ensure they start with /
    if (cleanSrc.startsWith('/')) {
      return cleanSrc;
    }
    
    // If it doesn't start with /, add it (for images like "image.jpg")
    return `/${cleanSrc}`;
  } catch (error) {
    // If URL validation fails, log and return placeholder
    console.warn('Invalid URL format for image src:', cleanSrc, error);
    return "/images/placeholder-product.svg";
  }
}

export default function OptimizedImage({ 
  src, 
  alt, 
  width = 400, 
  height = 400, 
  className = "",
  priority = false,
  fill = false
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Validate and clean the src
  const validSrc = validateImageSrc(src);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center rounded-lg ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🍞</div>
          <div className="text-sm">Image non disponible</div>
        </div>
      </div>
    );
  }

  if (fill) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg z-10"></div>
        )}
        <Image
          src={validSrc}
          alt={alt}
          fill
          className={`object-cover rounded-lg transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div 
          className="bg-gray-200 animate-pulse rounded-lg"
          style={{ width, height }}
        />
      )}
      <Image
        src={validSrc}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover rounded-lg transition-opacity duration-300 ${
          isLoading ? "opacity-0 absolute inset-0" : "opacity-100"
        }`}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  );
}