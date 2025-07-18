import { URLParams } from '@/types';

/**
 * 解析 URL 参数
 * @param url - 要解析的 URL 字符串
 * @returns 解析后的 URL 参数对象
 */
export const parseURLParams = (url: string): URLParams => {
  try {
    // 创建 URL 对象
    const urlObj = new URL(url);
    // 获取查询参数
    const searchParams = new URLSearchParams(urlObj.search);
    
    // 构建返回对象
    const params: URLParams = {};
    
    // 提取 pako 参数
    if (searchParams.has('pako')) {
      params.pako = searchParams.get('pako') || undefined;
    }
    
    // 提取 theme 参数
    if (searchParams.has('theme')) {
      params.theme = searchParams.get('theme') || undefined;
    }
    
    // 提取 darkMode 参数
    if (searchParams.has('darkMode')) {
      params.darkMode = searchParams.get('darkMode') === 'true';
    }
    
    return params;
  } catch (error) {
    console.error('URL 解析错误:', error);
    return {};
  }
};

/**
 * 从 URL 参数中提取 pako 内容
 * @param params - URL 参数对象
 * @returns 提取的 pako 内容，如果不存在则返回 null
 */
export const extractPakoContent = (params: URLParams): string | null => {
  return params.pako || null;
};

/**
 * 生成包含当前图表内容的分享链接
 * @param content - 编码后的内容
 * @param theme - 可选的主题参数
 * @param darkMode - 可选的深色模式参数
 * @returns 生成的分享链接
 */
export const generateShareURL = (
  content: string,
  theme?: string,
  darkMode?: boolean
): string => {
  // 构建基础 URL
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://example.com/mermaid.html';
  
  // 构建查询参数
  const params = new URLSearchParams();
  params.set('pako', content);
  
  if (theme) {
    params.set('theme', theme);
  }
  
  if (darkMode !== undefined) {
    params.set('darkMode', darkMode.toString());
  }
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * URL 安全长度限制常量
 */
export const URL_SAFE_LIMIT = 2000; // 保守的安全限制
export const URL_WARNING_LIMIT = 1800; // 警告阈值

/**
 * 检查 URL 长度是否超过安全限制
 * @param url - 要检查的 URL
 * @returns 是否超过安全限制
 */
export const isURLTooLong = (url: string): boolean => {
  return url.length > URL_SAFE_LIMIT;
};

/**
 * 检查 URL 长度是否接近限制（需要警告）
 * @param url - 要检查的 URL
 * @returns 是否接近限制
 */
export const isURLNearLimit = (url: string): boolean => {
  return url.length > URL_WARNING_LIMIT && url.length <= URL_SAFE_LIMIT;
};

/**
 * 获取 URL 长度状态
 * @param url - 要检查的 URL
 * @returns URL 长度状态对象
 */
export const getURLLengthStatus = (url: string): {
  length: number;
  status: 'safe' | 'warning' | 'danger';
  message: string;
} => {
  const length = url.length;
  
  if (length > URL_SAFE_LIMIT) {
    return {
      length,
      status: 'danger',
      message: `URL 长度 (${length}) 超过安全限制 (${URL_SAFE_LIMIT})，可能无法在某些浏览器中正常工作`
    };
  } else if (length > URL_WARNING_LIMIT) {
    return {
      length,
      status: 'warning',
      message: `URL 长度 (${length}) 接近限制，建议优化内容以确保兼容性`
    };
  } else {
    return {
      length,
      status: 'safe',
      message: `URL 长度 (${length}) 在安全范围内`
    };
  }
};

/**
 * 从当前浏览器 URL 中获取参数
 * @returns 解析后的 URL 参数对象
 */
export const getURLParamsFromBrowser = (): URLParams => {
  if (typeof window === 'undefined') {
    return {};
  }
  
  return parseURLParams(window.location.href);
};