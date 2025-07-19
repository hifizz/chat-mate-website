import { useState } from 'react';
import { toast } from 'sonner';

interface UseAIFixProps {
  content: string;
  onContentChange: (content: string) => void;
  onErrorClear: () => void;
}

interface UseAIFixReturn {
  // 状态
  isFixing: boolean;
  isAIFixDialogOpen: boolean;
  originalContent: string;
  fixedContent: string;
  fixMessage: string;
  isApplyingFix: boolean;
  
  // 方法
  handleAIFix: () => Promise<void>;
  handleApplyFix: () => Promise<void>;
  handleRejectFix: () => void;
  setIsAIFixDialogOpen: (open: boolean) => void;
}

/**
 * AI 修复功能的自定义 Hook
 * 处理 AI 修复的状态管理和业务逻辑
 */
export const useAIFix = ({ 
  content, 
  onContentChange, 
  onErrorClear 
}: UseAIFixProps): UseAIFixReturn => {
  const [isFixing, setIsFixing] = useState<boolean>(false);
  const [isAIFixDialogOpen, setIsAIFixDialogOpen] = useState<boolean>(false);
  const [originalContent, setOriginalContent] = useState<string>('');
  const [fixedContent, setFixedContent] = useState<string>('');
  const [fixMessage, setFixMessage] = useState<string>('');
  const [isApplyingFix, setIsApplyingFix] = useState<boolean>(false);

  // 处理 AI 修复
  const handleAIFix = async () => {
    if (!content.trim()) return;

    setIsFixing(true);
    try {
      // 调用 AI 修复 API
      const requestBody = { content };

      const response = await fetch('/api/ai-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.fixedContent) {
        // 检查修复后的内容是否与原内容不同
        if (data.fixedContent.trim() !== content.trim()) {
          // 设置预览对话框的数据
          setOriginalContent(content);
          setFixedContent(data.fixedContent);
          setFixMessage(data.message || 'AI 已分析并修复了代码中的问题');
          setIsAIFixDialogOpen(true);
        } else {
          toast.info(data.message || '代码无需修复');
        }
      } else {
        toast.info(data.message || '代码无需修复');
      }
    } catch (err) {
      console.error('AI 修复错误:', err);
      toast.error('AI 修复失败，请稍后再试');
    } finally {
      setIsFixing(false);
    }
  };

  // 应用 AI 修复
  const handleApplyFix = async () => {
    setIsApplyingFix(true);
    try {
      // 应用修复后的内容
      onContentChange(fixedContent);
      onErrorClear();
      setIsAIFixDialogOpen(false);
      toast.success('已应用 AI 修复');
    } catch (err) {
      console.error('应用修复失败:', err);
      toast.error('应用修复失败');
    } finally {
      setIsApplyingFix(false);
    }
  };

  // 拒绝 AI 修复
  const handleRejectFix = () => {
    setIsAIFixDialogOpen(false);
    toast.info('已取消 AI 修复');
  };

  return {
    // 状态
    isFixing,
    isAIFixDialogOpen,
    originalContent,
    fixedContent,
    fixMessage,
    isApplyingFix,
    
    // 方法
    handleAIFix,
    handleApplyFix,
    handleRejectFix,
    setIsAIFixDialogOpen,
  };
};