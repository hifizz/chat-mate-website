import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';

describe('iframe 嵌入功能集成测试', () => {
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

  it('应该正确加载嵌入页面', async () => {
    await page.goto(`${baseUrl}/embed`);
    
    // 检查页面标题
    const title = await page.title();
    expect(title).toBe('Mermaid Renderer');
    
    // 检查加载状态是否显示
    const loadingElement = await page.locator('#loading');
    await expect(loadingElement).toBeVisible();
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
  });

  it('应该支持深色模式', async () => {
    const mermaidCode = 'graph TD\n    A[深色模式] --> B[测试]';
    const encodedCode = encodeURIComponent(mermaidCode);
    
    await page.goto(`${baseUrl}/embed?code=${encodedCode}&theme=dark`);
    
    // 等待图表渲染完成
    await page.waitForSelector('#mermaid-container:not(.hidden)', { timeout: 10000 });
    
    // 检查是否应用了深色模式
    const bodyElement = await page.locator('body');
    const hasClass = await bodyElement.evaluate(el => el.classList.contains('dark-mode'));
    expect(hasClass).toBe(true);
    
    // 检查主题文本
    const themeText = await page.locator('.theme-text');
    await expect(themeText).toHaveText('深色');
  });

  it('应该支持主题切换', async () => {
    const mermaidCode = 'graph TD\n    A[主题切换] --> B[测试]';
    const encodedCode = encodeURIComponent(mermaidCode);
    
    await page.goto(`${baseUrl}/embed?code=${encodedCode}`);
    
    // 等待图表渲染完成
    await page.waitForSelector('#mermaid-container:not(.hidden)', { timeout: 10000 });
    
    // 点击主题切换按钮
    await page.click('#theme-toggle');
    
    // 检查是否切换到深色模式
    const bodyElement = await page.locator('body');
    const hasClass = await bodyElement.evaluate(el => el.classList.contains('dark-mode'));
    expect(hasClass).toBe(true);
    
    // 再次点击切换回亮色模式
    await page.click('#theme-toggle');
    
    // 检查是否切换回亮色模式
    const hasClassAfterToggle = await bodyElement.evaluate(el => el.classList.contains('dark-mode'));
    expect(hasClassAfterToggle).toBe(false);
  });
});