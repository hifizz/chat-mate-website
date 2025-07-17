import { useState, useEffect } from 'react';

/**
 * 移动设备检测 Hook
 * @param breakpoint - 移动设备断点宽度（默认为 768px）
 * @returns 是否为移动设备
 */
export const useMobile = (breakpoint: number = 768): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // 初始检测
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // 首次运行
    checkMobile();

    // 添加窗口大小变化监听
    window.addEventListener('resize', checkMobile);

    // 清理监听器
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
};