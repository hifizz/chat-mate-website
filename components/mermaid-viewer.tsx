import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MermaidViewerProps, ErrorType, AppError, MermaidTheme } from '@/types';
import { useMermaid } from '@/hooks/use-mermaid';
import { TouchFriendlyContainer, TouchFriendlyContainerHandle } from '@/components/touch-friendly-container';
import { Toolbar } from '@/components/toolbar';
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

  // 缩放状态
  const [showZoomControls, setShowZoomControls] = useState<boolean>(false);

  // 创建一个 ref 来引用 TouchFriendlyContainer 组件
  const touchContainerRef = useRef<TouchFriendlyContainerHandle>(null);

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

      // 显示缩放控制
      setShowZoomControls(true);
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

  // 缩放控制
  const [scale, setScale] = useState<number>(1);

  // 处理缩放变化
  const handleZoomChange = useCallback((newScale: number) => {
    setScale(newScale);
  }, []);

  // 处理缩放控制
  const handleZoomIn = useCallback(() => {
    if (touchContainerRef.current) {
      touchContainerRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (touchContainerRef.current) {
      touchContainerRef.current.zoomOut();
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    if (touchContainerRef.current) {
      touchContainerRef.current.resetZoom();
    }
  }, []);

  // 处理导出
  const handleExport = useCallback(() => {
    // 导出功能可以在这里实现
    console.log('导出图表');
  }, []);

  // 处理复制
  const handleCopy = useCallback(() => {
    // 复制功能可以在这里实现
    console.log('复制源码');
  }, []);

  // 处理分享
  const handleShare = useCallback(() => {
    // 分享功能可以在这里实现
    console.log('分享图表');
  }, []);

  // 处理主题变更
  const handleThemeChange = useCallback((newTheme: MermaidTheme) => {
    // 主题变更功能可以在这里实现
    console.log('主题变更:', newTheme);
  }, []);

  // 处理 AI 修复
  const handleAIFix = useCallback(() => {
    // AI 修复功能可以在这里实现
    console.log('AI 修复');
  }, []);

  return (
    <div className="mermaid-viewer-container w-full h-full flex flex-col">
      {/* 工具栏 */}
      {!loading && !error && content.trim() && showZoomControls && (
        <div className="p-2 border-b">
          <Toolbar
            onExport={handleExport}
            onCopy={handleCopy}
            onShare={handleShare}
            onThemeChange={handleThemeChange}
            onAIFix={handleAIFix}
            currentTheme={theme as MermaidTheme}
            availableThemes={['default', 'dark', 'forest', 'neutral', 'base']}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            scale={scale}
          />
        </div>
      )}

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {renderLoading()}
        {renderError()}
        {renderEmptyState()}

        {/* 使用 TouchFriendlyContainer 包装 Mermaid 内容 */}
        {!loading && !error && content.trim() && (
          <TouchFriendlyContainer
            ref={touchContainerRef}
            showControls={false} // 不显示浮动控制器，因为我们已经有了工具栏
            minScale={0.5}
            maxScale={3}
            initialScale={1}
            className="w-full h-full"
            onZoomChange={handleZoomChange}
          >
            <div
              ref={containerRef}
              className="mermaid-content"
            />
          </TouchFriendlyContainer>
        )}
      </div>
    </div>
  );
};