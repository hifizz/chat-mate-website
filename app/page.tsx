'use client';

import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { MermaidViewer } from '@/components/mermaid-viewer';
import { ShareDialog } from '@/components/share-dialog';
import { AppError, ErrorType, MermaidTheme } from '@/types';
import { getURLParamsFromBrowser } from '@/utils/url';
import { decodePakoContent } from '@/utils/pako';
import { useThemeManager } from '@/hooks/use-theme-manager';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/utils/clipboard';
import { toast } from 'sonner';
import { Copy, Share2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
  
  // 使用主题管理 Hook
  const { currentTheme, changeTheme } = useThemeManager();

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
        changeTheme(params.theme as MermaidTheme);
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
  }, [changeTheme]);

  // 处理渲染错误
  const handleRenderError = (error: AppError) => {
    setError(error);
  };

  // 渲染完成回调
  const handleRenderComplete = () => {
    console.log('图表渲染完成');
  };

  // 复制源码到剪贴板
  const handleCopySource = async () => {
    try {
      const success = await copyToClipboard(content);
      if (success) {
        toast.success('源码已复制到剪贴板');
      } else {
        toast.error('复制失败，请手动复制');
        // 显示手动复制的文本框
        showManualCopyDialog();
      }
    } catch (err) {
      console.error('复制源码失败:', err);
      toast.error('复制失败，请手动复制');
      showManualCopyDialog();
    }
  };

  // 处理分享功能
  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  // 显示手动复制对话框
  const showManualCopyDialog = () => {
    // 创建一个临时的文本区域供用户手动复制
    const textArea = document.createElement('textarea');
    textArea.value = content;
    textArea.style.position = 'fixed';
    textArea.style.left = '50%';
    textArea.style.top = '50%';
    textArea.style.transform = 'translate(-50%, -50%)';
    textArea.style.width = '80%';
    textArea.style.height = '60%';
    textArea.style.zIndex = '9999';
    textArea.style.backgroundColor = 'white';
    textArea.style.border = '2px solid #ccc';
    textArea.style.borderRadius = '8px';
    textArea.style.padding = '16px';
    textArea.setAttribute('readonly', 'true');

    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '8px';
    closeButton.style.right = '8px';
    closeButton.style.padding = '4px 8px';
    closeButton.style.backgroundColor = '#f0f0f0';
    closeButton.style.border = '1px solid #ccc';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    container.style.zIndex = '9998';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    const dialog = document.createElement('div');
    dialog.style.position = 'relative';
    dialog.style.backgroundColor = 'white';
    dialog.style.borderRadius = '8px';
    dialog.style.padding = '16px';
    dialog.style.width = '80%';
    dialog.style.maxWidth = '600px';
    dialog.style.maxHeight = '80%';

    const title = document.createElement('h3');
    title.textContent = '请手动复制以下内容：';
    title.style.marginBottom = '12px';
    title.style.fontSize = '16px';
    title.style.fontWeight = 'bold';

    dialog.appendChild(title);
    dialog.appendChild(textArea);
    dialog.appendChild(closeButton);
    container.appendChild(dialog);

    // 关闭对话框
    const closeDialog = () => {
      document.body.removeChild(container);
    };

    closeButton.onclick = closeDialog;
    container.onclick = (e) => {
      if (e.target === container) {
        closeDialog();
      }
    };

    // 选中文本
    textArea.focus();
    textArea.select();

    document.body.appendChild(container);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-10 bg-background border-b border-border h-14 flex items-center px-4">
        <h1 className="text-lg font-semibold flex-1">Mermaid 图表查看器</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/playground'}>
            进入 Playground
          </Button>
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

          {/* 工具栏 */}
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {content.split('\n').length} 行代码
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleCopySource}>
                      <Copy className="h-4 w-4 mr-2" />
                      复制源码
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>复制 Mermaid 源代码到剪贴板</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      分享图表
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>生成分享链接</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* 图表查看器 */}
          <div className="flex-1 border border-border rounded-md overflow-hidden">
            <MermaidViewer 
              content={content}
              theme={currentTheme}
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

      {/* 分享对话框 */}
      <ShareDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        content={content}
        theme={currentTheme}
      />
    </div>
  );
}