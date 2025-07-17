'use client';

import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { MermaidViewer } from '@/components/mermaid-viewer';
import { AppError, ErrorType, MermaidTheme } from '@/types';
import { getURLParamsFromBrowser } from '@/utils/url';
import { decodePakoContent } from '@/utils/pako';

// 默认的 Mermaid 图表示例
const DEFAULT_MERMAID_CONTENT = `graph TD
    A[开始] --> B{是否有参数?}
    B -->|是| C[解析参数]
    B -->|否| D[显示默认图表]
    C --> E[渲染图表]
    D --> E
    E --> F[结束]`;

export default function Home() {
  const [content, setContent] = useState<string>(DEFAULT_MERMAID_CONTENT);
  const [theme, setTheme] = useState<MermaidTheme>('default');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);

  // 从 URL 加载内容
  useEffect(() => {
    try {
      // 获取 URL 参数
      const params = getURLParamsFromBrowser();
      
      // 如果有 pako 参数，解码内容
      if (params.pako) {
        try {
          const decodedContent = decodePakoContent(params.pako);
          setContent(decodedContent);
        } catch (err) {
          setError({
            type: ErrorType.DECODE_ERROR,
            message: '无法解码 URL 内容',
            details: err
          });
          // 保留默认内容
        }
      }
      
      // 设置主题
      if (params.theme) {
        setTheme(params.theme as MermaidTheme);
      }
      
      setIsLoading(false);
    } catch (err) {
      setError({
        type: ErrorType.URL_PARSE_ERROR,
        message: '解析 URL 参数失败',
        details: err
      });
      setIsLoading(false);
    }
  }, []);

  // 处理渲染错误
  const handleRenderError = (error: AppError) => {
    setError(error);
  };

  // 渲染完成回调
  const handleRenderComplete = () => {
    console.log('图表渲染完成');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-10 bg-background border-b border-border h-14 flex items-center px-4">
        <h1 className="text-lg font-semibold flex-1">Mermaid 图表查看器</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="flex-1 p-4">
        <div className="container mx-auto h-full flex flex-col">
          {/* 错误提示 */}
          {error && !isLoading && (
            <div className="mb-4 p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md text-red-800 dark:text-red-300">
              <h3 className="text-lg font-medium mb-2">发生错误</h3>
              <p>{error.message}</p>
            </div>
          )}

          {/* 图表查看器 */}
          <div className="flex-1 border border-border rounded-md overflow-hidden">
            <MermaidViewer 
              content={content}
              theme={theme}
              onError={handleRenderError}
              onRenderComplete={handleRenderComplete}
            />
          </div>
        </div>
      </main>

      {/* 底部状态栏 */}
      <footer className="bg-muted py-2 px-4 text-center text-sm text-muted-foreground">
        <p>Mermaid 图表查看器 - 基于 Next.js 和 Mermaid.js 构建</p>
      </footer>
    </div>
  );
}