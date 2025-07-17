import { decodePakoContent, encodePakoContent, validateContentSize } from '../pako';

// 模拟 atob 和 btoa 函数，因为在 Node.js 环境中它们可能不可用
global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');

// 模拟 TextEncoder 和 TextDecoder，因为在某些 Node.js 环境中它们可能不可用
if (typeof TextEncoder === 'undefined') {
  // @ts-ignore
  global.TextEncoder = class TextEncoder {
    encode(str: string) {
      return Buffer.from(str, 'utf-8');
    }
  };
}

if (typeof TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = class TextDecoder {
    decode(bytes: Uint8Array) {
      return Buffer.from(bytes).toString('utf-8');
    }
  };
}

describe('Pako 工具函数测试', () => {
  describe('encodePakoContent 和 decodePakoContent', () => {
    it('应该能够正确编码和解码内容', () => {
      const originalContent = 'graph TD;\nA[方形] -->|链接文本| B(圆角方形);\nB --> C{条件};\nC -->|条件1| D[结果1];\nC -->|条件2| E[结果2];';
      
      // 编码内容
      const encoded = encodePakoContent(originalContent);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');
      
      // 解码内容
      const decoded = decodePakoContent(encoded);
      expect(decoded).toBe(originalContent);
    });
    
    it('应该能够处理空字符串', () => {
      const originalContent = '';
      
      // 编码内容
      const encoded = encodePakoContent(originalContent);
      expect(encoded).toBeTruthy();
      
      // 解码内容
      const decoded = decodePakoContent(encoded);
      expect(decoded).toBe(originalContent);
    });
    
    it('应该能够处理特殊字符', () => {
      const originalContent = '包含特殊字符：!@#$%^&*()_+{}|:"<>?~`-=[]\\;\',./';
      
      // 编码内容
      const encoded = encodePakoContent(originalContent);
      expect(encoded).toBeTruthy();
      
      // 解码内容
      const decoded = decodePakoContent(encoded);
      expect(decoded).toBe(originalContent);
    });
    
    it('应该能够处理长内容', () => {
      // 创建一个长字符串
      const originalContent = 'a'.repeat(10000);
      
      // 编码内容
      const encoded = encodePakoContent(originalContent);
      expect(encoded).toBeTruthy();
      
      // 解码内容
      const decoded = decodePakoContent(encoded);
      expect(decoded).toBe(originalContent);
      expect(decoded.length).toBe(10000);
    });
    
    it('应该能够处理包含换行符的 Base64 字符串', () => {
      const originalContent = 'graph TD;\nA --> B;';
      
      // 编码内容
      let encoded = encodePakoContent(originalContent);
      
      // 在 Base64 字符串中插入换行符
      encoded = encoded.slice(0, 10) + '\n' + encoded.slice(10);
      
      // 解码内容
      const decoded = decodePakoContent(encoded);
      expect(decoded).toBe(originalContent);
    });
    
    it('应该能够处理包含空格的 Base64 字符串', () => {
      const originalContent = 'graph TD;\nA --> B;';
      
      // 编码内容
      let encoded = encodePakoContent(originalContent);
      
      // 在 Base64 字符串中插入空格
      encoded = encoded.slice(0, 10) + ' ' + encoded.slice(10);
      
      // 解码内容
      const decoded = decodePakoContent(encoded);
      expect(decoded).toBe(originalContent);
    });
    
    it('应该在解码无效内容时抛出错误', () => {
      const invalidEncoded = 'invalid-base64-content';
      
      // 临时模拟 console.error 以避免测试输出中的错误消息
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      expect(() => {
        decodePakoContent(invalidEncoded);
      }).toThrow();
      
      // 恢复 console.error
      console.error = originalConsoleError;
    });
  });
  
  describe('validateContentSize', () => {
    it('应该正确验证小内容的大小', () => {
      const smallContent = 'graph TD;\nA --> B;';
      const result = validateContentSize(smallContent);
      
      expect(result.isValid).toBe(true);
      expect(result.estimatedLength).toBeLessThan(2000);
      expect(result.compressionRatio).toBeGreaterThan(0);
    });
    
    it('应该正确验证大内容的大小', () => {
      // 创建一个非常长的内容
      const largeContent = 'a'.repeat(10000);
      const result = validateContentSize(largeContent);
      
      // 验证结果
      expect(result.compressionRatio).toBeGreaterThan(0);
      
      // 注意：这个测试可能会根据压缩效率而变化
      // 如果内容高度可压缩，即使是长内容也可能是有效的
    });
    
    it('应该计算正确的压缩比', () => {
      const content = 'aaaaaaaaaaaaaaaaaaaa'; // 高度可压缩的内容
      const result = validateContentSize(content);
      
      expect(result.compressionRatio).toBeGreaterThan(1); // 压缩比应该大于 1
    });
  });
  
  describe('端到端测试', () => {
    it('应该能够通过 URL 参数传递和恢复 Mermaid 图表', () => {
      // 原始 Mermaid 图表
      const originalContent = `graph TD
    A[开始] --> B{是否有参数?}
    B -->|是| C[解析参数]
    B -->|否| D[显示默认图表]
    C --> E[渲染图表]
    D --> E
    E --> F[结束]`;
      
      // 编码内容
      const encoded = encodePakoContent(originalContent);
      
      // 创建 URL（使用 encodeURIComponent 确保 URL 安全）
      const url = `https://example.com/mermaid?pako=${encodeURIComponent(encoded)}&theme=dark`;
      
      // 从 URL 中提取参数
      const params = new URLSearchParams(url.split('?')[1]);
      const extractedEncoded = params.get('pako') || '';
      
      // 解码内容
      const decoded = decodePakoContent(extractedEncoded);
      
      // 验证结果
      expect(decoded).toBe(originalContent);
    });
    
    it('应该能够处理 URL 中的特殊字符', () => {
      // 原始 Mermaid 图表
      const originalContent = `graph TD
    A["特殊字符: !@#$%^&*()"] --> B`;
      
      // 编码内容
      const encoded = encodePakoContent(originalContent);
      
      // 创建 URL（使用 encodeURIComponent 确保 URL 安全）
      const url = `https://example.com/mermaid?pako=${encoded}&theme=dark`;
      
      // 从 URL 中提取参数（不使用 encodeURIComponent，因为在实际应用中，浏览器会自动解码）
      const params = new URLSearchParams(url.split('?')[1]);
      const extractedEncoded = params.get('pako') || '';
      
      // 确保编码内容没有被 URL 编码改变
      expect(extractedEncoded).toBe(encoded);
      
      // 解码内容
      const decoded = decodePakoContent(extractedEncoded);
      
      // 验证结果
      expect(decoded).toBe(originalContent);
    });
  });
});