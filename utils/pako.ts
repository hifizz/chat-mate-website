import pako from 'pako';

/**
 * Mermaid Live 数据结构接口
 */
interface MermaidLiveData {
  code: string;
  mermaid?: string;
  theme?: string;
  [key: string]: any;
}

/**
 * 解码结果接口
 */
interface DecodeResult {
  content: string;
  theme?: string;
  isMermaidLiveFormat: boolean;
}

/**
 * 使用 Pako 解码压缩内容
 * @param encoded - Base64 编码的压缩内容
 * @returns 解码后的原始内容
 * @throws 如果解码失败，抛出错误
 */
export const decodePakoContent = (encoded: string): string => {
  const result = decodePakoContentWithMeta(encoded);
  return result.content;
};

/**
 * 使用 Pako 解码压缩内容，并返回元数据
 * @param encoded - Base64 编码的压缩内容
 * @returns 解码结果，包含内容和元数据
 * @throws 如果解码失败，抛出错误
 */
export const decodePakoContentWithMeta = (encoded: string): DecodeResult => {
  try {
    // 清理和标准化 Base64 字符串
    let cleanedEncoded = encoded;
    
    // 移除所有空白字符（空格、换行符、制表符等）
    cleanedEncoded = cleanedEncoded.replace(/\s/g, '');
    
    // 替换 URL 安全的 Base64 字符
    cleanedEncoded = cleanedEncoded.replace(/-/g, '+').replace(/_/g, '/');
    
    // 添加必要的填充
    while (cleanedEncoded.length % 4) {
      cleanedEncoded += '=';
    }
    
    // 验证 Base64 格式
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanedEncoded)) {
      throw new Error('无效的 Base64 格式');
    }
    
    // 将 Base64 字符串转换为二进制数据
    const binaryString = atob(cleanedEncoded);
    
    // 将二进制字符串转换为 Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // 使用 pako 解压缩
    const decompressed = pako.inflate(bytes);
    
    // 将 Uint8Array 转换为字符串
    const decoder = new TextDecoder('utf-8');
    const decodedString = decoder.decode(decompressed);
    
    // 尝试解析为 JSON（Mermaid Live 格式）
    try {
      const parsed: MermaidLiveData = JSON.parse(decodedString);
      if (parsed && typeof parsed === 'object' && parsed.code) {
        // 这是 Mermaid Live 格式，提取 code 字段和主题
        console.log('检测到 Mermaid Live 格式，提取代码内容和主题');
        
        let theme: string | undefined;
        
        // 尝试从 mermaid 字段中提取主题
        if (parsed.mermaid) {
          try {
            const mermaidConfig = JSON.parse(parsed.mermaid);
            theme = mermaidConfig.theme;
          } catch (e) {
            console.log('无法解析 mermaid 配置，使用默认主题');
          }
        }
        
        // 如果没有从 mermaid 字段中找到主题，检查顶级 theme 字段
        if (!theme && parsed.theme) {
          theme = parsed.theme;
        }
        
        return {
          content: parsed.code,
          theme,
          isMermaidLiveFormat: true
        };
      }
    } catch (jsonError) {
      // 不是 JSON 格式，直接返回原始字符串
      console.log('不是 JSON 格式，返回原始内容');
    }
    
    return {
      content: decodedString,
      isMermaidLiveFormat: false
    };
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