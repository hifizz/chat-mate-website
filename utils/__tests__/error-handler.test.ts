import { ErrorHandler } from '../error-handler';
import { ErrorType } from '@/types';

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn(),
    success: jest.fn()
  }
}));

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createError', () => {
    it('应该创建正确的错误对象', () => {
      const error = ErrorHandler.createError(
        ErrorType.RENDER_ERROR,
        '测试错误',
        { detail: 'test' }
      );

      expect(error).toEqual({
        type: ErrorType.RENDER_ERROR,
        message: '测试错误',
        details: { detail: 'test' }
      });
    });
  });

  describe('handle', () => {
    it('应该格式化错误消息', () => {
      const error = ErrorHandler.createError(
        ErrorType.RENDER_ERROR,
        '测试错误'
      );

      const message = ErrorHandler.handle(error, false);
      expect(message).toBe('图表渲染失败: 测试错误');
    });

    it('应该处理不同类型的错误', () => {
      const testCases = [
        { type: ErrorType.URL_PARSE_ERROR, expected: 'URL 解析失败: 测试' },
        { type: ErrorType.DECODE_ERROR, expected: '内容解码失败: 测试' },
        { type: ErrorType.EXPORT_ERROR, expected: '导出失败: 测试' },
        { type: ErrorType.AI_SERVICE_ERROR, expected: 'AI 服务错误: 测试' },
        { type: ErrorType.NETWORK_ERROR, expected: '网络错误: 测试' }
      ];

      testCases.forEach(({ type, expected }) => {
        const error = ErrorHandler.createError(type, '测试');
        const message = ErrorHandler.handle(error, false);
        expect(message).toBe(expected);
      });
    });
  });

  describe('isRecoverable', () => {
    it('应该正确识别可恢复的错误', () => {
      const recoverableErrors = [
        ErrorType.NETWORK_ERROR,
        ErrorType.AI_SERVICE_ERROR,
        ErrorType.RENDER_ERROR
      ];

      const nonRecoverableErrors = [
        ErrorType.URL_PARSE_ERROR,
        ErrorType.DECODE_ERROR,
        ErrorType.EXPORT_ERROR
      ];

      recoverableErrors.forEach(type => {
        const error = ErrorHandler.createError(type, '测试');
        expect(ErrorHandler.isRecoverable(error)).toBe(true);
      });

      nonRecoverableErrors.forEach(type => {
        const error = ErrorHandler.createError(type, '测试');
        expect(ErrorHandler.isRecoverable(error)).toBe(false);
      });
    });
  });

  describe('getRecoverySuggestions', () => {
    it('应该为不同错误类型提供相应的建议', () => {
      const renderError = ErrorHandler.createError(ErrorType.RENDER_ERROR, '测试');
      const suggestions = ErrorHandler.getRecoverySuggestions(renderError);
      
      expect(suggestions).toContain('检查 Mermaid 语法是否正确');
      expect(suggestions).toContain('使用 AI 修复功能自动修正');
    });

    it('应该为网络错误提供网络相关建议', () => {
      const networkError = ErrorHandler.createError(ErrorType.NETWORK_ERROR, '测试');
      const suggestions = ErrorHandler.getRecoverySuggestions(networkError);
      
      expect(suggestions).toContain('检查网络连接');
      expect(suggestions).toContain('刷新页面重试');
    });
  });

  describe('wrapAsync', () => {
    it('应该包装异步函数并处理错误', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('测试错误'));
      const wrappedFn = ErrorHandler.wrapAsync(
        mockFn,
        ErrorType.NETWORK_ERROR,
        '网络请求失败'
      );

      const result = await wrappedFn('test');
      expect(result).toBeNull();
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('应该在成功时返回结果', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = ErrorHandler.wrapAsync(
        mockFn,
        ErrorType.NETWORK_ERROR,
        '网络请求失败'
      );

      const result = await wrappedFn('test');
      expect(result).toBe('success');
    });
  });

  describe('wrapSync', () => {
    it('应该包装同步函数并处理错误', () => {
      const mockFn = jest.fn().mockImplementation(() => {
        throw new Error('测试错误');
      });
      const wrappedFn = ErrorHandler.wrapSync(
        mockFn,
        ErrorType.RENDER_ERROR,
        '渲染失败'
      );

      const result = wrappedFn('test');
      expect(result).toBeNull();
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('应该在成功时返回结果', () => {
      const mockFn = jest.fn().mockReturnValue('success');
      const wrappedFn = ErrorHandler.wrapSync(
        mockFn,
        ErrorType.RENDER_ERROR,
        '渲染失败'
      );

      const result = wrappedFn('test');
      expect(result).toBe('success');
    });
  });
});