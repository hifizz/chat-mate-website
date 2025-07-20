'use client';

import { useEffect } from 'react';
import { handleGlobalError, handleUnhandledRejection } from '@/utils/error-handler';

/**
 * 全局错误处理组件
 * 监听全局错误和未处理的 Promise 拒绝
 */
export const GlobalErrorHandler: React.FC = () => {
  useEffect(() => {
    // 监听全局 JavaScript 错误
    const handleError = (event: ErrorEvent) => {
      handleGlobalError(event);
    };

    // 监听未处理的 Promise 拒绝
    const handleRejection = (event: PromiseRejectionEvent) => {
      handleUnhandledRejection(event);
    };

    // 添加事件监听器
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // 清理函数
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // 这个组件不渲染任何内容
  return null;
};