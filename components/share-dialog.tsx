'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Share2, AlertTriangle } from 'lucide-react';
import { copyToClipboard } from '@/utils/clipboard';
import { processContentForSharing, getOptimizationSuggestions } from '@/utils/share';
import { getURLLengthStatus } from '@/utils/url';
import { ShareResult } from '@/types';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  theme?: string;
  darkMode?: boolean;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onOpenChange,
  content,
  theme,
  darkMode
}) => {
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // 生成分享链接
  const handleGenerateLink = async () => {
    setIsGenerating(true);
    setIsCopied(false);
    
    try {
      const result = await processContentForSharing(content, theme, darkMode);
      setShareResult(result);
    } catch (error) {
      console.error('生成分享链接失败:', error);
      setShareResult({
        success: false,
        error: '生成分享链接时发生错误'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 复制链接到剪贴板
  const handleCopyLink = async () => {
    if (!shareResult?.url) return;

    const success = await copyToClipboard(shareResult.url);
    if (success) {
      setIsCopied(true);
      // 3秒后重置复制状态
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  // 当对话框打开时自动生成链接
  React.useEffect(() => {
    if (open && content.trim()) {
      handleGenerateLink();
    }
  }, [open, content, theme, darkMode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            分享图表
          </DialogTitle>
          <DialogDescription>
            生成分享链接，其他人可以通过此链接查看相同的图表内容。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 分享链接输入框 */}
          {shareResult?.success && shareResult.url && (
            <div className="space-y-2">
              <Label htmlFor="share-url">分享链接</Label>
              <div className="flex space-x-2">
                <Input
                  id="share-url"
                  value={shareResult.url}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCopyLink}
                  className="px-3"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* URL 长度状态 */}
              {(() => {
                const urlStatus = getURLLengthStatus(shareResult.url);
                return (
                  <div className={`text-xs ${
                    urlStatus.status === 'danger' ? 'text-red-600' :
                    urlStatus.status === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {urlStatus.message}
                  </div>
                );
              })()}
              
              {isCopied && (
                <p className="text-sm text-green-600">
                  链接已复制到剪贴板！
                </p>
              )}
            </div>
          )}

          {/* 加载状态 */}
          {isGenerating && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">
                正在生成分享链接...
              </span>
            </div>
          )}

          {/* 错误信息和优化建议 */}
          {shareResult && !shareResult.success && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>{shareResult.error}</p>
                  {shareResult.suggestions && shareResult.suggestions.length > 0 && (
                    <div>
                      <p className="font-medium">优化建议：</p>
                      <ul className="list-disc list-inside space-y-1">
                        {shareResult.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm">
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 额外的优化建议 */}
          {shareResult?.success && content.length > 1000 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">内容优化建议：</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {getOptimizationSuggestions(content).map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {shareResult?.success && shareResult.url && (
            <Button onClick={handleCopyLink} className="w-full sm:w-auto">
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  复制链接
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};