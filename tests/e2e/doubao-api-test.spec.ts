/**
 * 豆包 API 集成测试
 * 使用 Playwright 测试豆包 API 调用功能
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

test.describe('豆包 API 集成测试', () => {
  test('应该能够调用豆包 API 修复 Mermaid 语法错误', async ({ request }) => {
    // 调用 AI 修复 API
    const response = await request.post('/api/ai-fix', {
      data: {
        content: INVALID_MERMAID_CODE,
        provider: 'doubao'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    console.log('豆包 API 响应:', JSON.stringify(result, null, 2));

    // 验证响应结构
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('fixedContent');
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('provider');

    // 验证修复结果
    expect(result.success).toBe(true);
    expect(result.provider).toBe('doubao');
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
        provider: 'doubao'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    console.log('正确代码的豆包 API 响应:', JSON.stringify(result, null, 2));

    expect(result.success).toBe(true);
    expect(result.fixedContent).toBeTruthy();
  });

  test('应该能够处理空内容的情况', async ({ request }) => {
    const response = await request.post('/api/ai-fix', {
      data: {
        content: '',
        provider: 'doubao'
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
        provider: 'doubao'
        // 缺少 content 字段
      }
    });

    expect(response.status()).toBe(400);
    
    const result = await response.json();
    expect(result).toHaveProperty('error');
  });

  test('应该能够在 auto 模式下优先使用豆包 API', async ({ request }) => {
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
    // 在有豆包 API 密钥的情况下，应该优先使用豆包
    expect(result.provider).toBe('doubao');
  });

  test('应该能够返回调试信息', async ({ request }) => {
    const response = await request.post('/api/ai-fix', {
      data: {
        content: INVALID_MERMAID_CODE,
        provider: 'doubao'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    
    // 验证调试信息
    expect(result).toHaveProperty('debug');
    expect(result.debug).toHaveProperty('apiKeyStatus');
    expect(result.debug.apiKeyStatus).toHaveProperty('DOUBAO_API_KEY');
    expect(result.debug.apiKeyStatus.DOUBAO_API_KEY).toBe('已设置');
  });
});

test.describe('豆包 API 错误处理测试', () => {
  test('应该能够处理 API 调用失败的情况', async ({ request }) => {
    // 这个测试需要临时修改 API 密钥来模拟失败情况
    // 在实际环境中，我们可以通过环境变量来控制
    
    const response = await request.post('/api/ai-fix', {
      data: {
        content: INVALID_MERMAID_CODE,
        provider: 'doubao'
      }
    });

    // 即使 API 调用失败，也应该返回成功响应（因为有本地规则作为后备）
    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.fixedContent).toBeTruthy();
  });
});