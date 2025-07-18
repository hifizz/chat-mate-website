import React, { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * 代码编辑器组件
 * 
 * 这是一个简单的代码编辑器组件，基于 Textarea 实现
 * 在未来可以考虑集成 Monaco Editor 或其他更高级的编辑器
 */
export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  placeholder = '在这里输入 Mermaid 代码...',
  className = '',
  disabled = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 处理 Tab 键，插入两个空格而不是切换焦点
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // 在光标位置插入两个空格
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      
      // 更新值
      onChange(newValue);
      
      // 设置新的光标位置
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`font-mono resize-none h-full min-h-[400px] ${className}`}
      disabled={disabled}
      spellCheck={false}
    />
  );
};