import { useState, useEffect, useCallback } from 'react';
import { MermaidConfig, AppError, ErrorType } from '@/types';
import mermaid from 'mermaid';

interface UseMermaidProps {
  content: string;
  theme?: string;
  onError?: (error: AppError) => void;
}

interface UseMermaidResult {
  svg: string | null;
  loading: boolean;
  error: AppError | null;
  renderMermaid: (content: string) => Promise<void>;
}

/**
 * Mermaid 渲染 Hook
 * @param content - Mermaid 图表内容
 * @param theme - 主题名称
 * @param onError - 错误处理回调
 * @returns 渲染结果、加载状态、错误信息和重新渲染方法
 */
export const useMermaid = ({
  content,
  theme = 'default',
  onError
}: UseMermaidProps): UseMermaidResult => {
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);

  // 初始化 Mermaid 配置
  useEffect(() => {
    try {
      // 根据主题设置 Mermaid 配置
      const mermaidTheme = getMermaidTheme(theme);
      
      mermaid.initialize({
        startOnLoad: false,
        theme: mermaidTheme,
        securityLevel: 'loose', // 允许点击事件
        fontFamily: 'sans-serif',
        themeVariables: {
          // 可以在这里自定义主题变量
        }
      });
    } catch (err) {
      const appError: AppError = {
        type: ErrorType.RENDER_ERROR,
        message: '初始化 Mermaid 失败',
        details: err
      };
      setError(appError);
      onError?.(appError);
    }
  }, [theme, onError]);

  // 将我们的主题名称映射到 Mermaid 主题
  const getMermaidTheme = (theme: string): string => {
    switch (theme) {
      case 'dark':
        return 'dark';
      case 'forest':
        return 'forest';
      case 'neutral':
        return 'neutral';
      case 'base':
        return 'base';
      default:
        return 'default';
    }
  };

  // 渲染 Mermaid 图表
  const renderMermaid = useCallback(async (content: string) => {
    if (!content.trim()) {
      setSvg(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 生成唯一 ID
      const id = `mermaid-${Date.now()}`;
      
      // 解析检查语法
      const isValid = await mermaid.parse(content);
      
      if (!isValid) {
        throw new Error('Mermaid 语法无效');
      }
      
      // 渲染图表
      const { svg } = await mermaid.render(id, content);
      
      // 更新 SVG
      setSvg(svg);
      setLoading(false);
    } catch (err: any) {
      const appError: AppError = {
        type: ErrorType.RENDER_ERROR,
        message: '渲染 Mermaid 图表失败',
        details: err.message || err
      };
      setError(appError);
      onError?.(appError);
      setLoading(false);
    }
  }, [onError]);

  // 内容变化时重新渲染
  useEffect(() => {
    if (content) {
      renderMermaid(content);
    }
  }, [content, renderMermaid]);

  return {
    svg,
    loading,
    error,
    renderMermaid
  };
};