/**
 * AI API 综合集成测试
 * 测试豆包和 Deepseek API 的综合功能
 */

import { test, expect } from '@playwright/test';

// 测试用的错误 Mermaid 代码
const INVALID_MERMAID_CODE = `graph TD
    A[开始]
    B[处理数据
    C[结束]
    A B
    B C`;

test.describe('AI API 综合集成测试', () => {
  test('应该能够在 auto 模式下智能选择可用的 API', async ({ request }) => {
    const response = await request.post('/api/ai-fix', {
      data: {
        content: INVALID_MERMAID_CODE,
        provider: 'auto'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    console.log('Auto 模式响应:', JSON.stringify(result, null, 2));

    // 验证响应结构
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('fixedContent');
    expect(result).toHaveProperty('message');

    // 验证修复结果
    expect(result.success).toBe(true);
    expect(result.fixedContent).toBeTruthy();
    expect(result.fixedContent.length).toBeGreaterThan(0);

    // 验证修复后的代码包含必要的语法元素
    expect(result.fixedContent).toContain('graph');
    expect(result.fixedContent).toContain('-->');
  });

  test('应该能够比较豆包和 Deepseek API 的修复结果', async ({ request }) => {
    // 测试豆包 API
    const doubaoResponse = await request.post('/api/ai-fix', {
      data: {
        content: INVALID_MERMAID_CODE,
        provider: 'doubao'
      }
    });

    expect(doubaoResponse.ok()).toBeTruthy();
    const doubaoResult = await doubaoResponse.json();

    // 测试 Deepseek API
    const deepseekResponse = await request.post('/api/ai-fix', {
      data: {
        content: INVALID_MERMAID_CODE,
        provider: 'deepseek'
      }
    });

    expect(deepseekResponse.ok()).toBeTruthy();
    const deepseekResult = await deepseekResponse.json();

    console.log('豆包 API 结果:', JSON.stringify(doubaoResult, null, 2));
    console.log('Deepseek API 结果:', JSON.stringify(deepseekResult, null, 2));

    // 两个 API 都应该成功修复
    expect(doubaoResult.success).toBe(true);
    expect(deepseekResult.success).toBe(true);

    // 两个结果都应该包含修复后的代码
    expect(doubaoResult.fixedContent).toBeTruthy();
    expect(deepseekResult.fixedContent).toBeTruthy();

    // 两个结果都应该包含基本的图表元素
    expect(doubaoResult.fixedContent).toContain('graph');
    expect(deepseekResult.fixedContent).toContain('graph');
    expect(doubaoResult.fixedContent).toContain('-->');
    expect(deepseekResult.fixedContent).toContain('-->');
  });

  test('应该能够处理不同类型的图表语法错误', async ({ request }) => {
    const testCases = [
      {
        name: '流程图',
        code: `flowchart TD
          Start([开始])
          Process[处理
          End([结束])
          Start Process
          Process End`
      },
      {
        name: '序列图',
        code: `sequenceDiagram
          participant A
          participant B
          A->>B 发送消息
          B-->>A: 回复消息`
      },
      {
        name: '类图',
        code: `classDiagram
          class Animal {
            +String name
            +makeSound()
          }
          class Dog
          Animal <|-- Dog`
      }
    ];

    for (const testCase of testCases) {
      console.log(`测试 ${testCase.name}...`);
      
      // 使用 auto 模式测试
      const response = await request.post('/api/ai-fix', {
        data: {
          content: testCase.code,
          provider: 'auto'
        }
      });

      expect(response.ok()).toBeTruthy();
      
      const result = await response.json();
      console.log(`${testCase.name} 修复结果:`, JSON.stringify(result, null, 2));

      expect(result.success).toBe(true);
      expect(result.fixedContent).toBeTruthy();
    }
  });

  test('应该能够处理 API 故障转移', async ({ request }) => {
    // 这个测试验证当一个 API 不可用时，系统能够自动切换到另一个 API
    // 在实际环境中，这需要模拟 API 故障，这里我们只验证 auto 模式的基本功能
    
    const response = await request.post('/api/ai-fix', {
      data: {
        content: INVALID_MERMAID_CODE,
        provider: 'auto'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    
    // 无论使用哪个 API，都应该能够成功修复
    expect(result.success).toBe(true);
    expect(result.fixedContent).toBeTruthy();
    expect(result.message).toBeTruthy();
  });
});

test.describe('API 性能和稳定性测试', () => {
  test('应该能够处理并发请求', async ({ request }) => {
    const promises = [];
    
    // 创建 5 个并发请求
    for (let i = 0; i < 5; i++) {
      promises.push(
        request.post('/api/ai-fix', {
          data: {
            content: INVALID_MERMAID_CODE,
            provider: 'auto'
          }
        })
      );
    }

    const responses = await Promise.all(promises);
    
    // 所有请求都应该成功
    for (const response of responses) {
      expect(response.ok()).toBeTruthy();
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.fixedContent).toBeTruthy();
    }
  });

  test('应该能够处理大型 Mermaid 代码', async ({ request }) => {
    // 创建一个较大的 Mermaid 代码
    const largeMermaidCode = `graph TD
      A[开始] --> B[步骤1]
      B --> C[步骤2]
      C --> D[步骤3]
      D --> E[步骤4]
      E --> F[步骤5]
      F --> G[步骤6]
      G --> H[步骤7]
      H --> I[步骤8]
      I --> J[步骤9]
      J --> K[结束]
      
      subgraph 子流程1
        L[子步骤1] --> M[子步骤2]
        M --> N[子步骤3
      end
      
      subgraph 子流程2
        O[子步骤4] --> P[子步骤5]
        P --> Q[子步骤6]
      end
      
      B --> L
      N --> O
      Q --> I`;

    const response = await request.post('/api/ai-fix', {
      data: {
        content: largeMermaidCode,
        provider: 'auto'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.fixedContent).toBeTruthy();
    expect(result.fixedContent.length).toBeGreaterThan(largeMermaidCode.length * 0.8); // 修复后的代码长度应该接近原始代码
  });
});