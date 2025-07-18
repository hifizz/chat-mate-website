/**
 * 剪贴板工具函数
 * 提供跨浏览器的剪贴板操作支持
 */

/**
 * 复制文本到剪贴板
 * @param text - 要复制的文本
 * @returns Promise<boolean> - 复制是否成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        // 优先使用现代的 Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }

        // 降级到传统的 execCommand 方法
        return fallbackCopyToClipboard(text);
    } catch (error) {
        console.error('复制到剪贴板失败:', error);
        return false;
    }
};

/**
 * 降级的复制方法（兼容旧浏览器）
 * @param text - 要复制的文本
 * @returns boolean - 复制是否成功
 */
const fallbackCopyToClipboard = (text: string): boolean => {
    try {
        // 创建临时的 textarea 元素
        const textArea = document.createElement('textarea');
        textArea.value = text;

        // 设置样式，使其不可见
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.setAttribute('readonly', '');

        // 添加到 DOM
        document.body.appendChild(textArea);

        // 选择文本
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999); // 兼容移动设备

        // 执行复制命令
        const successful = document.execCommand('copy');

        // 清理
        document.body.removeChild(textArea);

        return successful;
    } catch (error) {
        console.error('降级复制方法失败:', error);
        return false;
    }
};

/**
 * 检查浏览器是否支持剪贴板 API
 * @returns boolean - 是否支持
 */
export const isClipboardSupported = (): boolean => {
    return !!(navigator.clipboard && window.isSecureContext);
};

/**
 * 检查浏览器是否支持读取剪贴板
 * @returns boolean - 是否支持
 */
export const isClipboardReadSupported = (): boolean => {
    return !!(navigator.clipboard && typeof navigator.clipboard.readText === 'function' && window.isSecureContext);
};

/**
 * 从剪贴板读取文本（如果支持）
 * @returns Promise<string | null> - 剪贴板中的文本，如果失败则返回 null
 */
export const readFromClipboard = async (): Promise<string | null> => {
    try {
        if (isClipboardReadSupported()) {
            return await navigator.clipboard.readText();
        }
        return null;
    } catch (error) {
        console.error('从剪贴板读取失败:', error);
        return null;
    }
};