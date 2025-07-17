import pako from 'pako';

/**
 * 使用 Pako 解码压缩内容
 * @param encoded - Base64 编码的压缩内容
 * @returns 解码后的原始内容
 * @throws 如果解码失败，抛出错误
 */
export const decodePakoContent = (encoded: string): string => {
  try {
    // 将 Base64 字符串转换为二进制数据
    const binaryString = atob(encoded);
    
    // 将二进制字符串转换为 Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // 使用 pako 解压缩
    const decompressed = pako.inflate(bytes);
    
    // 将 Uint8Array 转换为字符串
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(decompressed);
  } catch (error) {
    console.error('Pako 解码错误:', error);
    throw new Error('无法解码内容，可能是无效的编码格式');
  }
};

/**
 * 使用 Pako 压缩内容
 * @param content - 要压缩的原始内容
 * @returns Base64 编码的压缩内容
 */
export const encodePakoContent = (content: string): string => {
  try {
    // 将字符串转换为 Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    
    // 使用 pako 压缩
    const compressed = pako.deflate(data);
    
    // 将压缩后的数据转换为 Base64 字符串
    let binaryString = '';
    const bytes = new Uint8Array(compressed);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    return btoa(binaryString);
  } catch (error) {
    console.error('Pako 编码错误:', error);
    throw new Error('内容压缩失败');
  }
};

/**
 * 验证内容大小是否在可接受范围内
 * @param content - 要验证的原始内容
 * @returns 验证结果对象
 */
export const validateContentSize = (content: string): {
  isValid: boolean;
  estimatedLength: number;
  compressionRatio: number;
} => {
  // 压缩内容
  const compressed = encodePakoContent(content);
  
  // 估计 URL 长度 (基础 URL + 参数)
  const BASE_URL_LENGTH = 50; // 假设基础 URL 长度
  const estimatedLength = BASE_URL_LENGTH + compressed.length + 50; // 额外的 50 字符用于其他参数
  
  // 计算压缩比
  const compressionRatio = content.length / compressed.length;
  
  // 大多数浏览器的安全限制约为 2000 字符
  const URL_SAFE_LIMIT = 2000;
  
  return {
    isValid: estimatedLength < URL_SAFE_LIMIT,
    estimatedLength,
    compressionRatio
  };
};