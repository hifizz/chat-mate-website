import { NextRequest, NextResponse } from 'next/server';

/**
 * AI 修复 Mermaid 语法错误的 API 路由
 * 
 * 这个 API 接收 Mermaid 代码，分析其中的语法错误，并返回修复后的代码
 * 目前是一个模拟实现，未来可以集成真实的 AI 服务
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { content } = body;
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '请提供有效的 Mermaid 代码' },
        { status: 400 }
      );
    }
    
    // 模拟 AI 处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 简单的语法修复逻辑（模拟 AI 修复）
    let fixedContent = content;
    
    // 修复常见的语法错误
    fixedContent = fixMissingArrows(fixedContent);
    fixedContent = fixMissingBrackets(fixedContent);
    fixedContent = fixMissingQuotes(fixedContent);
    fixedContent = fixDirectionKeywords(fixedContent);
    
    // 返回修复后的内容
    return NextResponse.json({
      success: true,
      fixedContent,
      message: '语法已修复'
    });
    
  } catch (error) {
    console.error('AI 修复错误:', error);
    return NextResponse.json(
      { error: '处理请求时发生错误' },
      { status: 500 }
    );
  }
}

/**
 * 修复缺失的箭头
 */
function fixMissingArrows(content: string): string {
  // 查找可能缺失箭头的行
  return content.replace(/(\w+|\])\s+(\w+|\[)/g, '$1 --> $2');
}

/**
 * 修复缺失的方括号
 */
function fixMissingBrackets(content: string): string {
  // 查找节点定义但缺少方括号的情况
  const lines = content.split('\n');
  const fixedLines = lines.map(line => {
    // 如果行包含箭头，但节点没有方括号
    if (line.includes('-->') || line.includes('---')) {
      return line.replace(/(\s|^)(\w+)(\s*)(-->|---|->)/g, '$1[$2]$3$4')
                 .replace(/(-->|---|->)(\s*)(\w+)(\s|$)/g, '$1$2[$3]$4');
    }
    return line;
  });
  return fixedLines.join('\n');
}

/**
 * 修复缺失的引号
 */
function fixMissingQuotes(content: string): string {
  // 查找可能缺少引号的文本
  return content;  // 简化实现，实际应该检测并修复缺失的引号
}

/**
 * 修复方向关键词
 */
function fixDirectionKeywords(content: string): string {
  // 检查图表类型和方向关键词
  if (content.includes('graph') && !content.includes('TD') && !content.includes('LR')) {
    return content.replace(/graph\s*\n/, 'graph TD\n');
  }
  return content;
}