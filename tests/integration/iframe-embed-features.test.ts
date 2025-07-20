import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';

describe('iframe 嵌入功能特性测试', () => {
  let browser: Browser;
  let page: Page;
  const baseUrl = 'http://localhost:3000';

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('应该支持缩放控制', async () => {
    const mermaidCode = 'graph TD\n    A[缩放控制] --> B[测试]';
    const encodedCode = encodeURIComponent(mermaidCode);
    
    await page.goto(`${baseUrl}/embed?code=${encodedCode}`);
    
    // 等待图表渲染完成
    await page.waitForSelector('#mermaid-container:not(.hidden)', { timeout: 10000 });
    
    // 获取初始缩放级别
    const initialZoomText = await page.locator('#zoom-level').textContent();
    expect(initialZoomText).toBe('100%');
    
    // 点击放大按钮
    await page.click('#zoom-in');
    
    // 检查缩放级别是否更新
    const zoomAfterIn = await page.locator('#zoom-level').textContent();
    expect(zoomAfterIn).toBe('110%');
    
    // 点击缩小按钮
    await page.click('#zoom-out');
    
    // 检查缩放级别是否更新
    const zoomAfterOut = await page.locator('#zoom-level').textContent();
    expect(zoomAfterOut).toBe('100%');
    
    // 点击重置按钮
    await page.click('#zoom-reset');
    
    // 检查缩放级别是否重置
    const zoomAfterReset = await page.locator('#zoom-level').textContent();
    expect(zoomAfterReset).toBe('100%');
  });

  it('应该支持导出功能', async () => {
    const mermaidCode = 'graph TD\n    A[导出功能] --> B[测试]';
    const encodedCode = encodeURIComponent(mermaidCode);
    
    await page.goto(`${baseUrl}/embed?code=${encodedCode}`);
    
    // 等待图表渲染完成
    await page.waitForSelector('#mermaid-container:not(.hidden)', { timeout: 10000 });
    
    // 悬停在导出按钮上
    await page.hover('#export-button');
    
    // 检查导出选项是否显示
    const exportOptions = await page.locator('#export-svg').isVisible();
    expect(exportOptions).toBe(true);
    
    // 检查 SVG 和 PNG 选项是否存在
    const svgOption = await page.locator('#export-svg');
    await expect(svgOption).toBeVisible();
    
    const pngOption = await page.locator('#export-png');
    await expect(pngOption).toBeVisible();
  });

  it('应该处理错误情况', async () => {
    const invalidCode = 'invalid mermaid code';
    const encodedCode = encodeURIComponent(invalidCode);
    
    await page.goto(`${baseUrl}/embed?code=${encodedCode}`);
    
    // 等待错误显示
    await page.waitForSelector('#error:not(.hidden)', { timeout: 10000 });
    
    // 检查错误容器是否可见
    const errorContainer = await page.locator('#error');
    await expect(errorContainer).toBeVisible();
    
    // 检查错误标题
    const errorTitle = await page.locator('#error h3');
    await expect(errorTitle).toHaveText('Rendering Error');
  });

  it('应该支持 iframe 嵌入', async () => {
    // 创建一个包含 iframe 的测试页面
    const iframeTestHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>iframe 测试</title>
      </head>
      <body>
        <h1>iframe 嵌入测试</h1>
        <iframe id="mermaid-iframe" src="${baseUrl}/embed?code=${encodeURIComponent('graph TD\n    A[iframe测试] --> B[成功]')}" width="800" height="600" frameborder="0"></iframe>
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
  });

  it('应该支持 postMessage 通信', async () => {
    await page.goto(`${baseUrl}/embed`);
    
    // 设置消息监听器
    await page.evaluate(() => {
      window.testMessages = [];
      window.addEventListener('message', (event) => {
        if (event.data && (event.data.type === 'mermaid-ready' || event.data.type === 'mermaid-rendered')) {
          window.testMessages.push(event.data);
        }
      });
    });
    
    // 发送渲染消息
    await page.evaluate(() => {
      window.postMessage({
        type: 'render-mermaid',
        code: 'graph TD\n    A[postMessage测试] --> B[成功]'
      }, '*');
    });
    
    // 等待一段时间让消息处理完成
    await page.waitForTimeout(1000);
    
    // 检查是否收到渲染成功消息
    const messages = await page.evaluate(() => window.testMessages);
    expect(messages.some(msg => msg.type === 'mermaid-rendered' && msg.success === true)).toBe(true);
    
    // 检查图表是否渲染成功
    const diagramContainer = await page.locator('#mermaid-container');
    await expect(diagramContainer).toBeVisible();
  });
});