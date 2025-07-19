import React from 'react';
import { Button } from '@/components/ui/button';
import { MermaidThemeSelector } from '@/components/mermaid-theme-selector';
import { ToolbarProps } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks/use-mobile';
import { 
  Copy, 
  Share2, 
  Download, 
  Wand2, 
  ZoomIn,
  ZoomOut,
  Menu
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ResponsiveToolbarProps extends Omit<ToolbarProps, 'onExport'> {
  onExport: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  scale?: number;
  className?: string;
}

/**
 * 响应式工具栏组件
 * 在桌面端显示完整工具栏，在移动端显示折叠菜单
 */
export const Toolbar: React.FC<ResponsiveToolbarProps> = ({
  onCopy,
  onShare,
  onExport,
  onThemeChange,
  onAIFix,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  currentTheme,
  scale,
  className = ''
}) => {
  const isMobile = useMobile();
  
  // 渲染缩放控制按钮
  const renderZoomControls = () => {
    if (!onZoomIn || !onZoomOut || !onResetZoom) return null;
    
    return (
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>缩小</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onResetZoom} className="px-2">
                {scale ? `${Math.round(scale * 100)}%` : '100%'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>重置缩放</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>放大</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };
  
  // 移动端工具栏
  if (isMobile) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <MermaidThemeSelector
          currentTheme={currentTheme}
          onThemeChange={onThemeChange}
          className="w-[150px]"
          showLabel={false}
        />
        
        <div className="flex items-center gap-2">
          {renderZoomControls()}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onCopy}>
                <Copy className="h-4 w-4 mr-2" />
                复制源码
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAIFix}>
                <Wand2 className="h-4 w-4 mr-2" />
                AI 修复
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                分享图表
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                导出图表
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }
  
  // 桌面端工具栏
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-4">
        <MermaidThemeSelector
          currentTheme={currentTheme}
          onThemeChange={onThemeChange}
          className="w-[200px]"
        />
        
        {renderZoomControls()}
      </div>
      
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onCopy}>
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
              <Button variant="outline" size="sm" onClick={onAIFix}>
                <Wand2 className="h-4 w-4 mr-2" />
                AI 修复
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>使用 AI 修复语法错误</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                分享图表
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>生成分享链接</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                导出图表
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>导出为 SVG/PNG/JPG 格式</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};