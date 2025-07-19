import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useZoomController } from '@/hooks/use-zoom-controller';
import { FloatingZoomControl } from './zoom-control';

interface TouchFriendlyContainerProps {
  children: React.ReactNode;
  className?: string;
  onZoomChange?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  showControls?: boolean;
}

export interface TouchFriendlyContainerHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  getScale: () => number;
}

/**
 * 触控友好的容器组件
 * 支持触控板双指缩放和移动端触摸缩放
 */
export const TouchFriendlyContainer = forwardRef<TouchFriendlyContainerHandle, TouchFriendlyContainerProps>(({
  children,
  className = '',
  onZoomChange,
  minScale = 0.5,
  maxScale = 3,
  initialScale = 1,
  showControls = true
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 使用缩放控制 Hook
  const {
    scale,
    translateX,
    translateY,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleDoubleClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isAnimating
  } = useZoomController({
    targetRef: contentRef as React.RefObject<HTMLElement>,
    minScale,
    maxScale,
    initialScale,
    onZoomChange
  });

  // 暴露缩放方法给父组件
  useImperativeHandle(ref, () => ({
    zoomIn,
    zoomOut,
    resetZoom,
    getScale: () => scale
  }));

  return (
    <div
      ref={containerRef}
      className={cn(
        "touch-friendly-container relative w-full h-full",
        className
      )}
    >
      {/* 缩放控制器 */}
      {showControls && (
        <FloatingZoomControl
          scale={scale}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetZoom={resetZoom}
          minScale={minScale}
          maxScale={maxScale}
        />
      )}

      {/* 可缩放的内容容器 */}
      <div
        className="w-full h-full overflow-hidden"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: 'grab' }}
      >
        <div
          ref={contentRef}
          className="transform-container w-full h-full flex items-center justify-center"
          style={{
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isAnimating ? 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
});

TouchFriendlyContainer.displayName = 'TouchFriendlyContainer';