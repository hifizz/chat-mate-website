import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MermaidViewer } from '@/components/mermaid-viewer';
import { MermaidTheme, AppError } from '@/types';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIFix } from '@/hooks/use-ai-fix';

interface AIFixDialogProps {
  content: string;
  theme: MermaidTheme;
  onContentChange: (content: string) => void;
  onErrorClear: () => void;
  trigger?: React.ReactNode;
}

/**
 * AI 修复预览对话框组件
 * 显示修复前后的代码对比和预览效果
 * 内部集成了所有 AI 修复相关的逻辑
 */
export const AIFixDialog: React.FC<AIFixDialogProps> = ({
  content,
  theme,
  onContentChange,
  onErrorClear,
  trigger
}) => {
  const [originalError, setOriginalError] = useState<AppError | null>(null);
  const [fixedError, setFixedError] = useState<AppError | null>(null);
  const [activeTab, setActiveTab] = useState<string>('preview');

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
    onContentChange,
    onErrorClear,
  });

  // 处理原始内容渲染错误
  const handleOriginalError = (error: AppError) => {
    setOriginalError(error);
  };

  // 处理修复后内容渲染错误
  const handleFixedError = (error: AppError) => {
    setFixedError(error);
  };

  // 获取修复状态
  const getFixStatus = () => {
    if (fixedError) {
      return {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        text: '修复失败',
        variant: 'destructive' as const
      };
    }
    if (originalError && !fixedError) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        text: '修复成功',
        variant: 'default' as const
      };
    }
    if (!originalError && !fixedError) {
      return {
        icon: <AlertCircle className="h-4 w-4 text-blue-500" />,
        text: '代码优化',
        variant: 'secondary' as const
      };
    }
    return {
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
      text: '部分修复',
      variant: 'outline' as const
    };
  };

  const fixStatus = getFixStatus();

  // 计算代码差异（简单实现）
  const getCodeDiff = () => {
    const originalLines = originalContent.split('\n');
    const fixedLines = fixedContent.split('\n');
    const maxLines = Math.max(originalLines.length, fixedLines.length);
    
    const diff = [];
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const fixedLine = fixedLines[i] || '';
      
      if (originalLine !== fixedLine) {
        diff.push({
          lineNumber: i + 1,
          original: originalLine,
          fixed: fixedLine,
          type: originalLine === '' ? 'added' : fixedLine === '' ? 'removed' : 'modified'
        });
      }
    }
    
    return diff;
  };

  const codeDiff = getCodeDiff();

  return (
    <>
      {/* 触发器 - 如果提供了 trigger，则渲染它；否则渲染默认的 AI 修复按钮 */}
      {trigger ? (
        <div onClick={handleAIFix} style={{ cursor: 'pointer' }}>
          {trigger}
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAIFix} 
          disabled={isFixing}
        >
          {isFixing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              修复中...
            </>
          ) : (
            'AI 修复'
          )}
        </Button>
      )}

      {/* AI 修复预览对话框 */}
      <Dialog open={isAIFixDialogOpen} onOpenChange={setIsAIFixDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              AI 修复预览
              <Badge variant={fixStatus.variant} className="flex items-center gap-1">
                {fixStatus.icon}
                {fixStatus.text}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {fixMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">预览对比</TabsTrigger>
                <TabsTrigger value="code">代码对比</TabsTrigger>
                <TabsTrigger value="diff">变更详情</TabsTrigger>
              </TabsList>

              {/* 预览对比 */}
              <TabsContent value="preview" className="flex-1 overflow-hidden">
                <div className="grid grid-cols-2 gap-4 h-full">
                  {/* 修复前预览 */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        修复前
                        {originalError && (
                          <Badge variant="destructive" className="text-xs">
                            有错误
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-2 overflow-hidden">
                      <div className="h-full border rounded">
                        <MermaidViewer
                          content={originalContent}
                          theme={theme}
                          onError={handleOriginalError}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 修复后预览 */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        修复后
                        {!fixedError && (
                          <Badge variant="default" className="text-xs">
                            正常
                          </Badge>
                        )}
                        {fixedError && (
                          <Badge variant="destructive" className="text-xs">
                            仍有错误
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-2 overflow-hidden">
                      <div className="h-full border rounded">
                        <MermaidViewer
                          content={fixedContent}
                          theme={theme}
                          onError={handleFixedError}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* 代码对比 */}
              <TabsContent value="code" className="flex-1 overflow-hidden">
                <div className="grid grid-cols-2 gap-4 h-full">
                  {/* 修复前代码 */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">修复前代码</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                      <ScrollArea className="h-full">
                        <pre className="p-4 text-sm font-mono bg-muted/50 whitespace-pre-wrap">
                          {originalContent}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* 修复后代码 */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">修复后代码</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                      <ScrollArea className="h-full">
                        <pre className="p-4 text-sm font-mono bg-muted/50 whitespace-pre-wrap">
                          {fixedContent}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* 变更详情 */}
              <TabsContent value="diff" className="flex-1 overflow-hidden">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      变更详情 ({codeDiff.length} 处变更)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full">
                      {codeDiff.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          没有检测到代码变更
                        </div>
                      ) : (
                        <div className="p-4 space-y-4">
                          {codeDiff.map((change, index) => (
                            <div key={index} className="border rounded p-3">
                              <div className="text-sm font-medium mb-2">
                                第 {change.lineNumber} 行 - {
                                  change.type === 'added' ? '新增' :
                                  change.type === 'removed' ? '删除' : '修改'
                                }
                              </div>
                              
                              {change.original && (
                                <div className="mb-2">
                                  <div className="text-xs text-muted-foreground mb-1">- 原内容:</div>
                                  <pre className={cn(
                                    "text-sm font-mono p-2 rounded",
                                    change.type === 'removed' 
                                      ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                                      : "bg-muted/50"
                                  )}>
                                    {change.original}
                                  </pre>
                                </div>
                              )}
                              
                              {change.fixed && (
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">+ 新内容:</div>
                                  <pre className={cn(
                                    "text-sm font-mono p-2 rounded",
                                    change.type === 'added' 
                                      ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                                      : "bg-muted/50"
                                  )}>
                                    {change.fixed}
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={handleRejectFix} disabled={isApplyingFix}>
              拒绝修复
            </Button>
            <Button 
              onClick={handleApplyFix} 
              disabled={isApplyingFix || !!fixedError}
              className="min-w-[100px]"
            >
              {isApplyingFix ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  应用中...
                </>
              ) : (
                '应用修复'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};