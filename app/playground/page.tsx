'use client';

import { useState, useRef, useCallback } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { MermaidViewer } from '@/components/mermaid-viewer';
import { CodeEditor } from '@/components/code-editor';
import { ControlPanel } from '@/components/control-panel';
import { ExportDialog } from '@/components/export-dialog';
import { ShareDialog } from '@/components/share-dialog';
import { AIFixDialog } from '@/components/ai-fix-dialog';
import { AppError, MermaidTheme } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { copyToClipboard } from '@/utils/clipboard';
import { useAIFix } from '@/hooks/use-ai-fix';

// 默认的 Mermaid 图表示例
const DEFAULT_MERMAID_CONTENT = `graph TD
    A[开始] --> B{是否有参数?}
    B -->|是| C[解析参数]
    B -->|否| D[显示默认图表]
    C --> E[渲染图表]
    D --> E
    E --> F[结束]`;

export default function Playground() {
  const [content, setContent] = useState<string>(DEFAULT_MERMAID_CONTENT);
  const [theme, setTheme] = useState<MermaidTheme>('default');
  const [error, setError] = useState<AppError | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);

  // 用于导出功能的 ref
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // 清除错误的回调函数
  const handleErrorClear = useCallback(() => {
    setError(null);
  }, []);

  // 使用 AI 修复 Hook
  const {
    isFixing,
    isAIFixDialogOpen,
    originalContent,
    fixedContent,
    fixMessage,
    isApplyingFix,
    handleAIFix,
    handleApplyFix,
    handleRejectFix,
    setIsAIFixDialogOpen,
  } = useAIFix({
    content,
    onContentChange: setContent,
    onErrorClear: handleErrorClear,
  });

  // 处理渲染错误
  const handleRenderError = (error: AppError) => {
    setError(error);
  };

  // 渲染完成回调
  const handleRenderComplete = () => {
    console.log('图表渲染完成');
  };

  // 处理内容变更
  const handleContentChange = (value: string) => {
    setContent(value);
    // 清除之前的错误
    setError(null);
  };

  // 处理主题变更
  const handleThemeChange = (value: MermaidTheme) => {
    setTheme(value);
  };



  // 复制内容到剪贴板
  const handleCopyContent = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      toast.success('已复制到剪贴板');
    } else {
      toast.error('复制失败，请手动复制');
    }
  };

  // 分享图表
  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  // 导出图表
  const handleExport = () => {
    setIsExportDialogOpen(true);
  };

  // 重置为默认内容
  const handleReset = () => {
    setContent(DEFAULT_MERMAID_CONTENT);
    setError(null);
    toast.info('已重置为默认内容');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-10 bg-background border-b border-border h-14 flex items-center px-4">
        <h1 className="text-lg font-semibold flex-1">Mermaid Playground</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
            返回主页
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="flex-1 p-4">
        <div className="container mx-auto h-full flex flex-col">
          {/* 编辑器和预览区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* 左侧编辑区 */}
            <Card className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle>编辑区</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <CodeEditor
                  value={content}
                  onChange={handleContentChange}
                  className="rounded-none p-4"
                />
              </CardContent>
            </Card>

            {/* 右侧预览区 */}
            <Card className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle>预览区</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col">
                {/* 错误提示 - 现在是垂直排列的一部分，而不是绝对定位 */}

                {/* 图表预览 - 现在是垂直排列的一部分 */}
                <div ref={previewContainerRef} className="flex-1 min-h-[300px] p-4">
                  {error && (
                    <div className='mb-2'>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAIFix}
                        disabled={isFixing}
                      >
                        {isFixing ? '修复中...' : 'AI 修复'}
                      </Button>
                    </div>
                  )}
                  <MermaidViewer
                    content={content}
                    theme={theme}
                    onError={handleRenderError}
                    onRenderComplete={handleRenderComplete}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 参数控制面板 */}
          <div className="mt-4">
            <ControlPanel
              theme={theme}
              onThemeChange={handleThemeChange}
              onCopyContent={handleCopyContent}
              onAIFix={handleAIFix}
              onShare={handleShare}
              onExport={handleExport}
              onReset={handleReset}
              isFixing={isFixing}
            />
          </div>
        </div>
      </main>

      {/* 底部状态栏 */}
      <footer className="bg-muted py-2 px-4 text-center text-sm text-muted-foreground">
        <p>Mermaid 图表查看器 - 基于 Next.js 和 Mermaid.js 构建</p>
      </footer>

      {/* 导出对话框 */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        containerElement={previewContainerRef.current}
        svgElement={previewContainerRef.current?.querySelector('svg') || null}
        filename="mermaid-chart"
      />

      {/* 分享对话框 */}
      <ShareDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        content={content}
        theme={theme}
      />

      {/* AI 修复预览对话框 */}
      <AIFixDialog
        open={isAIFixDialogOpen}
        onOpenChange={setIsAIFixDialogOpen}
        originalContent={originalContent}
        fixedContent={fixedContent}
        fixMessage={fixMessage}
        theme={theme}
        onApplyFix={handleApplyFix}
        onRejectFix={handleRejectFix}
        isApplying={isApplyingFix}
      />
    </div>
  );
}