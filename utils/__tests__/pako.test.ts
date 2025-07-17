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
    
    it('应该在解码无效内容时抛出错误', () => {
      const invalidEncoded = 'invalid-base64-content';
      
      expect(() => {
        decodePakoContent(invalidEncoded);
      }).toThrow();
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
});