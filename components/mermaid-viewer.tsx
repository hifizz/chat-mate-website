import React, { useRef, useEffect } from 'react';
import { MermaidViewerProps, ErrorType, AppError } from '@/types';
import { useMermaid } from '@/hooks/use-mermaid';
import { cn } from '@/lib/utils';

/**
 * Mermaid 图表查看器组件
 */
export const MermaidViewer: React.FC<MermaidViewerProps> = ({
  content,
  theme = 'default',
  onError,
  onRenderComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 使用 Mermaid Hook 渲染图表
  const { svg, loading, error, renderMermaid } = useMermaid({
    content,
    theme,
    onError
  });
  
  // 当 SVG 更新时，将其插入到容器中
  useEffect(() => {
    if (svg && containerRef.current) {
      containerRef.current.innerHTML = svg;
      
      // 通知渲染完成
      onRenderComplete?.();
    }
  }, [svg, onRenderComplete]);
  
  // 处理错误显示
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md text-red-800 dark:text-red-300">
        <h3 className="text-lg font-medium mb-2">渲染错误</h3>
        <p>{error.message}</p>
        {error.details && (
          <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded overflow-auto text-sm">
            {typeof error.details === 'string' 
              ? error.details 
              : JSON.stringify(error.details, null, 2)}
          </pre>
        )}
      </div>
    );
  };
  
  // 处理加载状态
  const renderLoading = () => {
    if (!loading) return null;
    
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        <span className="ml-2">正在渲染图表...</span>
      </div>
    );
  };
  
  // 处理空内容
  const renderEmptyState = () => {
    if (content.trim() || loading || error) return null;
    
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <p className="mb-4">没有图表内容可显示</p>
        <p className="text-sm">
          请在 URL 中添加 <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">pako</code> 参数，
          或者使用工具栏创建新图表
        </p>
      </div>
    );
  };
  
  return (
    <div className="mermaid-viewer-container w-full h-full">
      {renderLoading()}
      {renderError()}
      {renderEmptyState()}
      
      <div 
        ref={containerRef}
        className={cn(
          "mermaid-content w-full h-full flex items-center justify-center",
          (loading || error || !content.trim()) && "hidden"
        )}
      />
    </div>
  );
};