// URL 参数类型
export interface URLParams {
  pako?: string;        // 压缩编码的内容
  theme?: string;       // 主题名称
  darkMode?: boolean;   // 深色模式
}

// 应用状态类型
export interface AppState {
  currentContent: string;
  currentTheme: string;
  zoomLevel: number;
  isDarkMode: boolean;
  isLoading: boolean;
  error?: string;
}

// Mermaid 配置类型
export interface MermaidConfig {
  theme: string;
  securityLevel: string;
  startOnLoad: boolean;
  fontFamily?: string;
}

// 缩放控制类型
export interface ZoomState {
  scale: number;
  minScale: number;
  maxScale: number;
  step: number;
}

// 导出选项类型
export interface ExportOptions {
  width?: number;
  height?: number;
  quality?: number;
  format: 'svg' | 'png' | 'jpg';
}

// AI 服务提供商类型
export interface AIProvider {
  name: string;
  apiUrl: string;
  apiKey?: string;
  model: string;
}

// AI 修复结果类型
export interface AIFixResult {
  success: boolean;
  fixedCode?: string;
  suggestions?: string[];
  error?: string;
}

// 分享结果类型
export interface ShareResult {
  success: boolean;
  url?: string;
  type?: 'direct' | 'stored';
  error?: string;
  suggestions?: string[];
}

// 内容验证结果类型
export interface ValidationResult {
  isValid: boolean;
  estimatedLength: number;
  compressionRatio: number;
}

// 错误类型枚举
export enum ErrorType {
  URL_PARSE_ERROR = 'URL_PARSE_ERROR',
  DECODE_ERROR = 'DECODE_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
  EXPORT_ERROR = 'EXPORT_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

// 自定义错误类型
export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
}

// Mermaid 主题类型
export type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral' | 'base';

// 组件 Props 类型
export interface MermaidViewerProps {
  content: string;
  theme?: MermaidTheme;
  onError?: (error: AppError) => void;
  onRenderComplete?: () => void;
}

export interface ToolbarProps {
  onExport: (format: ExportOptions['format']) => void;
  onCopy: () => void;
  onShare: () => void;
  onThemeChange: (theme: MermaidTheme) => void;
  onAIFix: () => void;
  currentTheme: MermaidTheme;
  availableThemes: MermaidTheme[];
}

export interface ZoomControlProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  minScale: number;
  maxScale: number;
}