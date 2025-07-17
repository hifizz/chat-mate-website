import { parseURLParams, extractPakoContent, generateShareURL, isURLTooLong, getURLParamsFromBrowser } from '../url';

describe('URL 工具函数测试', () => {
  describe('parseURLParams', () => {
    it('应该正确解析包含所有参数的 URL', () => {
      const url = 'https://example.com/mermaid?pako=abc123&theme=dark&darkMode=true';
      const result = parseURLParams(url);
      
      expect(result).toEqual({
        pako: 'abc123',
        theme: 'dark',
        darkMode: true
      });
    });
    
    it('应该正确处理缺少参数的 URL', () => {
      const url = 'https://example.com/mermaid?theme=forest';
      const result = parseURLParams(url);
      
      expect(result).toEqual({
        theme: 'forest'
      });
    });
    
    it('应该返回空对象当 URL 无效时', () => {
      // 临时模拟 console.error 以避免测试输出中的错误消息
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      const url = 'invalid-url';
      const result = parseURLParams(url);
      
      expect(result).toEqual({});
      
      // 恢复 console.error
      console.error = originalConsoleError;
    });
    
    it('应该正确处理 darkMode 参数', () => {
      const url1 = 'https://example.com/mermaid?darkMode=true';
      const url2 = 'https://example.com/mermaid?darkMode=false';
      
      expect(parseURLParams(url1).darkMode).toBe(true);
      expect(parseURLParams(url2).darkMode).toBe(false);
    });
    
    it('应该正确处理包含特殊字符的参数', () => {
      const url = 'https://example.com/mermaid?pako=abc%2B123%2F456%3D';
      const result = parseURLParams(url);
      
      expect(result.pako).toBe('abc+123/456=');
    });
    
    it('应该正确处理包含换行符的参数', () => {
      const url = 'https://example.com/mermaid?pako=abc%0D%0A123';
      const result = parseURLParams(url);
      
      expect(result.pako).toBe('abc\r\n123');
    });
  });
  
  describe('extractPakoContent', () => {
    it('应该正确提取 pako 内容', () => {
      const params = { pako: 'abc123' };
      expect(extractPakoContent(params)).toBe('abc123');
    });
    
    it('应该返回 null 当 pako 参数不存在时', () => {
      const params = { theme: 'dark' };
      expect(extractPakoContent(params)).toBeNull();
    });
  });
  
  describe('generateShareURL', () => {
    beforeEach(() => {
      // 模拟浏览器环境
      Object.defineProperty(global, 'window', {
        value: {
          location: {
            origin: 'https://example.com',
            pathname: '/mermaid'
          }
        },
        writable: true
      });
    });
    
    it('应该生成包含所有参数的 URL', () => {
      const url = generateShareURL('abc123', 'dark', true);
      expect(url).toBe('https://example.com/mermaid?pako=abc123&theme=dark&darkMode=true');
    });
    
    it('应该只包含必要的参数', () => {
      const url = generateShareURL('abc123');
      expect(url).toBe('https://example.com/mermaid?pako=abc123');
    });
    
    it('应该正确处理包含特殊字符的内容', () => {
      const url = generateShareURL('abc+/=123');
      // URL 编码会将特殊字符转换为百分比编码
      expect(url).toContain('pako=abc%2B%2F%3D123');
    });
    
    it('应该在非浏览器环境中使用默认 URL', () => {
      // 模拟非浏览器环境
      const originalWindow = global.window;
      // @ts-ignore
      global.window = undefined;
      
      const url = generateShareURL('abc123');
      expect(url).toContain('pako=abc123');
      
      // 恢复环境
      global.window = originalWindow;
    });
  });
  
  describe('isURLTooLong', () => {
    it('应该正确识别过长的 URL', () => {
      // 创建一个超过 2000 字符的 URL
      const longContent = 'a'.repeat(2000);
      const longURL = `https://example.com/mermaid?pako=${longContent}`;
      
      expect(isURLTooLong(longURL)).toBe(true);
    });
    
    it('应该正确识别合适长度的 URL', () => {
      const shortURL = 'https://example.com/mermaid?pako=abc123';
      expect(isURLTooLong(shortURL)).toBe(false);
    });
    
    it('应该正确处理边界情况', () => {
      // 创建一个接近 2000 字符的 URL
      const baseUrl = 'https://example.com/mermaid?pako=';
      const contentLength = 2000 - baseUrl.length - 1; // 减1是为了确保不超过2000
      const content = 'a'.repeat(contentLength);
      const url = `${baseUrl}${content}`;
      
      expect(url.length).toBeLessThan(2000);
      expect(isURLTooLong(url)).toBe(false);
      
      // 添加字符使其超过限制
      const tooLongUrl = `${url}bcd`;
      expect(tooLongUrl.length).toBeGreaterThan(2000);
      expect(isURLTooLong(tooLongUrl)).toBe(true);
    });
  });
  
  describe('getURLParamsFromBrowser', () => {
    it('应该从浏览器 URL 中获取参数', () => {
      // 模拟浏览器环境
      Object.defineProperty(global, 'window', {
        value: {
          location: {
            href: 'https://example.com/mermaid?pako=abc123&theme=dark'
          }
        },
        writable: true
      });
      
      const result = getURLParamsFromBrowser();
      expect(result).toEqual({
        pako: 'abc123',
        theme: 'dark'
      });
    });
    
    it('应该返回空对象当不在浏览器环境时', () => {
      // 模拟非浏览器环境
      const originalWindow = global.window;
      // @ts-ignore
      global.window = undefined;
      
      const result = getURLParamsFromBrowser();
      expect(result).toEqual({});
      
      // 恢复环境
      global.window = originalWindow;
    });
  });
});