import { AppError, ErrorType } from '@/types';

/**
 * 降级策略接口
 */
interface FallbackStrategy {
  canHandle: (error: AppError) => boolean;
  execute: (error: AppError, context?: any) => FallbackResult;
}

/**
 * 降级结果
 */
interface FallbackResult {
  success: boolean;
  content?: string;
  message?: string;
  action?: 'retry' | 'redirect' | 'show_default' | 'manual_input';
  data?: any;
}

/**
 * 默认示例图表
 */
const DEFAULT_EXAMPLES = {
  flowchart: `graph TD
    A[开始] --> B{是否有参数?}
    B -->|是| C[解析参数]
    B -->|否| D[显示默认图表]
    C --> E[渲染图表]
    D --> E
    E --> F[结束]`,
  
  sequence: `sequenceDiagram
    participant 用户
    participant 系统
    participant 数据库
    
    用户->>系统: 发送请求
    系统->>数据库: 查询数据
    数据库-->>系统: 返回结果
    系统-->>用户: 响应数据`,
  
  class: `classDiagram
    class 用户 {
        +String 姓名
        +String 邮箱
        +登录()
        +注销()
    }
    
    class 管理员 {
        +管理用户()
        +查看统计()
    }
    
    用户 <|-- 管理员`,
  
  pie: `pie title 数据分布
    "类型A" : 42.96
    "类型B" : 50.05
    "类型C" : 10.01`,
  
  simple: `graph LR
    A[输入] --> B[处理]
    B --> C[输出]`
};

/**
 * URL 解析错误降级策略
 */
class URLParseErrorStrategy implements FallbackStrategy {
  canHandle(error: AppError): boolean {
    return error.type === ErrorType.URL_PARSE_ERROR;
  }

  execute(error: AppError): FallbackResult {
    return {
      success: true,
      content: DEFAULT_EXAMPLES.simple,
      message: 'URL 参数解析失败，已显示默认示例图表',
      action: 'show_default'
    };
  }
}

/**
 * 内容解码错误降级策略
 */
class DecodeErrorStrategy implements FallbackStrategy {
  canHandle(error: AppError): boolean {
    return error.type === ErrorType.DECODE_ERROR;
  }

  execute(error: AppError): FallbackResult {
    // 尝试从错误详情中提取原始内容
    if (error.details && typeof error.details === 'string') {
      try {
        // 尝试直接使用未压缩的内容
        return {
          success: true,
          content: error.details,
          message: '使用未压缩的内容进行渲染',
          action: 'retry'
        };
      } catch {
        // 如果还是失败，使用默认示例
      }
    }

    return {
      success: true,
      content: DEFAULT_EXAMPLES.flowchart,
      message: '内容解码失败，已显示默认示例图表',
      action: 'show_default'
    };
  }
}

/**
 * 渲染错误降级策略
 */
class RenderErrorStrategy implements FallbackStrategy {
  canHandle(error: AppError): boolean {
    return error.type === ErrorType.RENDER_ERROR;
  }

  execute(error: AppError, context?: { content?: string }): FallbackResult {
    const content = context?.content || '';
    
    // 尝试简化图表内容
    const simplifiedContent = this.simplifyMermaidContent(content);
    if (simplifiedContent && simplifiedContent !== content) {
      return {
        success: true,
        content: simplifiedContent,
        message: '原图表过于复杂，已显示简化版本',
        action: 'retry'
      };
    }

    // 如果简化失败，提供基于内容类型的默认示例
    const exampleContent = this.getExampleByContentType(content);
    return {
      success: true,
      content: exampleContent,
      message: '图表渲染失败，已显示相关示例',
      action: 'show_default',
      data: { originalContent: content }
    };
  }

  /**
   * 简化 Mermaid 内容
   */
  private simplifyMermaidContent(content: string): string | null {
    if (!content) return null;

    try {
      const lines = content.split('\n').filter(line => line.trim());
      
      // 如果是流程图，尝试保留主要节点
      if (content.includes('graph') || content.includes('flowchart')) {
        const mainNodes = lines.filter(line => 
          line.includes('-->') || 
          line.includes('graph') || 
          line.includes('flowchart')
        ).slice(0, 10); // 限制节点数量
        
        if (mainNodes.length > 1) {
          return mainNodes.join('\n');
        }
      }

      // 如果是序列图，保留主要交互
      if (content.includes('sequenceDiagram')) {
        const mainInteractions = lines.filter(line =>
          line.includes('participant') ||
          line.includes('->') ||
          line.includes('sequenceDiagram')
        ).slice(0, 8);
        
        if (mainInteractions.length > 1) {
          return mainInteractions.join('\n');
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * 根据内容类型获取示例
   */
  private getExampleByContentType(content: string): string {
    if (content.includes('sequenceDiagram')) {
      return DEFAULT_EXAMPLES.sequence;
    }
    if (content.includes('classDiagram')) {
      return DEFAULT_EXAMPLES.class;
    }
    if (content.includes('pie')) {
      return DEFAULT_EXAMPLES.pie;
    }
    if (content.includes('graph') || content.includes('flowchart')) {
      return DEFAULT_EXAMPLES.flowchart;
    }
    
    return DEFAULT_EXAMPLES.simple;
  }
}

/**
 * 网络错误降级策略
 */
class NetworkErrorStrategy implements FallbackStrategy {
  canHandle(error: AppError): boolean {
    return error.type === ErrorType.NETWORK_ERROR;
  }

  execute(error: AppError): FallbackResult {
    return {
      success: false,
      message: '网络连接失败，请检查网络后重试',
      action: 'retry'
    };
  }
}

/**
 * AI 服务错误降级策略
 */
class AIServiceErrorStrategy implements FallbackStrategy {
  canHandle(error: AppError): boolean {
    return error.type === ErrorType.AI_SERVICE_ERROR;
  }

  execute(error: AppError): FallbackResult {
    return {
      success: false,
      message: 'AI 服务暂时不可用，请稍后重试或手动修复',
      action: 'manual_input'
    };
  }
}

/**
 * 导出错误降级策略
 */
class ExportErrorStrategy implements FallbackStrategy {
  canHandle(error: AppError): boolean {
    return error.type === ErrorType.EXPORT_ERROR;
  }

  execute(error: AppError, context?: { format?: string }): FallbackResult {
    const format = context?.format;
    
    // 建议使用其他格式
    if (format === 'png') {
      return {
        success: false,
        message: 'PNG 导出失败，建议尝试 SVG 格式',
        action: 'retry',
        data: { suggestedFormat: 'svg' }
      };
    }
    
    if (format === 'jpg') {
      return {
        success: false,
        message: 'JPG 导出失败，建议尝试 PNG 或 SVG 格式',
        action: 'retry',
        data: { suggestedFormat: 'png' }
      };
    }

    return {
      success: false,
      message: '导出失败，请尝试其他格式或刷新页面后重试',
      action: 'retry'
    };
  }
}

/**
 * 降级策略管理器
 */
export class FallbackManager {
  private strategies: FallbackStrategy[] = [
    new URLParseErrorStrategy(),
    new DecodeErrorStrategy(),
    new RenderErrorStrategy(),
    new NetworkErrorStrategy(),
    new AIServiceErrorStrategy(),
    new ExportErrorStrategy()
  ];

  /**
   * 执行降级策略
   * @param error - 应用错误
   * @param context - 上下文信息
   * @returns 降级结果
   */
  execute(error: AppError, context?: any): FallbackResult {
    const strategy = this.strategies.find(s => s.canHandle(error));
    
    if (strategy) {
      try {
        const result = strategy.execute(error, context);
        
        // 记录降级策略的使用
        console.log(`[FallbackManager] 使用降级策略处理错误: ${error.type}`, result);
        
        return result;
      } catch (fallbackError) {
        console.error('[FallbackManager] 降级策略执行失败:', fallbackError);
        
        // 降级策略本身失败时的最终降级
        return this.getUltimateFallback(error);
      }
    }

    // 没有找到合适的策略时的默认降级
    return this.getUltimateFallback(error);
  }

  /**
   * 最终降级策略
   */
  private getUltimateFallback(error: AppError): FallbackResult {
    return {
      success: true,
      content: DEFAULT_EXAMPLES.simple,
      message: '发生未知错误，已显示默认示例',
      action: 'show_default'
    };
  }

  /**
   * 获取默认示例
   */
  static getDefaultExample(type: keyof typeof DEFAULT_EXAMPLES = 'simple'): string {
    return DEFAULT_EXAMPLES[type] || DEFAULT_EXAMPLES.simple;
  }

  /**
   * 获取所有示例
   */
  static getAllExamples(): Record<string, string> {
    return { ...DEFAULT_EXAMPLES };
  }

  /**
   * 检查是否支持降级
   */
  canFallback(error: AppError): boolean {
    return this.strategies.some(s => s.canHandle(error));
  }
}

// 创建全局实例
export const fallbackManager = new FallbackManager();

/**
 * 便捷函数：执行降级策略
 */
export function executeFallback(error: AppError, context?: any): FallbackResult {
  return fallbackManager.execute(error, context);
}

/**
 * 便捷函数：获取默认内容
 */
export function getDefaultContent(errorType?: ErrorType): string {
  switch (errorType) {
    case ErrorType.RENDER_ERROR:
      return DEFAULT_EXAMPLES.simple;
    case ErrorType.DECODE_ERROR:
    case ErrorType.URL_PARSE_ERROR:
      return DEFAULT_EXAMPLES.flowchart;
    default:
      return DEFAULT_EXAMPLES.simple;
  }
}