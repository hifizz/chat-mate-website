import React from 'react';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
  breakpoint?: number;
}

/**
 * 响应式容器组件
 * 根据屏幕尺寸应用不同的样式
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  mobileClassName = '',
  desktopClassName = '',
  breakpoint
}) => {
  const isMobile = useMobile(breakpoint);
  
  return (
    <div className={cn(
      className,
      isMobile ? mobileClassName : desktopClassName
    )}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: string;
}

/**
 * 响应式网格组件
 * 根据屏幕尺寸调整列数
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  columns = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  },
  gap = 'gap-4'
}) => {
  return (
    <div className={cn(
      'grid',
      `grid-cols-${columns.mobile}`,
      `sm:grid-cols-${columns.tablet || columns.mobile}`,
      `lg:grid-cols-${columns.desktop || columns.tablet || columns.mobile}`,
      gap,
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: {
    mobile?: 'row' | 'col';
    desktop?: 'row' | 'col';
  };
  gap?: string;
}

/**
 * 响应式堆栈组件
 * 根据屏幕尺寸调整方向
 */
export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  className = '',
  direction = {
    mobile: 'col',
    desktop: 'row'
  },
  gap = 'gap-4'
}) => {
  return (
    <div className={cn(
      'flex',
      direction.mobile === 'col' ? 'flex-col' : 'flex-row',
      direction.desktop === 'col' ? 'md:flex-col' : 'md:flex-row',
      gap,
      className
    )}>
      {children}
    </div>
  );
};