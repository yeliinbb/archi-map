"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  aspectRatio?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  sizes = "100vw",
  priority = false,
  className,
  fill,
  aspectRatio,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  const useFill = fill || (!width && !height);

  const imageElement = (
    <Image
      src={src}
      alt={alt}
      width={useFill ? undefined : width}
      height={useFill ? undefined : height}
      fill={useFill}
      sizes={sizes}
      priority={priority}
      className={cn(
        "transition-opacity duration-300",
        isLoaded ? "opacity-100" : "opacity-0",
        useFill ? "object-cover" : undefined,
        className,
      )}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
    />
  );

  return (
    <div
      className={cn("relative overflow-hidden", useFill ? undefined : "inline-block")}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <div
        className={cn(
          "absolute inset-0 animate-pulse bg-muted transition-opacity duration-300",
          isLoaded ? "opacity-0" : "opacity-100",
        )}
      />
      {imageElement}
    </div>
  );
}
