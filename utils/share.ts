import { encodePakoContent, validateContentSize } from './pako';
import { generateShareURL, isURLTooLong } from './url';
import { ShareResult, ValidationResult } from '@/types';

/**
 * 分享功能工具模块
 * 提供分享链接生成、URL长度检查和优化建议
 */

/**
 * 处理内容分享，生成分享链接
 * @param content - 要分享的 Mermaid 内容
 * @param theme - 可选的主题参数
 * @param darkMode - 可选的深色模式参数
 * @returns 分享结果对象
 */
export const processContentForSharing = async (
  content: string,
  theme?: string,
  darkMode?: boolean
): Promise<ShareResult> => {
  try {
    // 验证内容是否为空
    if (!content.trim()) {
      return {
        success: false,
        error: '内容不能为空',
        suggestions: ['请输入有效的 Mermaid 图表代码']
      };
    }

    // 压缩编码内容
    const encodedContent = encodePakoContent(content);
    
    // 生成分享链接
    const shareURL = generateShareURL(encodedContent, theme, darkMode);
    
    // 检查 URL 长度
    if (isURLTooLong(shareURL)) {
      return {
        success: false,
        error: '内容过大，无法通过 URL 分享',
        suggestions: [
          '简化图表结构，减少节点数量',
          '缩短节点和连接的文本描述',
          '移除不必要的样式和配置',
          '考虑将复杂图表拆分为多个简单图表'
        ]
      };
    }

    return {
      success: true,
      url: shareURL,
      type: 'direct'
    };
  } catch (error) {
    console.error('分享处理错误:', error);
    return {
      success: false,
      error: '分享链接生成失败',
      suggestions: ['请检查内容格式是否正确']
    };
  }
};

/**
 * 验证内容是否适合分享
 * @param content - 要验证的内容
 * @returns 验证结果
 */
export const validateContentForSharing = (content: string): ValidationResult => {
  return validateContentSize(content);
};

/**
 * 获取内容优化建议
 * @param content - 要优化的内容
 * @returns 优化建议数组
 */
export const getOptimizationSuggestions = (content: string): string[] => {
  const suggestions: string[] = [];
  
  // 检查内容长度
  if (content.length > 1500) {
    suggestions.push('内容过长，建议简化图表结构');
  }
  
  // 检查节点数量（简单估算）
  const nodeCount = (content.match(/\w+\s*-->/g) || []).length;
  if (nodeCount > 20) {
    suggestions.push('节点数量较多，建议减少节点或拆分图表');
  }
  
  // 检查长文本
  const longTexts = content.match(/["'][^"']{50,}["']/g);
  if (longTexts && longTexts.length > 0) {
    suggestions.push('存在较长的文本描述，建议缩短');
  }
  
  // 检查样式定义
  if (content.includes('classDef') || content.includes('style')) {
    suggestions.push('包含样式定义，可考虑移除以减小大小');
  }
  
  return suggestions;
};

/**
 * 估算分享链接的长度
 * @param content - 内容
 * @param theme - 主题
 * @param darkMode - 深色模式
 * @returns 估算的 URL 长度
 */
export const estimateShareURLLength = (
  content: string,
  theme?: string,
  darkMode?: boolean
): number => {
  try {
    const encodedContent = encodePakoContent(content);
    const shareURL = generateShareURL(encodedContent, theme, darkMode);
    return shareURL.length;
  } catch (error) {
    console.error('URL 长度估算错误:', error);
    return Infinity; // 返回无穷大表示无法估算
  }
};

/**
 * 检查内容是否可以安全分享
 * @param content - 内容
 * @param theme - 主题
 * @param darkMode - 深色模式
 * @returns 是否可以安全分享
 */
export const canShareSafely = (
  content: string,
  theme?: string,
  darkMode?: boolean
): boolean => {
  const estimatedLength = estimateShareURLLength(content, theme, darkMode);
  return estimatedLength < 2000; // 安全限制
};