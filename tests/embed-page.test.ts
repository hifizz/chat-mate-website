import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { chromium, Browser, Page } from 'playwright';

describe('嵌入页面测试', () => {
  let browser: Browser;
  let page: Page;
  const baseUrl = 'http://localhost:3000';

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('应该正确加载嵌入页面', async () => {
    await page.goto(`${baseUrl}/embed`);
    
    // 检查页面标题
    const title = await page.title();
    expect(title).toBe('Mermaid Renderer');
    
    // 检查加载状态是否显示
    const loadingElement = await page.locator('#loading');
    await expect(loadingElement).toBeVisible();
    
    // 检查加载文本
    const loadingText = await page.locator('#loading p');
    await expect(loadingText).toHaveText('Waiting for Mermaid code...');
  });

  it('应该通过 URL 参数渲染图表', async () => {
    const mermaidCode = 'graph TD\n    A[开始] --> B[结束]';
    const encodedCode = encodeURIComponent(mermaidCode);
    
    await page.goto(`${baseUrl}/embed?code=${encodedCode}`);
    
    // 等待图表渲染完成
    await page.waitForSelector('#mermaid-container:not(.hidden)', { timeout: 10000 });
    
    // 检查图表容器是否可见
    const diagramContainer = await page.locator('#mermaid-container');
    await expect(diagramContainer).toBeVisible();
    
    // 检查是否有 SVG 元素
    const svgElement = await page.locator('#mermaid-diagram svg');
    await expect(svgElement).toBeVisible();
    
    // 检查渲染状态
    const statusText = await page.locator('#mermaid-container .text-slate-600');
    await expect(statusText).toHaveText('Rendered');
  });

  it('应该显示代码工具提示', async () => {
    const mermaidCode = 'graph TD\n    A[测试] --> B[完成]';
    const encodedCode = encodeURIComponent(mermaidCode);
    
    await page.goto(`${baseUrl}/embed?code=${encodedCode}`);
    
    // 等待图表渲染完成
    await page.waitForSelector('#mermaid-container:not(.hidden)', { timeout: 10000 });
    
    // 悬停在代码按钮上
    const codeButton = await page.locator('.tooltip-trigger button');
    await codeButton.hover();
    
    // 检查工具提示是否显示
    const tooltip = await page.locator('.tooltip');
    await expect(tooltip).toBeVisible();
    
    // 检查代码内容
    const codeTooltip = await page.locator('#code-tooltip');
    const codeText = await codeTooltip.textContent();
    expect(codeText).toContain('graph TD');
    expect(codeText).toContain('A[测试] --> B[完成]');
  });

  it('应该处理无效的代码参数', async () => {
    await page.goto(`${baseUrl}/embed?code=invalid-mermaid-syntax`);
    
    // 等待错误状态显示
    await page.waitForSelector('#error:not(.hidden)', { timeout: 10000 });
    
    // 检查错误容器是否可见
    const errorContainer = await page.locator('#error');
    await expect(errorContainer).toBeVisible();
    
    // 检查错误标题
    const errorTitle = await page.locator('#error h3');
    await expect(errorTitle).toHaveText('Rendering Error');
    
    // 检查是否有错误消息
    const errorMessage = await page.locator('#error-message');
    await expect(errorMessage).toBeVisible();
  });

  it('应该支持 postMessage 通信', async () => {
    await page.goto(`${baseUrl}/embed`);
    
    // 监听来自 iframe 的消息
    const messages: any[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log' && msg.text().includes('mermaid-ready')) {
        messages.push({ type: 'mermaid-ready' });
      }
    });
    
    // 发送渲染消息
    await page.evaluate(() => {
      window.postMessage({
        type: 'render-mermaid',
        code: 'graph TD\n    A[开始] --> B[结束]'
      }, '*');
    });
    
    // 等待图表渲染完成
    await page.waitForSelector('#mermaid-container:not(.hidden)', { timeout: 10000 });
    
    // 检查图表是否渲染成功
    const svgElement = await page.locator('#mermaid-diagram svg');
    await expect(svgElement).toBeVisible();
  });

  it('应该显示渲染时间', async () => {
    const mermaidCode = 'graph TD\n    A[开始] --> B[结束]';
    const encodedCode = encodeURIComponent(mermaidCode);
    
    await page.goto(`${baseUrl}/embed?code=${encodedCode}`);
    
    // 等待图表渲染完成
    await page.waitForSelector('#mermaid-container:not(.hidden)', { timeout: 10000 });
    
    // 检查渲染时间是否显示
    const renderTime = await page.locator('#render-time');
    await expect(renderTime).toBeVisible();
    
    const timeText = await renderTime.textContent();
    expect(timeText).toMatch(/\d+ms/);
  });

  it('应该支持复制代码功能', async () => {
    const mermaidCode = 'graph TD\n    A[测试复制] --> B[完成]';
    const encodedCode = encodeURIComponent(mermaidCode);
    
    await page.goto(`${baseUrl}/embed?code=${encodedCode}`);
    
    // 等待图表渲染完成
    await page.waitForSelector('#mermaid-container:not(.hidden)', { timeout: 10000 });
    
    // 悬停在代码按钮上显示工具提示
    const codeButton = await page.locator('.tooltip-trigger button');
    await codeButton.hover();
    
    // 等待工具提示显示
    await page.waitForSelector('.tooltip:not([style*="visibility: hidden"])', { timeout: 5000 });
    
    // 点击复制按钮
    const copyButton = await page.locator('.tooltip button');
    await copyButton.click();
    
    // 检查复制成功的视觉反馈（检查图标是否变为勾选）
    await page.waitForTimeout(100); // 等待图标更新
    const buttonContent = await copyButton.innerHTML();
    expect(buttonContent).toContain('M5 13l4 4L19 7'); // 勾选图标的路径
  });
});