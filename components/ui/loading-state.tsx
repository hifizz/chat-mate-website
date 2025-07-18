import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 加载状态组件
 * 显示加载动画和可选的消息
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = '加载中...',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-4",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin text-primary",
        sizeClasses[size]
      )} />
      {message && (
        <p className={cn(
          "mt-2 text-muted-foreground",
          textSizeClasses[size]
        )}>
          {message}
        </p>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * 错误状态组件
 * 显示错误信息和可选的重试按钮
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = '发生错误',
  message,
  details,
  onRetry,
  className = ''
}) => {
  return (
    <div className={cn(
      "p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md text-red-800 dark:text-red-300",
      className
    )}>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p>{message}</p>
      
      {details && (
        <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded overflow-auto text-sm">
          {details}
        </pre>
      )}
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-3 py-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/70 rounded text-sm font-medium transition-colors"
        >
          重试
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * 空状态组件
 * 显示空内容提示和可选的操作按钮
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '没有内容',
  message,
  action,
  className = ''
}) => {
  return (
    <div className={cn(
      "p-8 text-center",
      className
    )}>
      <h3 className="text-lg font-medium mb-2 text-muted-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};