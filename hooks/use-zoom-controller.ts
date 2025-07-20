import { useState, useCallback, RefObject, useEffect, useRef } from 'react';
import { ZoomState } from '@/types';
import { debounce, throttle } from 'lodash';

interface UseZoomControllerProps {
  targetRef: RefObject<HTMLElement>;
  minScale?: number;
  maxScale?: number;
  step?: number;
  initialScale?: number;
  onZoomChange?: (scale: number) => void;
  animationDuration?: number;
}

interface UseZoomControllerResult {
  scale: number;
  translateX: number;
  translateY: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (scale: number) => void;
  handleWheel: (e: React.WheelEvent<HTMLElement>) => void;
  handleTouchStart: (e: React.TouchEvent<HTMLElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLElement>) => void;
  handleTouchEnd: () => void;
  handleDoubleClick: () => void;
  handleMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  handleMouseUp: () => void;
  isAnimating: boolean;
}

/**
 * 缩放控制 Hook
 * 提供缩放状态管理和交互处理
 */
export const useZoomController = ({
  targetRef,
  minScale = 0.5,
  maxScale = 3,
  step = 0.1,
  initialScale = 1,
  onZoomChange,
  animationDuration = 200
}: UseZoomControllerProps): UseZoomControllerResult => {
  // 缩放状态
  const [scale, setScale] = useState<number>(initialScale);

  // 平移状态
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);

  // 拖动状态
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);

  // 触摸缩放状态
  const [startDistance, setStartDistance] = useState<number>(0);

  // 动画状态
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 防抖和节流处理
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastWheelTimeRef = useRef<number>(0);
  const wheelAccumulatorRef = useRef<number>(0);

  // 设置缩放比例（带边界限制）
  const setZoom = useCallback((newScale: number, animate: boolean = false) => {
    // 确保缩放比例在边界范围内
    const boundedScale = Math.min(Math.max(newScale, minScale), maxScale);

    if (boundedScale !== scale) {
      // 如果需要动画效果
      if (animate) {
        setIsAnimating(true);

        // 清除之前的动画超时
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }

        // 设置新的动画超时
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
          animationTimeoutRef.current = null;
        }, animationDuration);
      }

      setScale(boundedScale);
      onZoomChange?.(boundedScale);
    }
  }, [scale, minScale, maxScale, onZoomChange, animationDuration]);

  // 放大（带动画）
  const zoomIn = useCallback(() => {
    setZoom(scale + step, true);
  }, [scale, step, setZoom]);

  // 缩小（带动画）
  const zoomOut = useCallback(() => {
    setZoom(scale - step, true);
  }, [scale, step, setZoom]);

  // 重置缩放和位置（带动画）
  const resetZoom = useCallback(() => {
    setIsAnimating(true);

    // 清除之前的动画超时
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // 设置新的动画超时
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      animationTimeoutRef.current = null;
    }, animationDuration);

    setScale(initialScale);
    setTranslateX(0);
    setTranslateY(0);
    onZoomChange?.(initialScale);
  }, [initialScale, onZoomChange, animationDuration]);

  // 创建节流版本的缩放更新函数
  const throttledZoomUpdate = useCallback(
    throttle((newScale: number, newTranslateX: number, newTranslateY: number) => {
      setScale(newScale);
      setTranslateX(newTranslateX);
      setTranslateY(newTranslateY);
      onZoomChange?.(newScale);
    }, 16), // 约 60fps 的更新频率
    [onZoomChange]
  );

  // 创建防抖版本的动画触发函数
  const debouncedAnimationTrigger = useCallback(
    debounce(() => {
      setIsAnimating(true);
      
      // 动画结束后重置状态
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        animationTimeoutRef.current = null;
      }, animationDuration);
    }, 100), // 100ms 防抖延迟
    [animationDuration]
  );

  // 处理滚轮缩放（优化的防抖和节流）
  const handleWheel = useCallback((e: React.WheelEvent<HTMLElement>) => {
    e.preventDefault();

    const now = Date.now();
    const timeDelta = now - lastWheelTimeRef.current;
    
    // 如果距离上次滚轮事件时间过长，重置累积器
    if (timeDelta > 100) {
      wheelAccumulatorRef.current = 0;
    }
    
    lastWheelTimeRef.current = now;

    // 累积滚轮增量，提供更平滑的缩放体验
    const delta = e.deltaY * -0.01;
    wheelAccumulatorRef.current += delta;

    // 计算新的缩放比例
    const newScale = Math.min(Math.max(scale + wheelAccumulatorRef.current, minScale), maxScale);

    // 如果缩放比例没有变化，则不需要进一步处理
    if (Math.abs(newScale - scale) < 0.001) return;

    // 获取鼠标相对于目标元素的位置
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 根据鼠标位置调整平移，保持鼠标指向的点不变
      const scaleFactor = newScale / scale;
      const newTranslateX = mouseX - (mouseX - translateX) * scaleFactor;
      const newTranslateY = mouseY - (mouseY - translateY) * scaleFactor;

      // 使用节流更新状态，确保流畅的视觉反馈
      throttledZoomUpdate(newScale, newTranslateX, newTranslateY);

      // 重置累积器
      wheelAccumulatorRef.current = 0;

      // 触发防抖动画
      debouncedAnimationTrigger();
    } else {
      // 如果没有目标元素，则简单地更新缩放比例
      setZoom(newScale);
      wheelAccumulatorRef.current = 0;
    }
  }, [scale, translateX, translateY, minScale, maxScale, setZoom, targetRef, throttledZoomUpdate, debouncedAnimationTrigger]);

  // 处理触摸开始
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    // 停止任何正在进行的动画
    setIsAnimating(false);

    if (e.touches.length === 1) {
      // 单指拖动
      setIsDragging(true);
      setStartX(e.touches[0].clientX - translateX);
      setStartY(e.touches[0].clientY - translateY);
    } else if (e.touches.length === 2) {
      // 双指缩放
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      setStartDistance(distance);
    }

    // 注意：不要在这里调用 e.preventDefault()，
    // 这可能会导致某些浏览器中的触摸事件被完全阻止
  }, [translateX, translateY]);

  // 处理触摸移动
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    // 防止默认行为，避免页面滚动干扰
    e.preventDefault();

    if (e.touches.length === 1) {
      // 单指拖动 - 始终处理单指移动事件
      // 无论 isDragging 状态如何，都确保响应滑动
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;

      if (isDragging) {
        // 计算新的平移位置
        const x = touchX - startX;
        const y = touchY - startY;

        // 应用平移
        setTranslateX(x);
        setTranslateY(y);
      } else {
        // 如果不是拖动状态，初始化拖动
        setIsDragging(true);
        setStartX(touchX - translateX);
        setStartY(touchY - translateY);
      }
    } else if (e.touches.length === 2) {
      // 双指缩放
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 计算缩放比例变化
      const delta = (distance - startDistance) * 0.01;
      const newScale = Math.min(Math.max(scale + delta, minScale), maxScale);

      // 如果缩放比例没有变化，则不需要进一步处理
      if (newScale === scale) {
        return;
      }

      // 计算双指中心点，以此为缩放中心
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();

        // 计算双指中心点相对于目标元素的位置
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

        // 根据双指中心点调整平移，保持中心点位置不变
        const scaleFactor = newScale / scale;
        const newTranslateX = centerX - (centerX - translateX) * scaleFactor;
        const newTranslateY = centerY - (centerY - translateY) * scaleFactor;

        setTranslateX(newTranslateX);
        setTranslateY(newTranslateY);
        setScale(newScale);
        onZoomChange?.(newScale);
      } else {
        // 如果没有目标元素，则简单地更新缩放比例
        setZoom(newScale);
      }

      setStartDistance(distance);
    }
  }, [isDragging, startX, startY, scale, translateX, translateY, startDistance, minScale, maxScale, setZoom, targetRef, onZoomChange]);

  // 处理触摸结束
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);

    // 触摸结束后添加动画效果
    setIsAnimating(true);

    // 清除之前的动画超时
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // 设置新的动画超时
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      animationTimeoutRef.current = null;
    }, animationDuration);
  }, [animationDuration]);

  // 双击重置缩放
  const handleDoubleClick = useCallback(() => {
    resetZoom();
  }, [resetZoom]);

  // 监听键盘事件 (Esc 键重置)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      // 清除所有超时
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [resetZoom]);

  // 处理鼠标按下
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    // 只处理左键点击
    if (e.button === 0) {
      // 停止任何正在进行的动画
      setIsAnimating(false);

      // 设置拖动状态
      setIsDragging(true);

      // 记录起始位置
      setStartX(e.clientX - translateX);
      setStartY(e.clientY - translateY);

      // 防止默认行为
      e.preventDefault();
    }
  }, [translateX, translateY]);

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (isDragging) {
      // 计算新的平移位置
      const x = e.clientX - startX;
      const y = e.clientY - startY;

      // 应用平移
      setTranslateX(x);
      setTranslateY(y);

      // 防止默认行为
      e.preventDefault();
    }
  }, [isDragging, startX, startY]);

  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);

      // 添加动画效果
      setIsAnimating(true);

      // 清除之前的动画超时
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      // 设置新的动画超时
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        animationTimeoutRef.current = null;
      }, animationDuration);
    }
  }, [isDragging, animationDuration]);

  // 添加全局鼠标事件监听
  useEffect(() => {
    // 如果正在拖动，添加全局鼠标事件监听
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const x = e.clientX - startX;
        const y = e.clientY - startY;

        setTranslateX(x);
        setTranslateY(y);
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);

        // 添加动画效果
        setIsAnimating(true);

        // 清除之前的动画超时
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }

        // 设置新的动画超时
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
          animationTimeoutRef.current = null;
        }, animationDuration);
      };

      // 添加全局事件监听
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      // 清理函数
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, startX, startY, animationDuration]);

  return {
    scale,
    translateX,
    translateY,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleDoubleClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isAnimating
  };
};