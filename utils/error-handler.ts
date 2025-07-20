import { AppError, ErrorType } from '@/types';
import { toast } from 'sonner';

/**
 * 统一错误处理器
 */
export class ErrorHandler {
  /**
   * 处理应用错误
   * @param error - 应用错误对象
   * @param showToast - 是否显示 toast 提示
   * @returns 格式化的错误信息
   */
  static handle(error: AppError, showToast: boolean = true): string {
    const message = this.formatErrorMessage(error);
    
    if (showToast) {
      this.showErrorToast(error);
    }
    
    // 记录错误到控制台（生产环境可以发送到日志服务）
    this.logError(error);
    
    return message;
  }

  /**
   * 创建应用错误对象
   * @param type - 错误类型
   * @param message - 错误消息
   * @param details - 错误详情
   * @returns 应用错误对象
   */
  static createError(type: ErrorType, message: string, details?: any): AppError {
    return {
      type,
      message,
      details
    };
  }

  /**
   * 格式化错误消息
   * @param error - 应用错误对象
   * @returns 格式化的错误消息
   */
  private static formatErrorMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.URL_PARSE_ERROR:
        return `URL 解析失败: ${error.message}`;
      case ErrorType.DECODE_ERROR:
        return `内容解码失败: ${error.message}`;
      case ErrorType.RENDER_ERROR:
        return `图表渲染失败: ${error.message}`;
      case ErrorType.EXPORT_ERROR:
        return `导出失败: ${error.message}`;
      case ErrorType.AI_SERVICE_ERROR:
        return `AI 服务错误: ${error.message}`;
      case ErrorType.NETWORK_ERROR:
        return `网络错误: ${error.message}`;
      default:
        return `未知错误: ${error.message}`;
    }
  }

  /**
   * 显示错误 toast
   * @param error - 应用错误对象
   */
  private static showErrorToast(error: AppError): void {
    const message = this.getToastMessage(error);
    
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.AI_SERVICE_ERROR:
        toast.error(message, {
          description: '请检查网络连接或稍后重试',
          duration: 5000
        });
        break;
      case ErrorType.RENDER_ERROR:
        toast.error(message, {
          description: '请检查 Mermaid 语法或使用 AI 修复功能',
          duration: 5000
        });
        break;
      default:
        toast.error(message, {
          duration: 4000
        });
    }
  }

  /**
   * 获取 toast 消息
   * @param error - 应用错误对象
   * @returns toast 消息
   */
  private static getToastMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.URL_PARSE_ERROR:
        return '无法解析 URL 参数';
      case ErrorType.DECODE_ERROR:
        return '无法解码分享内容';
      case ErrorType.RENDER_ERROR:
        return '图表渲染失败';
      case ErrorType.EXPORT_ERROR:
        return '导出图片失败';
      case ErrorType.AI_SERVICE_ERROR:
        return 'AI 服务暂时不可用';
      case ErrorType.NETWORK_ERROR:
        return '网络连接失败';
      default:
        return '操作失败';
    }
  }

  /**
   * 记录错误日志
   * @param error - 应用错误对象
   */
  private static logError(error: AppError): void {
    const logData = {
      timestamp: new Date().toISOString(),
      type: error.type,
      message: error.message,
      details: error.details,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };

    console.error('[ErrorHandler]', logData);

    // 在生产环境中，可以将错误发送到日志服务
    if (process.env.NODE_ENV === 'production') {
      // 这里可以集成第三方日志服务，如 Sentry、LogRocket 等
      // sendToLogService(logData);
    }
  }

  /**
   * 包装异步函数，自动处理错误
   * @param fn - 异步函数
   * @param errorType - 错误类型
   * @param errorMessage - 错误消息
   * @returns 包装后的函数
   */
  static wrapAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    errorType: ErrorType,
    errorMessage: string
  ) {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args);
      } catch (error) {
        const appError = this.createError(errorType, errorMessage, error);
        this.handle(appError);
        return null;
      }
    };
  }

  /**
   * 包装同步函数，自动处理错误
   * @param fn - 同步函数
   * @param errorType - 错误类型
   * @param errorMessage - 错误消息
   * @returns 包装后的函数
   */
  static wrapSync<T extends any[], R>(
    fn: (...args: T) => R,
    errorType: ErrorType,
    errorMessage: string
  ) {
    return (...args: T): R | null => {
      try {
        return fn(...args);
      } catch (error) {
        const appError = this.createError(errorType, errorMessage, error);
        this.handle(appError);
        return null;
      }
    };
  }

  /**
   * 检查是否为可恢复的错误
   * @param error - 应用错误对象
   * @returns 是否可恢复
   */
  static isRecoverable(error: AppError): boolean {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.AI_SERVICE_ERROR:
        return true;
      case ErrorType.RENDER_ERROR:
        return true; // 可以通过 AI 修复
      default:
        return false;
    }
  }

  /**
   * 获取错误恢复建议
   * @param error - 应用错误对象
   * @returns 恢复建议列表
   */
  static getRecoverySuggestions(error: AppError): string[] {
    switch (error.type) {
      case ErrorType.URL_PARSE_ERROR:
        return [
          '检查 URL 格式是否正确',
          '尝试重新生成分享链接',
          '使用默认示例图表'
        ];
      case ErrorType.DECODE_ERROR:
        return [
          '检查分享链接是否完整',
          '尝试重新复制分享链接',
          '联系分享者确认链接有效性'
        ];
      case ErrorType.RENDER_ERROR:
        return [
          '检查 Mermaid 语法是否正确',
          '使用 AI 修复功能自动修正',
          '参考 Mermaid 官方文档',
          '尝试简化图表结构'
        ];
      case ErrorType.EXPORT_ERROR:
        return [
          '尝试其他导出格式',
          '检查浏览器是否支持该功能',
          '尝试缩小图表尺寸',
          '使用其他浏览器重试'
        ];
      case ErrorType.AI_SERVICE_ERROR:
        return [
          '检查网络连接',
          '稍后重试',
          '手动修复语法错误',
          '联系管理员'
        ];
      case ErrorType.NETWORK_ERROR:
        return [
          '检查网络连接',
          '刷新页面重试',
          '检查防火墙设置',
          '尝试使用其他网络'
        ];
      default:
        return [
          '刷新页面重试',
          '清除浏览器缓存',
          '联系技术支持'
        ];
    }
  }
}

/**
 * 错误边界组件的错误处理
 */
export const handleComponentError = (error: Error, errorInfo: any): AppError => {
  const appError = ErrorHandler.createError(
    ErrorType.RENDER_ERROR,
    '组件渲染失败',
    { error: error.message, errorInfo }
  );
  
  ErrorHandler.handle(appError);
  return appError;
};

/**
 * Promise 拒绝处理
 */
export const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
  const appError = ErrorHandler.createError(
    ErrorType.NETWORK_ERROR,
    '未处理的 Promise 拒绝',
    event.reason
  );
  
  ErrorHandler.handle(appError);
  event.preventDefault(); // 阻止默认的错误处理
};

/**
 * 全局错误处理
 */
export const handleGlobalError = (event: ErrorEvent): void => {
  const appError = ErrorHandler.createError(
    ErrorType.RENDER_ERROR,
    '全局错误',
    {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    }
  );
  
  ErrorHandler.handle(appError);
};