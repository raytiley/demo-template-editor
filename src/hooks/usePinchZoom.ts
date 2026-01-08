import { useCallback, useRef, useEffect } from 'react';

interface UsePinchZoomOptions {
  onZoom: (scale: number) => void;
  currentScale: number;
  minScale?: number;
  maxScale?: number;
}

/**
 * Hook for handling pinch-to-zoom gestures on touch devices.
 * Returns a ref to attach to the zoomable element.
 */
export function usePinchZoom({
  onZoom,
  currentScale,
  minScale = 0.1,
  maxScale = 3,
}: UsePinchZoomOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(currentScale);

  /**
   * Calculate distance between two touch points
   */
  const getDistance = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0;

    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  /**
   * Handle touch start - record initial distance for pinch
   */
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistanceRef.current = getDistance(e.touches);
        initialScaleRef.current = currentScale;
      }
    },
    [getDistance, currentScale]
  );

  /**
   * Handle touch move - calculate new scale from pinch gesture
   */
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 2 || initialDistanceRef.current === null) return;

      const currentDistance = getDistance(e.touches);
      const scaleFactor = currentDistance / initialDistanceRef.current;
      const newScale = initialScaleRef.current * scaleFactor;

      // Clamp to min/max
      const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));
      onZoom(clampedScale);
    },
    [getDistance, onZoom, minScale, maxScale]
  );

  /**
   * Handle touch end - reset initial distance
   */
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      initialDistanceRef.current = null;
    }
  }, []);

  /**
   * Set up touch event listeners
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use passive: false to allow preventing scroll during pinch
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return containerRef;
}
