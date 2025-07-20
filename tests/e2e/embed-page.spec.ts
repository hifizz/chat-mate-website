import { test, expect } from '@playwright/test';

test.describe('嵌入页面测试', () => {
  test('应该正确加载嵌入页面', async ({ page }) => {
    await page.goto('/embed');
    
    // 检查页面标题
    await expect(page).toHaveTitle('Mermaid Renderer');
    
    // 检查加载状态是否显示
    const loadingElement = page.locator('#loading');
    await expect(loadingElement).toBeVisible();
    
    // 检查加载文本
    const loadingText = page.locator('#loading p');
    await expect(loadingText).toHaveText('Waiting for Mermaid code...');
  });

  test('应该通过 URL 参数渲染图表', async ({ page }) => {
    const mermaidCode = 'graph TD\n    A[开始] --> B[结束]';
    const encodedCode = encodeURIComponent(mermaidCode);
    
    await page.goto(`/embed?code=${encodedCode}`);
    
    // 等待图表渲染完成
    await page.waitForSelector('#mermaid-container:not(.hidden)', { timeout: 10000 });
    
    // 检查图表容器是否可见
    const diagramContainer = page.locator('#mermaid-container');
    await expect(diagramContainer).toBeVisible();
    
    // 检查是否有 SVG 元素
    const svgElement = page.locator('#mermaid-diagram svg');
    await expect(svgElement).toBeVisible();
    
    // 检查渲染状态
    const statusText = page.locator('#mermaid-container .text-slate-600');
    await expect(statusText).toHaveText('Rendered');
  });

  test('应该显示代码工具提示', async ({ page }) => {
    const mermaidCode = 'graph TD\n    A[测试] --> B[完成]';
    const encodedCode = encodeURIComponent(mermaidCode);
    
    await page.goto(`/embed?code=${encodedCode}`);
    
    // 等待图表渲染完成
    await page.waitForSelector('#mermaid-container:not(.hidden)', { timeout: 10000 });
    
    // 悬停在代码按钮上
    const codeButton = page.locator('.tooltip-trigger button');
    await codeButton.hover();
    
    // 检查工具提示是否显示
    const tooltip = page.locator('.tooltip');
    await expect(tooltip).toBeVisible();
    
    // 检查代码内容
    const codeTooltip = page.locator('#code-tooltip');
    const codeText = await codeTooltip.textContent();
    expect(codeText).toContain('graph TD');
    expect(codeText).toContain('A[测试] --> B[完成]');
  });

  test('应该处理无效的代码参数', async ({ page }) => {
    await page.goto('/embed?code=invalid-mermaid-syntax');
    
    // 等待错误状态显示
    await page.waitForSelector('#error:not(.hidden)', { timeout: 10000 });
    
    // 检查错误容器是否可见
    const errorContainer = page.locator('#error');
    await expect(errorContainer).toBeVisible();
    
    // 检查错误标题
    const errorTitle = page.locator('#error h3');
    await expect(errorTitle).toHaveText('Rendering Error');
    
    // 检查是否有错误消息
    const errorMessage = page.locator('#error-message');
    await expect(errorMessage).toBeVisible();
  });

  test('应该显示渲染时间', async ({ page }) => {
    const mermaidCode = 'graph TD\n    A[开始] --> B[结束]';
    const encodedCode = encodeURIComponent(mermaidCode);
    
    await page.goto(`/embed?code=${encodedCode}`);
    
    // 等待图表渲染完成
    await page.waitForSelector('#mermaid-container:not(.hidden)', { timeout: 10000 });
    
    // 检查渲染时间是否显示
    const renderTime = page.locator('#render-time');
    await expect(renderTime).toBeVisible();
    
    const timeText = await renderTime.textContent();
    expect(timeText).toMatch(/\d+ms/);
  });

  test('应该支持复制代码功能', async ({ page }) => {
    const mermaidCode = 'graph TD\n    A[测试复制] --> B[完成]';
    const encodedCode = encodeURIComponent(mermaidCode);
    
    await page.goto(`/embed?code=${encodedCode}`);
    
    // 等待图表渲染完成
    await page.waitForSelector('#mermaid-container:not(.hidden)', { timeout: 10000 });
    
    // 悬停在代码按钮上显示工具提示
    const codeButton = page.locator('.tooltip-trigger button');
    await codeButton.hover();
    
    // 等待工具提示显示
    await page.waitForSelector('.tooltip:not([style*="visibility: hidden"])', { timeout: 5000 });
    
    // 点击复制按钮
    const copyButton = page.locator('.tooltip button');
    await copyButton.click();
    
    // 检查复制成功的视觉反馈（检查图标是否变为勾选）
    await page.waitForTimeout(1000); // 等待图标更新
    const buttonContent = await copyButton.innerHTML();
    expect(buttonContent).toContain('M5 13l4 4L19 7'); // 勾选图标的路径
  });

  test('应该支持 iframe 嵌入', async ({ page }) => {
    // 创建一个包含 iframe 的测试页面
    const iframeTestHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>iframe 测试</title>
      </head>
      <body>
        <h1>iframe 嵌入测试</h1>
        <iframe id="mermaid-iframe" src="/embed?code=${encodeURIComponent('graph TD\n    A[iframe测试] --> B[成功]')}" width="800" height="600" frameborder="0"></iframe>
      </body>
      </html>
    `;
    
    // 设置页面内容
    await page.setContent(iframeTestHtml);
    
    // 等待 iframe 加载
    const iframe = page.frameLocator('#mermaid-iframe');
    
    // 检查 iframe 内的图表是否渲染成功
    await iframe.locator('#mermaid-container:not(.hidden)').waitFor({ timeout: 10000 });
    
    // 检查 iframe 内的 SVG 元素
    const svgElement = iframe.locator('#mermaid-diagram svg');
    await expect(svgElement).toBeVisible();
    
    // 检查 iframe 内的渲染状态
    const statusText = iframe.locator('#mermaid-container .text-slate-600');
    await expect(statusText).toHaveText('Rendered');
  });
});