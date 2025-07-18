import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { MermaidTheme } from '@/types';

interface UseThemeManagerResult {
  currentTheme: MermaidTheme;
  availableThemes: MermaidTheme[];
  changeTheme: (theme: MermaidTheme) => void;
  systemTheme: string | undefined;
  resolvedTheme: string | undefined;
}

/**
 * 主题管理 Hook
 * 管理 Mermaid 主题和系统主题的同步
 */
export const useThemeManager = (): UseThemeManagerResult => {
  const { theme: systemTheme, resolvedTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<MermaidTheme>('default');

  // 可用的 Mermaid 主题
  const availableThemes: MermaidTheme[] = ['default', 'dark', 'forest', 'neutral', 'base'];

  // 根据系统主题自动调整 Mermaid 主题
  useEffect(() => {
    // 从 localStorage 获取保存的 Mermaid 主题偏好
    const savedTheme = localStorage.getItem('mermaid-theme') as MermaidTheme;
    
    if (savedTheme && availableThemes.includes(savedTheme)) {
      setCurrentTheme(savedTheme);
    } else {
      // 如果没有保存的主题，根据系统主题自动选择
      if (resolvedTheme === 'dark') {
        setCurrentTheme('dark');
      } else {
        setCurrentTheme('default');
      }
    }
  }, [resolvedTheme]);

  // 切换主题
  const changeTheme = useCallback((theme: MermaidTheme) => {
    setCurrentTheme(theme);
    // 保存主题偏好到 localStorage
    localStorage.setItem('mermaid-theme', theme);
  }, []);

  return {
    currentTheme,
    availableThemes,
    changeTheme,
    systemTheme,
    resolvedTheme
  };
};