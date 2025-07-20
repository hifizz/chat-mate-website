'use client';

import React from 'react';
import { AppError, ErrorType } from '@/types';
import { ErrorHandler } from '@/utils/error-handler';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  AlertTriangle, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight,
  Lightbulb,
  Bug,
  Wifi,
  FileX,
  Zap
} from 'lucide-react';

interface ErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

// 根据错误类型获取图标
const getErrorIcon = (errorType: ErrorType) => {
  switch (errorType) {
    case ErrorType.NETWORK_ERROR:
      return <Wifi className="h-5 w-5" />;
    case ErrorType.RENDER_ERROR:
      return <Bug className="h-5 w-5" />;
    case ErrorType.DECODE_ERROR:
    case ErrorType.URL_PARSE_ERROR:
      return <FileX className="h-5 w-5" />;
    case ErrorType.AI_SERVICE_ERROR:
      return <Zap className="h-5 w-5" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
  }
};

// 根据错误类型获取颜色主题
const getErrorTheme = (errorType: ErrorType) => {
  switch (errorType) {
    case ErrorType.NETWORK_ERROR:
      return {
        alertVariant: 'default' as const,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800'
      };
    case ErrorType.RENDER_ERROR:
      return {
        alertVariant: 'destructive' as const,
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800'
      };
    case ErrorType.AI_SERVICE_ERROR:
      return {
        alertVariant: 'default' as const,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
      };
    default:
      return {
        alertVariant: 'destructive' as const,
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800'
      };
  }
};

/**
 * 友好的错误提示界面组件
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  compact = false,
  className = ''
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const theme = getErrorTheme(error.type);
  const suggestions = ErrorHandler.getRecoverySuggestions(error);
  const isRecoverable = ErrorHandler.isRecoverable(error);

  // 紧凑模式
  if (compact) {
    return (
      <Alert variant={theme.alertVariant} className={`${className}`}>
        <div className={theme.iconColor}>
          {getErrorIcon(error.type)}
        </div>
        <AlertTitle className="text-sm">
          {ErrorHandler.handle(error, false)}
        </AlertTitle>
        {onRetry && isRecoverable && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-auto"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            重试
          </Button>
        )}
      </Alert>
    );
  }

  // 完整模式
  return (
    <Card className={`${className} ${theme.borderColor}`}>
      <CardHeader className={`${theme.bgColor} rounded-t-lg`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={theme.iconColor}>
              {getErrorIcon(error.type)}
            </div>
            <div>
              <CardTitle className="text-lg">
                {getErrorTitle(error.type)}
              </CardTitle>
              <CardDescription className="mt-1">
                {error.message}
              </CardDescription>
            </div>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* 恢复建议 */}
        {suggestions.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <h4 className="text-sm font-medium">建议解决方案</h4>
            </div>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {onRetry && isRecoverable && (
            <Button onClick={onRetry} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          )}
          
          {error.type === ErrorType.RENDER_ERROR && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // 触发 AI 修复功能
                const event = new CustomEvent('aiFixRequest', { detail: { error } });
                window.dispatchEvent(event);
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              AI 修复
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新页面
          </Button>
        </div>

        {/* 错误详情（可折叠） */}
        {(showDetails || process.env.NODE_ENV === 'development') && error.details && (
          <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start p-0 h-auto text-gray-500 hover:text-gray-700"
              >
                {isDetailsOpen ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                查看技术详情
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto whitespace-pre-wrap">
                  {typeof error.details === 'string'
                    ? error.details
                    : JSON.stringify(error.details, null, 2)}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * 根据错误类型获取标题
 */
function getErrorTitle(errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.URL_PARSE_ERROR:
      return 'URL 解析错误';
    case ErrorType.DECODE_ERROR:
      return '内容解码失败';
    case ErrorType.RENDER_ERROR:
      return '图表渲染失败';
    case ErrorType.EXPORT_ERROR:
      return '导出失败';
    case ErrorType.AI_SERVICE_ERROR:
      return 'AI 服务不可用';
    case ErrorType.NETWORK_ERROR:
      return '网络连接失败';
    default:
      return '发生错误';
  }
}

/**
 * 内联错误提示组件（用于表单等场景）
 */
export const InlineError: React.FC<{
  error: AppError;
  className?: string;
}> = ({ error, className = '' }) => {
  const theme = getErrorTheme(error.type);
  
  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <div className={theme.iconColor}>
        {getErrorIcon(error.type)}
      </div>
      <span className="text-red-600 dark:text-red-400">
        {error.message}
      </span>
    </div>
  );
};

/**
 * 全屏错误页面组件
 */
export const FullPageError: React.FC<{
  error: AppError;
  onRetry?: () => void;
}> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full">
        <ErrorDisplay
          error={error}
          onRetry={onRetry}
          showDetails={true}
          className="shadow-lg"
        />
      </div>
    </div>
  );
};

// 导出辅助函数
export { getErrorTitle };