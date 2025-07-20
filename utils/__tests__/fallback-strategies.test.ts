import { FallbackManager, executeFallback, getDefaultContent } from '../fallback-strategies';
import { ErrorHandler } from '../error-handler';
import { ErrorType } from '@/types';

describe('FallbackManager', () => {
    let fallbackManager: FallbackManager;

    beforeEach(() => {
        fallbackManager = new FallbackManager();
    });

    describe('URL 解析错误降级', () => {
        it('应该为 URL 解析错误提供默认内容', () => {
            const error = ErrorHandler.createError(
                ErrorType.URL_PARSE_ERROR,
                'URL 解析失败'
            );

            const result = fallbackManager.execute(error);

            expect(result.success).toBe(true);
            expect(result.content).toBeDefined();
            expect(result.action).toBe('show_default');
            expect(result.message).toContain('默认示例图表');
        });
    });

    describe('内容解码错误降级', () => {
        it('应该为解码错误提供默认内容', () => {
            const error = ErrorHandler.createError(
                ErrorType.DECODE_ERROR,
                '解码失败'
            );

            const result = fallbackManager.execute(error);

            expect(result.success).toBe(true);
            expect(result.content).toBeDefined();
            expect(result.action).toBe('show_default');
        });

        it('应该尝试使用错误详情中的原始内容', () => {
            const originalContent = 'graph TD\n  A --> B';
            const error = ErrorHandler.createError(
                ErrorType.DECODE_ERROR,
                '解码失败',
                originalContent
            );

            const result = fallbackManager.execute(error);

            expect(result.success).toBe(true);
            expect(result.content).toBe(originalContent);
            expect(result.action).toBe('retry');
        });
    });

    describe('渲染错误降级', () => {
        it('应该为渲染错误提供相关示例', () => {
            const error = ErrorHandler.createError(
                ErrorType.RENDER_ERROR,
                '渲染失败'
            );

            const result = fallbackManager.execute(error, { content: 'sequenceDiagram\nA->B' });

            expect(result.success).toBe(true);
            expect(result.content).toBeDefined();
            expect(result.content).toContain('sequenceDiagram');
        });

        it('应该尝试简化复杂图表', () => {
            const complexContent = `graph TD
        A --> B
        B --> C
        C --> D
        D --> E
        E --> F
        F --> G
        G --> H
        H --> I
        I --> J
        J --> K`;

            const error = ErrorHandler.createError(
                ErrorType.RENDER_ERROR,
                '渲染失败'
            );

            const result = fallbackManager.execute(error, { content: complexContent });

            expect(result.success).toBe(true);
            expect(result.content).toBeDefined();
        });
    });

    describe('网络错误降级', () => {
        it('应该为网络错误提供重试建议', () => {
            const error = ErrorHandler.createError(
                ErrorType.NETWORK_ERROR,
                '网络连接失败'
            );

            const result = fallbackManager.execute(error);

            expect(result.success).toBe(false);
            expect(result.action).toBe('retry');
            expect(result.message).toContain('网络连接失败');
        });
    });

    describe('AI 服务错误降级', () => {
        it('应该为 AI 服务错误提供手动输入建议', () => {
            const error = ErrorHandler.createError(
                ErrorType.AI_SERVICE_ERROR,
                'AI 服务不可用'
            );

            const result = fallbackManager.execute(error);

            expect(result.success).toBe(false);
            expect(result.action).toBe('manual_input');
            expect(result.message).toContain('AI 服务暂时不可用');
        });
    });

    describe('导出错误降级', () => {
        it('应该为 PNG 导出错误建议使用 SVG', () => {
            const error = ErrorHandler.createError(
                ErrorType.EXPORT_ERROR,
                'PNG 导出失败'
            );

            const result = fallbackManager.execute(error, { format: 'png' });

            expect(result.success).toBe(false);
            expect(result.action).toBe('retry');
            expect(result.data?.suggestedFormat).toBe('svg');
        });

        it('应该为 JPG 导出错误建议使用 PNG', () => {
            const error = ErrorHandler.createError(
                ErrorType.EXPORT_ERROR,
                'JPG 导出失败'
            );

            const result = fallbackManager.execute(error, { format: 'jpg' });

            expect(result.success).toBe(false);
            expect(result.action).toBe('retry');
            expect(result.data?.suggestedFormat).toBe('png');
        });
    });

    describe('canFallback', () => {
        it('应该正确识别支持降级的错误类型', () => {
            const supportedTypes = [
                ErrorType.URL_PARSE_ERROR,
                ErrorType.DECODE_ERROR,
                ErrorType.RENDER_ERROR,
                ErrorType.NETWORK_ERROR,
                ErrorType.AI_SERVICE_ERROR,
                ErrorType.EXPORT_ERROR
            ];

            supportedTypes.forEach(type => {
                const error = ErrorHandler.createError(type, '测试');
                expect(fallbackManager.canFallback(error)).toBe(true);
            });
        });
    });
});

describe('便捷函数', () => {
    describe('executeFallback', () => {
        it('应该执行降级策略', () => {
            const error = ErrorHandler.createError(
                ErrorType.URL_PARSE_ERROR,
                'URL 解析失败'
            );

            const result = executeFallback(error);

            expect(result.success).toBe(true);
            expect(result.content).toBeDefined();
        });
    });

    describe('getDefaultContent', () => {
        it('应该为不同错误类型返回适当的默认内容', () => {
            const renderContent = getDefaultContent(ErrorType.RENDER_ERROR);
            const decodeContent = getDefaultContent(ErrorType.DECODE_ERROR);
            const defaultContent = getDefaultContent();

            expect(renderContent).toBeDefined();
            expect(decodeContent).toBeDefined();
            expect(defaultContent).toBeDefined();

            expect(renderContent).toContain('graph');
            expect(decodeContent).toContain('graph');
            expect(defaultContent).toContain('graph');
        });
    });

    describe('FallbackManager.getDefaultExample', () => {
        it('应该返回指定类型的示例', () => {
            const simpleExample = FallbackManager.getDefaultExample('simple');
            const flowchartExample = FallbackManager.getDefaultExample('flowchart');
            const sequenceExample = FallbackManager.getDefaultExample('sequence');

            expect(simpleExample).toContain('graph LR');
            expect(flowchartExample).toContain('graph TD');
            expect(sequenceExample).toContain('sequenceDiagram');
        });

        it('应该在类型不存在时返回默认示例', () => {
            const example = FallbackManager.getDefaultExample('nonexistent' as any);
            expect(example).toContain('graph LR');
        });
    });

    describe('FallbackManager.getAllExamples', () => {
        it('应该返回所有示例', () => {
            const examples = FallbackManager.getAllExamples();

            expect(examples).toHaveProperty('simple');
            expect(examples).toHaveProperty('flowchart');
            expect(examples).toHaveProperty('sequence');
            expect(examples).toHaveProperty('class');
            expect(examples).toHaveProperty('pie');

            expect(Object.keys(examples)).toHaveLength(5);
        });
    });
});