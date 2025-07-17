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
      const url = 'invalid-url';
      const result = parseURLParams(url);
      
      expect(result).toEqual({});
    });
    
    it('应该正确处理 darkMode 参数', () => {
      const url1 = 'https://example.com/mermaid?darkMode=true';
      const url2 = 'https://example.com/mermaid?darkMode=false';
      
      expect(parseURLParams(url1).darkMode).toBe(true);
      expect(parseURLParams(url2).darkMode).toBe(false);
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
    it('应该生成包含所有参数的 URL', () => {
      // 模拟浏览器环境
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'https://example.com',
          pathname: '/mermaid'
        },
        writable: true
      });
      
      const url = generateShareURL('abc123', 'dark', true);
      expect(url).toBe('https://example.com/mermaid?pako=abc123&theme=dark&darkMode=true');
    });
    
    it('应该只包含必要的参数', () => {
      // 模拟浏览器环境
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'https://example.com',
          pathname: '/mermaid'
        },
        writable: true
      });
      
      const url = generateShareURL('abc123');
      expect(url).toBe('https://example.com/mermaid?pako=abc123');
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
  });
  
  describe('getURLParamsFromBrowser', () => {
    it('应该从浏览器 URL 中获取参数', () => {
      // 模拟浏览器环境
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://example.com/mermaid?pako=abc123&theme=dark'
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