
import React from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { ArrowDown, RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
  threshold?: number;
}

export function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  threshold = 80
}: PullToRefreshProps) {
  const { pullDistance, isRefreshing, isPulling } = usePullToRefresh({
    onRefresh,
    threshold,
    disabled
  });
  
  const progress = Math.min(pullDistance / threshold, 1);
  const showIndicator = isPulling || isRefreshing;
  
  return (
    <div className="relative w-full">
      {/* Pull to refresh indicator */}
      {showIndicator && (
        <div
          className="absolute left-0 right-0 flex justify-center items-center transition-transform"
          style={{
            transform: `translateY(${pullDistance}px)`,
            top: -40,
            height: 40,
            zIndex: 50
          }}
        >
          <div className="bg-background shadow-sm rounded-full w-10 h-10 flex items-center justify-center">
            {isRefreshing ? (
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <ArrowDown
                className="h-5 w-5 transition-transform text-primary"
                style={{ 
                  transform: `rotate(${180 * progress}deg)`,
                  opacity: Math.max(0.5, progress)
                }}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Content container with pull-down animation */}
      <div
        style={{ transform: showIndicator ? `translateY(${pullDistance}px)` : 'translateY(0)' }}
        className="w-full transition-transform"
      >
        {children}
      </div>
    </div>
  );
}
