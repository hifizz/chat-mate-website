import { ExportOptions } from '@/types';
import html2canvas from 'html2canvas';

/**
 * 导出 SVG 格式图表
 * @param svgElement - SVG 元素
 * @param filename - 文件名
 */
export const exportAsSVG = (svgElement: SVGElement, filename: string = 'mermaid-chart'): void => {
  try {
    // 获取 SVG 内容
    const svgData = new XMLSerializer().serializeToString(svgElement);
    
    // 创建 Blob
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    
    // 触发下载
    downloadFile(url, `${filename}.svg`);
    
    // 释放 URL 对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('导出 SVG 失败:', error);
    throw new Error('导出 SVG 失败');
  }
};

/**
 * 导出 PNG 格式图表
 * @param element - 包含图表的 DOM 元素
 * @param filename - 文件名
 * @param options - 导出选项
 */
export const exportAsPNG = async (
  element: HTMLElement, 
  filename: string = 'mermaid-chart',
  options?: Partial<ExportOptions>
): Promise<void> => {
  try {
    // 使用 html2canvas 将元素转换为 canvas
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: options?.scale || window.devicePixelRatio || 2,
      logging: false,
      allowTaint: true,
      useCORS: true
    });
    
    // 获取 canvas 数据 URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // 触发下载
    downloadFile(dataUrl, `${filename}.png`);
  } catch (error) {
    console.error('导出 PNG 失败:', error);
    throw new Error('导出 PNG 失败');
  }
};

/**
 * 导出 JPG 格式图表
 * @param element - 包含图表的 DOM 元素
 * @param filename - 文件名
 * @param options - 导出选项
 */
export const exportAsJPG = async (
  element: HTMLElement, 
  filename: string = 'mermaid-chart',
  options?: Partial<ExportOptions>
): Promise<void> => {
  try {
    // 使用 html2canvas 将元素转换为 canvas
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff', // JPG 不支持透明背景，使用白色背景
      scale: options?.scale || window.devicePixelRatio || 2,
      logging: false,
      allowTaint: true,
      useCORS: true
    });
    
    // 获取 canvas 数据 URL，设置 JPG 质量
    const quality = options?.quality !== undefined ? options.quality / 100 : 0.9;
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    
    // 触发下载
    downloadFile(dataUrl, `${filename}.jpg`);
  } catch (error) {
    console.error('导出 JPG 失败:', error);
    throw new Error('导出 JPG 失败');
  }
};

/**
 * 触发文件下载
 * @param url - 文件 URL
 * @param filename - 文件名
 */
const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};