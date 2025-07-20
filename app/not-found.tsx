'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

/**
 * 404 页面未找到组件
 */
export default function NotFound() {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 text-gray-400">
            <FileQuestion className="h-full w-full" />
          </div>
          <CardTitle className="text-2xl">页面未找到</CardTitle>
          <CardDescription>
            抱歉，您访问的页面不存在或已被移动。
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 建议解决方案 */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              您可以尝试:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>检查 URL 地址是否正确</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>返回上一页</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>访问首页重新开始</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>使用 Playground 创建新图表</span>
              </li>
            </ul>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleGoHome} className="flex items-center justify-center">
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </Button>
            
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回上页
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/playground'}
              className="flex items-center justify-center"
            >
              进入 Playground
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}