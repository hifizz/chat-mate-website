import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MermaidTheme } from '@/types';
import { Palette } from 'lucide-react';

// 可用的 Mermaid 主题配置
const MERMAID_THEMES: { value: MermaidTheme; label: string; description: string }[] = [
  { value: 'default', label: '默认主题', description: '经典的白色背景主题' },
  { value: 'dark', label: '深色主题', description: '深色背景，适合夜间使用' },
  { value: 'forest', label: '森林主题', description: '绿色调的自然风格' },
  { value: 'neutral', label: '中性主题', description: '简洁的灰色调主题' },
  { value: 'base', label: '基础主题', description: '简约的蓝色调主题' },
];

interface MermaidThemeSelectorProps {
  currentTheme: MermaidTheme;
  onThemeChange: (theme: MermaidTheme) => void;
  className?: string;
  showLabel?: boolean;
}

/**
 * Mermaid 主题选择器组件
 */
export const MermaidThemeSelector: React.FC<MermaidThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
  className = '',
  showLabel = true
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Palette className="h-4 w-4" />
          Mermaid 主题
        </Label>
      )}
      <Select value={currentTheme} onValueChange={(value) => onThemeChange(value as MermaidTheme)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="选择主题" />
        </SelectTrigger>
        <SelectContent>
          {MERMAID_THEMES.map((theme) => (
            <SelectItem key={theme.value} value={theme.value}>
              <div className="flex flex-col">
                <span className="font-medium">{theme.label}</span>
                <span className="text-xs text-muted-foreground">{theme.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};