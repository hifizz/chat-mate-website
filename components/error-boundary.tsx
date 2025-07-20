'use client';

import React, { Component, ReactNode } from 'react';
import { AppError, ErrorType } from '@/types';
import { ErrorHandler } from '@/utils/error-handler';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: AppError, retry: () => void) => ReactNode;
  onError?: (error: AppError) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
}

/**
 * React 错误边界组件
 * 捕获子组件中的 JavaScript 错误，并显示友好的错误界面
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 将 JavaScript 错误转换为应用错误
    const appError = ErrorHandler.createError(
      ErrorType.RENDER_ERROR,
      '组件渲染失败',
      error
    );

    return {
      hasError: true,
      error: appError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误详情
    const appError = ErrorHandler.createError(
      ErrorType.RENDER_ERROR,
      '组件渲染失败',
      {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      }
    );

    // 调用错误处理器
    ErrorHandler.handle(appError, false); // 不显示 toast，因为我们有自定义 UI

    // 调用外部错误处理回调
    this.props.onError?.(appError);
  }

  /**
   * 重试操作
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  /**
   * 返回首页
   */
  handleGoHome = () => {
    window.location.href = '/';
  };

  /**
   * 刷新页面
   */
  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // 默认错误界面
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                出现了一些问题
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {this.state.error.message}
              </p>
            </div>

            {/* 错误详情（开发环境显示） */}
            {process.env.NODE_ENV === 'development' && this.state.error.details && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  错误详情:
                </h3>
                <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                  {typeof this.state.error.details === 'string'
                    ? this.state.error.details
                    : JSON.stringify(this.state.error.details, null, 2)}
                </pre>
              </div>
            )}

            {/* 恢复建议 */}
            {ErrorHandler.isRecoverable(this.state.error) && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  建议解决方案:
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 text-left space-y-1">
                  {ErrorHandler.getRecoverySuggestions(this.state.error).map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                className="flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重试
              </Button>
              
              <Button
                variant="outline"
                onClick={this.handleRefresh}
                className="flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新页面
              </Button>
              
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 高阶组件：为组件添加错误边界
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook：在函数组件中使用错误处理
 */
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error | AppError, errorType?: ErrorType) => {
    let appError: AppError;
    
    if ('type' in error) {
      // 已经是 AppError
      appError = error;
    } else {
      // 是普通的 Error，需要转换
      appError = ErrorHandler.createError(
        errorType || ErrorType.RENDER_ERROR,
        error.message,
        error
      );
    }
    
    ErrorHandler.handle(appError);
    return appError;
  }, []);

  return { handleError };
}