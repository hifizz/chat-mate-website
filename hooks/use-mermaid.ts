import { useState, useEffect, useCallback, useRef } from 'react';
import { AppError, ErrorType } from '@/types';
import mermaid from 'mermaid';
import { debounce } from 'lodash';
import { renderCache } from '@/utils/render-cache';

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

  // 使用 ref 来跟踪最新的内容，避免闭包问题
  const contentRef = useRef(content);
  contentRef.current = content;

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

  // 渲染 Mermaid 图表的实际函数
  const doRenderMermaid = useCallback(async (content: string) => {
    if (!content.trim()) {
      setSvg(null);
      setLoading(false);
      return;
    }

    // 首先检查缓存
    const cachedSvg = renderCache.get(content, theme);
    if (cachedSvg) {
      setSvg(cachedSvg);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 生成唯一 ID
      const id = `mermaid-${Date.now()}`;

      // 尝试解析语法
      let isValid = false;
      try {
        // 使用 suppressErrors 选项，避免抛出异常
        // 注意：mermaid.parse 返回布尔值，但可能是异步的
        const parseResult = mermaid.parse(content, { suppressErrors: true });
        isValid = parseResult === true || await Promise.resolve(parseResult);
      } catch (parseErr) {
        // 即使使用了 suppressErrors，也可能会有异常，我们需要捕获它
        isValid = false;
      }

      if (!isValid) {
        // 如果解析失败，创建错误对象
        const appError: AppError = {
          type: ErrorType.RENDER_ERROR,
          message: `Mermaid 语法错误: 请检查您的图表代码`,
          details: { content }
        };
        setError(appError);
        onError?.(appError);
        setLoading(false);
        return;
      }

      // 渲染图表
      try {
        const { svg } = await mermaid.render(id, content);

        // 将结果存入缓存
        renderCache.set(content, theme, svg);

        // 更新 SVG
        setSvg(svg);
        setError(null); // 清除之前的错误
      } catch (renderErr: any) {
        // 处理渲染错误
        const appError: AppError = {
          type: ErrorType.RENDER_ERROR,
          message: '渲染 Mermaid 图表失败',
          details: renderErr.message || renderErr
        };
        setError(appError);
        onError?.(appError);
      }
    } catch (err: any) {
      // 处理其他错误
      const appError: AppError = {
        type: ErrorType.RENDER_ERROR,
        message: '处理 Mermaid 图表时发生错误',
        details: err.message || err
      };
      setError(appError);
      onError?.(appError);
    } finally {
      setLoading(false);
    }
  }, [onError, theme]);

  // 创建防抖版本的渲染函数
  const debouncedRenderMermaid = useCallback(
    debounce((content: string) => {
      doRenderMermaid(content);
    }, 300), // 300ms 的防抖延迟
    [doRenderMermaid]
  );

  // 对外暴露的渲染函数
  const renderMermaid = useCallback(async (content: string) => {
    debouncedRenderMermaid(content);
  }, [debouncedRenderMermaid]);

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