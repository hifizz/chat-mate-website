'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ErrorHandler } from '@/utils/error-handler';
import { ErrorType } from '@/types';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 应用级错误页面
 * 当应用发生未捕获的错误时显示
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // 记录错误到错误处理系统
    const appError = ErrorHandler.createError(
      ErrorType.RENDER_ERROR,
      '应用发生未捕获的错误',
      {
        message: error.message,
        stack: error.stack,
        digest: error.digest
      }
    );
    
    ErrorHandler.handle(appError, false); // 不显示 toast，因为我们有自定义页面
  }, [error]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 text-red-500">
            <AlertTriangle className="h-full w-full" />
          </div>
          <CardTitle className="text-2xl">出现了一些问题</CardTitle>
          <CardDescription>
            应用遇到了意外错误，我们已经记录了这个问题。
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 错误信息（开发环境显示） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                错误详情:
              </h3>
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto whitespace-pre-wrap">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </div>
          )}

          {/* 建议解决方案 */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              建议解决方案:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>刷新页面重试</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>清除浏览器缓存</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>返回首页重新开始</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>如果问题持续，请联系技术支持</span>
              </li>
            </ul>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} className="flex items-center justify-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新页面
            </Button>
            
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex items-center justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}