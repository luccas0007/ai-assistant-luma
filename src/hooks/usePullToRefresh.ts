
import { useState, useEffect, useCallback } from 'react';

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void>;
  threshold?: number; // Minimum pull distance to trigger refresh
  disabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false
}: UsePullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Track touch start position
  const [startY, setStartY] = useState(0);
  
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return;
      
      // Only activate pull-to-refresh when at the top of the page
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
        setIsPulling(true);
      }
    },
    [disabled]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling || disabled) return;
      
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      
      // Only allow pulling down, not up
      if (distance > 0) {
        // Apply resistance to the pull (gets harder the further you pull)
        const resistedDistance = Math.min(distance * 0.4, threshold * 1.5);
        setPullDistance(resistedDistance);
        
        // Prevent default scrolling when pulling down at the top
        if (window.scrollY === 0) {
          e.preventDefault();
        }
      }
    },
    [isPulling, startY, threshold, disabled]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;
    
    // If pulled past threshold, trigger refresh
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setIsPulling(false);
  }, [isPulling, pullDistance, threshold, onRefresh, disabled]);

  useEffect(() => {
    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      // Remove event listeners on cleanup
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    pullDistance,
    isRefreshing,
    isPulling
  };
}
