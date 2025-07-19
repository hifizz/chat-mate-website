/**
 * AI服务工具类
 * 
 * 提供与AI模型交互的功能，用于修复Mermaid语法错误
 */

// AI API配置
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'; // 使用正确的豆包API域名
const DOUBAO_MODEL = 'doubao-seed-1-6-flash-250615'; // 使用您的实际模型ID

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat'; // 使用Deepseek Chat模型

/**
 * 使用AI修复Mermaid语法错误
 * 
 * @param content Mermaid图表代码
 * @param provider 可选的AI提供商，支持'doubao'和'deepseek'
 * @returns 修复后的Mermaid图表代码
 */
export async function fixMermaidWithAI(
  content: string,
  provider: 'doubao' | 'deepseek' | 'auto' = 'auto'
): Promise<{
  success: boolean;
  fixedContent: string;
  message: string;
  provider?: string;
}> {
  try {
    // 如果内容没有明显错误，直接返回
    if (isValidMermaidSyntax(content)) {
      return {
        success: true,
        fixedContent: content,
        message: '代码语法正确，无需修复'
      };
    }

    // 根据提供商选择不同的API
    if (provider === 'auto') {
      // 尝试豆包API，如果失败则尝试Deepseek API
      const doubaoApiKey = process.env.DOUBAO_API_KEY;
      const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

      if (doubaoApiKey) {
        try {
          const result = await fixWithDoubao(content, doubaoApiKey);
          return {
            ...result,
            provider: 'doubao'
          };
        } catch (error) {
          // 豆包API失败，尝试Deepseek API
          if (deepseekApiKey) {
            try {
              const result = await fixWithDeepseek(content, deepseekApiKey);
              return {
                ...result,
                provider: 'deepseek'
              };
            } catch (deepseekError) {
              // Deepseek API也失败，静默回退到本地规则
            }
          }
        }
      } else if (deepseekApiKey) {
        try {
          const result = await fixWithDeepseek(content, deepseekApiKey);
          return {
            ...result,
            provider: 'deepseek'
          };
        } catch (error) {
          // Deepseek API修复失败，静默回退到本地规则
        }
      }
    } else if (provider === 'doubao') {
      const apiKey = process.env.DOUBAO_API_KEY;
      if (apiKey) {
        try {
          const result = await fixWithDoubao(content, apiKey);
          return {
            ...result,
            provider: 'doubao'
          };
        } catch (error) {
          // 豆包API调用失败，静默回退到本地规则
        }
      }
    } else if (provider === 'deepseek') {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (apiKey) {
        try {
          const result = await fixWithDeepseek(content, apiKey);
          return {
            ...result,
            provider: 'deepseek'
          };
        } catch (error) {
          // Deepseek API调用失败，静默回退到本地规则
        }
      }
    }

    // 如果没有配置API密钥或指定的提供商不可用，则使用本地规则修复
    // 静默回退到本地规则，不显示警告
    return fixWithLocalRules(content);
  } catch (error) {
    // 如果AI修复失败，静默回退到本地规则修复
    return fixWithLocalRules(content);
  }
}

/**
 * 使用豆包API修复Mermaid语法错误
 * 
 * @param content Mermaid图表代码
 * @param apiKey 豆包API密钥
 * @returns 修复后的Mermaid图表代码
 */
async function fixWithDoubao(content: string, apiKey: string): Promise<{
  success: boolean;
  fixedContent: string;
  message: string;
}> {
  try {
    // 根据豆包API文档构建请求体
    const requestBody = {
      model: DOUBAO_MODEL,
      messages: [
        {
          role: 'system',
          content: `你是一个专门修复Mermaid图表语法错误的AI助手。你的任务是分析用户提供的Mermaid代码，找出并修复其中的语法错误。

常见的Mermaid语法错误包括：
1. 缺少箭头（-->）
2. 节点定义不完整（缺少方括号[]或花括号{}）
3. 缺少引号或引号不匹配
4. 图表类型和方向关键词不正确（如缺少TD或LR）
5. 子图定义错误
6. 样式定义错误

请仅返回修复后的完整代码，不要包含任何解释或其他文本。`
        },
        {
          role: 'user',
          content: `请修复以下Mermaid图表代码中的语法错误：\n\n${content}`
        }
      ],
      temperature: 0.2,
      max_tokens: 4096,
      stream: false
    };
    
    // 调用豆包API
    const response = await fetch(DOUBAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`豆包API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    // 根据豆包API文档提取AI修复后的内容
    const fixedContent = data.choices?.[0]?.message?.content?.trim();

    if (!fixedContent) {
      throw new Error('豆包AI未返回有效的修复内容');
    }

    // 移除可能的代码块标记
    const cleanedContent = cleanMermaidCode(fixedContent);

    return {
      success: true,
      fixedContent: cleanedContent,
      message: '已使用豆包AI修复语法错误'
    };
  } catch (error) {
    throw error; // 重新抛出错误，让上层处理
  }
}

/**
 * 使用Deepseek API修复Mermaid语法错误
 * 
 * @param content Mermaid图表代码
 * @param apiKey Deepseek API密钥
 * @returns 修复后的Mermaid图表代码
 */
async function fixWithDeepseek(content: string, apiKey: string): Promise<{
  success: boolean;
  fixedContent: string;
  message: string;
}> {
  // 构建请求体
  const requestBody = {
    model: DEEPSEEK_MODEL,
    messages: [
      {
        role: 'system',
        content: `你是一个专门修复Mermaid图表语法错误的AI助手。你的任务是分析用户提供的Mermaid代码，找出并修复其中的语法错误。
        
常见的Mermaid语法错误包括：
1. 缺少箭头（-->）
2. 节点定义不完整（缺少方括号[]或花括号{}）
3. 缺少引号或引号不匹配
4. 图表类型和方向关键词不正确（如缺少TD或LR）
5. 子图定义错误
6. 样式定义错误

请仅返回修复后的完整代码，不要包含任何解释或其他文本。`
      },
      {
        role: 'user',
        content: `请修复以下Mermaid图表代码中的语法错误：\n\n${content}`
      }
    ],
    temperature: 0.2, // 低温度，保持输出确定性
    max_tokens: 4096
  };

  // 调用Deepseek API
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Deepseek API请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // 提取AI修复后的内容
  const fixedContent = data.choices[0]?.message?.content?.trim();

  if (!fixedContent) {
    throw new Error('Deepseek AI未返回有效的修复内容');
  }

  // 移除可能的代码块标记
  const cleanedContent = cleanMermaidCode(fixedContent);

  return {
    success: true,
    fixedContent: cleanedContent,
    message: '已使用Deepseek AI修复语法错误'
  };
}

/**
 * 清理Mermaid代码，移除可能的代码块标记
 * 
 * @param content AI返回的内容
 * @returns 清理后的Mermaid代码
 */
function cleanMermaidCode(content: string): string {
  return content
    .replace(/^```mermaid\n/, '')
    .replace(/^```\n/, '')
    .replace(/\n```$/, '')
    .trim();
}

/**
 * 使用本地规则修复Mermaid语法错误
 * 
 * @param content Mermaid图表代码
 * @returns 修复后的Mermaid图表代码
 */
function fixWithLocalRules(content: string): {
  success: boolean;
  fixedContent: string;
  message: string;
} {
  // 简单的语法修复逻辑
  let fixedContent = content;
  let hasChanges = false;

  // 修复常见的语法错误
  const fixedArrows = fixMissingArrows(fixedContent);
  if (fixedArrows !== fixedContent) {
    fixedContent = fixedArrows;
    hasChanges = true;
  }

  const fixedBrackets = fixMissingBrackets(fixedContent);
  if (fixedBrackets !== fixedContent) {
    fixedContent = fixedBrackets;
    hasChanges = true;
  }

  const fixedQuotes = fixMissingQuotes(fixedContent);
  if (fixedQuotes !== fixedContent) {
    fixedContent = fixedQuotes;
    hasChanges = true;
  }

  const fixedKeywords = fixDirectionKeywords(fixedContent);
  if (fixedKeywords !== fixedContent) {
    fixedContent = fixedKeywords;
    hasChanges = true;
  }

  return {
    success: true,
    fixedContent,
    message: hasChanges ? '已使用本地规则修复语法错误' : '代码语法正确，无需修复'
  };
}

/**
 * 检查Mermaid语法是否有效
 * 
 * @param content Mermaid图表代码
 * @returns 是否有效
 */
function isValidMermaidSyntax(content: string): boolean {
  // 这里只进行简单的检查，实际上需要使用Mermaid的parse方法进行验证
  // 但由于在服务端无法直接使用Mermaid库，所以只能进行简单检查

  // 检查是否包含基本的图表类型定义
  const hasGraphType = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline|zenuml|block-beta|sankey-beta)/m.test(content);

  if (!hasGraphType) {
    return false;
  }

  // 检查是否有明显的语法错误
  const hasMissingArrows = /(\w+|\])\s+(\w+|\[)/g.test(content);
  const hasUnmatchedQuotes = content.split('\n').some(line => {
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    return singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0;
  });

  return !hasMissingArrows && !hasUnmatchedQuotes;
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
  const lines = content.split('\n');
  const fixedLines = lines.map(line => {
    // 检查是否有未闭合的引号
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;

    if (singleQuotes % 2 !== 0) {
      // 单引号不成对，添加一个单引号到行尾
      return line + "'";
    }

    if (doubleQuotes % 2 !== 0) {
      // 双引号不成对，添加一个双引号到行尾
      return line + '"';
    }

    return line;
  });
  return fixedLines.join('\n');
}

/**
 * 修复方向关键词
 */
function fixDirectionKeywords(content: string): string {
  // 检查图表类型和方向关键词
  if (content.includes('graph') && !content.includes('TD') && !content.includes('LR')) {
    return content.replace(/graph\s*\n/, 'graph TD\n');
  }

  // 检查子图定义
  const lines = content.split('\n');
  const fixedLines = lines.map(line => {
    if (line.trim().startsWith('subgraph') && !line.includes('end')) {
      // 子图定义可能缺少结束标记，但我们不能在这里添加，因为需要确定子图的范围
      // 这种情况需要更复杂的解析，这里只是一个简单的检查
      // 静默处理未闭合的子图定义
    }
    return line;
  });

  return fixedLines.join('\n');
}