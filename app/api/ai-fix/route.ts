import { NextRequest, NextResponse } from 'next/server';
import { fixMermaidWithAI } from '@/utils/ai-service';

/**
 * AI 修复 Mermaid 语法错误的 API 路由
 * 
 * 这个 API 接收 Mermaid 代码，分析其中的语法错误，并返回修复后的代码
 * 使用豆包API或Deepseek API进行智能修复，如果API不可用则回退到本地规则修复
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { content, provider = 'doubao' } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '请提供有效的 Mermaid 代码' },
        { status: 400 }
      );
    }

    // 使用AI服务修复Mermaid语法
    const result = await fixMermaidWithAI(content, provider as 'doubao' | 'deepseek' | 'auto');

    // 返回修复后的内容
    return NextResponse.json({
      success: true,
      fixedContent: result.fixedContent,
      message: result.message,
      // provider: result.provider || 'local', // 不要暴露我们的模型
    });

  } catch (err) {
    console.error('AI 修复 API 错误:', err);
    return NextResponse.json(
      { error: '处理请求时发生错误' },
      { status: 500 }
    );
  }
}