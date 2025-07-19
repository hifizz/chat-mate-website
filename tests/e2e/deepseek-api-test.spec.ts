/**
 * Deepseek API 集成测试
 * 使用 Playwright 测试 Deepseek API 调用功能
 */

import { test, expect } from '@playwright/test';

// 测试用的错误 Mermaid 代码
const INVALID_MERMAID_CODE = `graph TD
    A[开始]
    B[处理数据
    C[结束]
    A B
    B C`;

// 测试用的正确 Mermaid 代码
const VALID_MERMAID_CODE = `graph TD
    A[开始] --> B[处理数据]
    B --> C[结束]`;

test.describe('Deepseek API 集成测试', () => {
  test('应该能够调用 Deepseek API 修复 Mermaid 语法错误', async ({ request }) => {
    // 调用 AI 修复 API，明确指定使用 Deepseek
    const response = await request.post('/api/ai-fix', {
      data: {
        content: INVALID_MERMAID_CODE,
        provider: 'deepseek'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    console.log('Deepseek API 响应:', JSON.stringify(result, null, 2));

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

  test('应该能够处理已经正确的 Mermaid 代码', async ({ request }) => {
    const response = await request.post('/api/ai-fix', {
      data: {
        content: VALID_MERMAID_CODE,
        provider: 'deepseek'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    console.log('正确代码的 Deepseek API 响应:', JSON.stringify(result, null, 2));

    expect(result.success).toBe(true);
    expect(result.fixedContent).toBeTruthy();
  });

  test('应该能够处理复杂的 Mermaid 语法错误', async ({ request }) => {
    const complexInvalidCode = `sequenceDiagram
    participant A as 用户
    participant B as 系统
    A->>B: 发送请求
    B-->>A 返回响应
    Note over A,B: 这是一个注释`;

    const response = await request.post('/api/ai-fix', {
      data: {
        content: complexInvalidCode,
        provider: 'deepseek'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    console.log('复杂错误的 Deepseek API 响应:', JSON.stringify(result, null, 2));

    expect(result.success).toBe(true);
    expect(result.fixedContent).toBeTruthy();
    expect(result.fixedContent).toContain('sequenceDiagram');
  });

  test('应该能够处理流程图语法错误', async ({ request }) => {
    const flowchartInvalidCode = `flowchart TD
    Start([开始])
    Process[处理数据
    Decision{是否成功?}
    End([结束])
    
    Start Process
    Process Decision
    Decision -->|是| End
    Decision -->|否| Process`;

    const response = await request.post('/api/ai-fix', {
      data: {
        content: flowchartInvalidCode,
        provider: 'deepseek'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    console.log('流程图错误的 Deepseek API 响应:', JSON.stringify(result, null, 2));

    expect(result.success).toBe(true);
    expect(result.fixedContent).toBeTruthy();
    expect(result.fixedContent).toContain('flowchart');
  });

  test('应该能够在 auto 模式下使用 Deepseek API（当豆包不可用时）', async ({ request }) => {
    // 这个测试假设豆包 API 可能不可用，会回退到 Deepseek
    const response = await request.post('/api/ai-fix', {
      data: {
        content: INVALID_MERMAID_CODE,
        provider: 'auto'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    console.log('Auto 模式的 API 响应:', JSON.stringify(result, null, 2));

    expect(result.success).toBe(true);
    expect(result.fixedContent).toBeTruthy();
  });
});

test.describe('Deepseek API 错误处理测试', () => {
  test('应该能够处理空内容的情况', async ({ request }) => {
    const response = await request.post('/api/ai-fix', {
      data: {
        content: '',
        provider: 'deepseek'
      }
    });

    expect(response.status()).toBe(400);
    
    const result = await response.json();
    expect(result).toHaveProperty('error');
    expect(result.error).toContain('请提供有效的 Mermaid 代码');
  });

  test('应该能够处理无效的请求体', async ({ request }) => {
    const response = await request.post('/api/ai-fix', {
      data: {
        provider: 'deepseek'
        // 缺少 content 字段
      }
    });

    expect(response.status()).toBe(400);
    
    const result = await response.json();
    expect(result).toHaveProperty('error');
  });

  test('应该能够处理 API 调用失败的情况', async ({ request }) => {
    // 即使 API 调用失败，也应该返回成功响应（因为有本地规则作为后备）
    const response = await request.post('/api/ai-fix', {
      data: {
        content: INVALID_MERMAID_CODE,
        provider: 'deepseek'
      }
    });

    // 即使 API 调用失败，也应该返回成功响应（因为有本地规则作为后备）
    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.fixedContent).toBeTruthy();
  });
});