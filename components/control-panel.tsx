import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MermaidThemeSelector } from '@/components/mermaid-theme-selector';
import { MermaidTheme } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Copy, 
  Share2, 
  Download, 
  Wand2, 
  RefreshCw,
  Loader2
} from 'lucide-react';

interface ControlPanelProps {
  theme: MermaidTheme;
  onThemeChange: (theme: MermaidTheme) => void;
  onCopyContent: () => void;
  onAIFix: () => void;
  onShare: () => void;
  onExport: () => void;
  onReset: () => void;
  isFixing: boolean;
}

/**
 * 控制面板组件
 */
export const ControlPanel: React.FC<ControlPanelProps> = ({
  theme,
  onThemeChange,
  onCopyContent,
  onAIFix,
  onShare,
  onExport,
  onReset,
  isFixing
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>参数控制面板</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <MermaidThemeSelector
            currentTheme={theme}
            onThemeChange={onThemeChange}
            className="w-[200px]"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onCopyContent}>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>复制源码</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onAIFix} disabled={isFixing}>
                  {isFixing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI 修复</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onReset}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>重置为默认</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>分享图表</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="default" size="icon" onClick={onExport}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>导出图表</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};