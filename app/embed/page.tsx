import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mermaid Renderer - 嵌入式图表渲染器',
  description: '用于 iframe 嵌入的 Mermaid 图表渲染器',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
};

export default function EmbedPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Mermaid Renderer</title>
        <script src="https://cdn.jsdelivr.net/npm/mermaid@11.7.0/dist/mermaid.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          /* 自定义 Tooltip 样式 */
          .tooltip {
            visibility: hidden;
            opacity: 0;
            transition: opacity 0.3s, visibility 0.3s;
          }
          .tooltip-trigger:hover .tooltip {
            visibility: visible;
            opacity: 1;
          }
          /* 确保 SVG 图表响应式 */
          .mermaid-diagram svg {
            max-width: 100%;
            height: auto;
          }
          /* 深色模式样式 */
          .dark-mode {
            background-color: #1a1a1a;
            color: #e0e0e0;
          }
          .dark-mode .bg-white {
            background-color: #2a2a2a;
          }
          .dark-mode .bg-slate-50 {
            background-color: #333333;
          }
          .dark-mode .text-slate-600 {
            color: #c0c0c0;
          }
          .dark-mode .text-slate-700 {
            color: #d0d0d0;
          }
          .dark-mode .text-slate-400 {
            color: #a0a0a0;
          }
          .dark-mode .border-slate-200 {
            border-color: #444444;
          }
          .dark-mode .border-slate-300 {
            border-color: #555555;
          }
          .dark-mode .bg-slate-50 {
            background-color: #333333;
          }
          /* 缩放控制样式 */
          .zoom-controls {
            position: absolute;
            bottom: 16px;
            right: 16px;
            display: flex;
            flex-direction: column;
            background-color: rgba(255, 255, 255, 0.8);
            border-radius: 8px;
            padding: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            z-index: 10;
          }
          .dark-mode .zoom-controls {
            background-color: rgba(42, 42, 42, 0.8);
          }
          .zoom-button {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: transparent;
            cursor: pointer;
            color: #333;
            border-radius: 4px;
          }
          .dark-mode .zoom-button {
            color: #e0e0e0;
          }
          .zoom-button:hover {
            background-color: rgba(0, 0, 0, 0.1);
          }
          .dark-mode .zoom-button:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
          .zoom-level {
            font-size: 12px;
            text-align: center;
            padding: 4px 0;
          }
          /* 移动设备优化 */
          @media (max-width: 640px) {
            .zoom-controls {
              bottom: 8px;
              right: 8px;
            }
            .toolbar-buttons {
              display: flex;
              gap: 4px;
            }
          }
          /* 工具栏按钮 */
          .toolbar-button {
            display: inline-flex;
            align-items: center;
            padding: 4px 8px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            color: #475569;
            background-color: white;
            cursor: pointer;
            transition: all 0.2s;
          }
          .dark-mode .toolbar-button {
            border-color: #444444;
            color: #d0d0d0;
            background-color: #2a2a2a;
          }
          .toolbar-button:hover {
            background-color: #f8fafc;
          }
          .dark-mode .toolbar-button:hover {
            background-color: #333333;
          }
          .toolbar-button svg {
            width: 14px;
            height: 14px;
            margin-right: 4px;
          }
        `}</style>
      </head>
      <body className="bg-white m-0 p-0 h-screen overflow-hidden">
        {/* Loading State */}
        <div id="loading" className="flex flex-col items-center justify-center h-full">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-slate-600">Waiting for Mermaid code...</p>
        </div>

        {/* Error State */}
        <div id="error" className="hidden h-full flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg max-w-md w-full">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Rendering Error</h3>
                <p id="error-message" className="mt-1 text-xs text-red-700 bg-red-100 p-2 rounded font-mono"></p>
              </div>
            </div>
          </div>
        </div>

        {/* Success State with Diagram */}
        <div id="mermaid-container" className="hidden h-full flex flex-col">
          {/* Toolbar */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-600 text-sm font-medium">Rendered</span>
              <span id="render-time" className="text-slate-400 text-xs"></span>
            </div>
            {/* Toolbar Buttons */}
            <div className="toolbar-buttons flex items-center gap-2">
              {/* Theme Toggle */}
              <button id="theme-toggle" className="toolbar-button">
                <svg className="theme-icon-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg className="theme-icon-dark hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="theme-text">亮色</span>
              </button>
              
              {/* Export Button */}
              <div className="relative tooltip-trigger">
                <button id="export-button" className="toolbar-button">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>导出</span>
                </button>
                <div className="tooltip absolute top-full right-0 mt-1 w-32 z-10">
                  <div className="bg-white text-slate-800 p-2 rounded-lg shadow-xl border border-slate-200">
                    <button id="export-svg" className="block w-full text-left px-2 py-1 text-xs hover:bg-slate-100 rounded">SVG 格式</button>
                    <button id="export-png" className="block w-full text-left px-2 py-1 text-xs hover:bg-slate-100 rounded">PNG 格式</button>
                  </div>
                </div>
              </div>
              
              {/* Code Preview Button */}
              <div className="relative tooltip-trigger">
                <button className="toolbar-button">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>代码</span>
                </button>
                {/* Tooltip with Code */}
                <div className="tooltip absolute top-full right-0 mt-1 w-80 max-w-sm z-10">
                  <div className="bg-white text-slate-800 p-3 rounded-lg shadow-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-600">源代码</span>
                      <button onClick={() => (window as any).copyCode()} className="text-slate-500 hover:text-slate-700 transition-colors">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <pre id="code-tooltip" className="text-xs text-slate-700 font-mono max-h-32 overflow-auto bg-slate-50 p-2 rounded border border-slate-200"></pre>
                    <div className="absolute top-full right-3 w-0 h-0 border-l-2 border-r-2 border-b-2 border-l-transparent border-r-transparent border-b-white transform rotate-180"></div>
                  </div>
                </div>
              </div>
              
              {/* Fit to Screen Button */}
              <button id="fit-screen" className="toolbar-button">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
                <span>适应</span>
              </button>
            </div>
          </div>
          {/* Diagram Container */}
          <div className="flex-1 p-4 overflow-auto relative" id="diagram-container">
            <div id="mermaid-diagram" className="mermaid-diagram flex justify-center items-center min-h-full"></div>
            
            {/* Zoom Controls */}
            <div className="zoom-controls">
              <button id="zoom-in" className="zoom-button" title="放大">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <div id="zoom-level" className="zoom-level">100%</div>
              <button id="zoom-out" className="zoom-button" title="缩小">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" />
                </svg>
              </button>
              <button id="zoom-reset" className="zoom-button" title="重置缩放">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            // 全局变量
            let diagramId = 0;
            let currentCode = '';
            let renderStartTime = 0;
            let currentZoom = 1;
            let isDarkMode = false;
            let currentTheme = 'default';
            let svgContent = '';
            
            // 检查系统主题偏好
            const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            // 检查 URL 参数中的主题设置
            const urlParams = new URLSearchParams(window.location.search);
            const themeParam = urlParams.get('theme');
            
            // 设置初始主题
            if (themeParam === 'dark') {
              isDarkMode = true;
              currentTheme = 'dark';
            } else if (prefersDarkMode) {
              isDarkMode = true;
              currentTheme = 'dark';
            }
            
            // 应用主题
            if (isDarkMode) {
              document.body.classList.add('dark-mode');
              document.querySelector('.theme-icon-light').classList.add('hidden');
              document.querySelector('.theme-icon-dark').classList.remove('hidden');
              document.querySelector('.theme-text').textContent = '深色';
            }
            
            // Initialize Mermaid
            mermaid.initialize({
              startOnLoad: false,
              securityLevel: 'loose',
              theme: currentTheme,
              themeVariables: {
                primaryColor: '#3b82f6',
                primaryTextColor: isDarkMode ? '#e0e0e0' : '#1e293b',
                primaryBorderColor: isDarkMode ? '#555555' : '#e2e8f0',
                lineColor: isDarkMode ? '#a0a0a0' : '#64748b',
                secondaryColor: isDarkMode ? '#333333' : '#f1f5f9',
                tertiaryColor: isDarkMode ? '#2a2a2a' : '#f8fafc'
              }
            });

            function showError(message) {
              document.getElementById('loading').classList.add('hidden');
              document.getElementById('mermaid-container').classList.add('hidden');
              document.getElementById('error').classList.remove('hidden');
              document.getElementById('error-message').textContent = message;
            }

            function showLoading() {
              document.getElementById('loading').classList.remove('hidden');
              document.getElementById('error').classList.add('hidden');
              document.getElementById('mermaid-container').classList.add('hidden');
            }

            function showDiagram() {
              document.getElementById('loading').classList.add('hidden');
              document.getElementById('error').classList.add('hidden');
              document.getElementById('mermaid-container').classList.remove('hidden');
              // Update render time
              const renderTime = Date.now() - renderStartTime;
              document.getElementById('render-time').textContent = renderTime + 'ms';
            }

            window.copyCode = function() {
              try {
                // Try modern clipboard API first
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(currentCode).then(() => {
                    showCopySuccess();
                  }).catch(() => {
                    fallbackCopy();
                  });
                } else {
                  fallbackCopy();
                }
              } catch (error) {
                fallbackCopy();
              }
            }

            function fallbackCopy() {
              try {
                // Create a temporary textarea element
                const textarea = document.createElement('textarea');
                textarea.value = currentCode;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showCopySuccess();
              } catch (error) {
                console.error('Copy failed:', error);
                showCopyError();
              }
            }

            function showCopySuccess() {
              // Show brief success feedback
              const button = event.target.closest('button');
              const originalHTML = button.innerHTML;
              button.innerHTML = '<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
              setTimeout(() => {
                button.innerHTML = originalHTML;
              }, 1000);
            }

            function showCopyError() {
              // Show error feedback
              const button = event.target.closest('button');
              const originalHTML = button.innerHTML;
              button.innerHTML = '<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
              setTimeout(() => {
                button.innerHTML = originalHTML;
              }, 1500);
            }

            async function renderMermaid(code) {
              try {
                renderStartTime = Date.now();
                currentCode = code;
                showLoading();

                // Update code tooltip
                document.getElementById('code-tooltip').textContent = code;

                // Generate unique ID for this diagram
                const currentId = 'mermaid-' + (diagramId++);

                // Render the diagram
                const { svg } = await mermaid.render(currentId, code);

                // Display the rendered diagram
                document.getElementById('mermaid-diagram').innerHTML = svg;
                showDiagram();

                // Send success message back to parent
                if (window.parent !== window) {
                  window.parent.postMessage({
                    type: 'mermaid-rendered',
                    success: true
                  }, '*');
                }
              } catch (error) {
                console.error('Mermaid rendering error:', error);
                showError(error.message || 'Failed to render diagram');

                // Send error message back to parent
                if (window.parent !== window) {
                  window.parent.postMessage({
                    type: 'mermaid-rendered',
                    success: false,
                    error: error.message
                  }, '*');
                }
              }
            }

            // Listen for messages from parent window
            window.addEventListener('message', function(event) {
              if (event.data && event.data.type === 'render-mermaid') {
                renderMermaid(event.data.code);
              }
            });

            // Also check URL parameters for code (fallback method)
            const urlParams = new URLSearchParams(window.location.search);
            const codeFromUrl = urlParams.get('code');
            if (codeFromUrl) {
              try {
                const decodedCode = decodeURIComponent(codeFromUrl);
                renderMermaid(decodedCode);
              } catch (e) {
                showError('Invalid code in URL parameter');
              }
            }

            // 缩放控制功能
            function initZoomControls() {
              const zoomIn = document.getElementById('zoom-in');
              const zoomOut = document.getElementById('zoom-out');
              const zoomReset = document.getElementById('zoom-reset');
              const zoomLevel = document.getElementById('zoom-level');
              const diagramContainer = document.getElementById('diagram-container');
              const mermaidDiagram = document.getElementById('mermaid-diagram');
              
              // 更新缩放级别显示
              function updateZoomLevel() {
                zoomLevel.textContent = Math.round(currentZoom * 100) + '%';
                mermaidDiagram.style.transform = `scale(${currentZoom})`;
              }
              
              // 放大
              zoomIn.addEventListener('click', () => {
                if (currentZoom < 3) {
                  currentZoom += 0.1;
                  updateZoomLevel();
                }
              });
              
              // 缩小
              zoomOut.addEventListener('click', () => {
                if (currentZoom > 0.3) {
                  currentZoom -= 0.1;
                  updateZoomLevel();
                }
              });
              
              // 重置缩放
              zoomReset.addEventListener('click', () => {
                currentZoom = 1;
                updateZoomLevel();
              });
              
              // 鼠标滚轮缩放
              diagramContainer.addEventListener('wheel', (e) => {
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault();
                  const delta = e.deltaY > 0 ? -0.1 : 0.1;
                  currentZoom = Math.max(0.3, Math.min(3, currentZoom + delta));
                  updateZoomLevel();
                }
              });
              
              // 适应屏幕
              document.getElementById('fit-screen').addEventListener('click', () => {
                currentZoom = 1;
                updateZoomLevel();
              });
            }
            
            // 主题切换功能
            function initThemeToggle() {
              const themeToggle = document.getElementById('theme-toggle');
              const lightIcon = document.querySelector('.theme-icon-light');
              const darkIcon = document.querySelector('.theme-icon-dark');
              const themeText = document.querySelector('.theme-text');
              
              themeToggle.addEventListener('click', () => {
                isDarkMode = !isDarkMode;
                
                // 更新 UI
                if (isDarkMode) {
                  document.body.classList.add('dark-mode');
                  lightIcon.classList.add('hidden');
                  darkIcon.classList.remove('hidden');
                  themeText.textContent = '深色';
                  currentTheme = 'dark';
                } else {
                  document.body.classList.remove('dark-mode');
                  lightIcon.classList.remove('hidden');
                  darkIcon.classList.add('hidden');
                  themeText.textContent = '亮色';
                  currentTheme = 'default';
                }
                
                // 重新渲染图表
                renderMermaid(currentCode);
              });
            }
            
            // 导出功能
            function initExportButtons() {
              const exportSvg = document.getElementById('export-svg');
              const exportPng = document.getElementById('export-png');
              
              // 导出 SVG
              exportSvg.addEventListener('click', () => {
                if (!svgContent) return;
                
                const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'mermaid-diagram.svg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              });
              
              // 导出 PNG
              exportPng.addEventListener('click', () => {
                if (!svgContent) return;
                
                const svgElement = document.querySelector('#mermaid-diagram svg');
                if (!svgElement) return;
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const rect = svgElement.getBoundingClientRect();
                
                canvas.width = rect.width;
                canvas.height = rect.height;
                
                // 创建 Image 对象
                const img = new Image();
                img.onload = function() {
                  // 填充白色背景（或深色模式下的深色背景）
                  ctx.fillStyle = isDarkMode ? '#1a1a1a' : '#ffffff';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  
                  // 绘制 SVG
                  ctx.drawImage(img, 0, 0);
                  
                  // 导出为 PNG
                  const pngUrl = canvas.toDataURL('image/png');
                  const a = document.createElement('a');
                  a.href = pngUrl;
                  a.download = 'mermaid-diagram.png';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                };
                
                // 将 SVG 转换为 Data URL
                const svgData = new XMLSerializer().serializeToString(svgElement);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const svgUrl = URL.createObjectURL(svgBlob);
                
                img.src = svgUrl;
              });
            }
            
            // 在渲染完成后初始化所有控件
            function initControls() {
              initZoomControls();
              initThemeToggle();
              initExportButtons();
            }
            
            // 修改 renderMermaid 函数，保存 SVG 内容
            async function renderMermaid(code) {
              try {
                renderStartTime = Date.now();
                currentCode = code;
                showLoading();

                // Update code tooltip
                document.getElementById('code-tooltip').textContent = code;

                // 更新 Mermaid 配置
                mermaid.initialize({
                  startOnLoad: false,
                  securityLevel: 'loose',
                  theme: currentTheme,
                  themeVariables: {
                    primaryColor: '#3b82f6',
                    primaryTextColor: isDarkMode ? '#e0e0e0' : '#1e293b',
                    primaryBorderColor: isDarkMode ? '#555555' : '#e2e8f0',
                    lineColor: isDarkMode ? '#a0a0a0' : '#64748b',
                    secondaryColor: isDarkMode ? '#333333' : '#f1f5f9',
                    tertiaryColor: isDarkMode ? '#2a2a2a' : '#f8fafc'
                  }
                });

                // Generate unique ID for this diagram
                const currentId = 'mermaid-' + (diagramId++);

                // Render the diagram
                const { svg } = await mermaid.render(currentId, code);
                
                // 保存 SVG 内容
                svgContent = svg;

                // Display the rendered diagram
                document.getElementById('mermaid-diagram').innerHTML = svg;
                showDiagram();
                
                // 初始化控件（如果是首次渲染）
                if (diagramId === 1) {
                  initControls();
                }

                // Send success message back to parent
                if (window.parent !== window) {
                  window.parent.postMessage({
                    type: 'mermaid-rendered',
                    success: true
                  }, '*');
                }
              } catch (error) {
                console.error('Mermaid rendering error:', error);
                showError(error.message || 'Failed to render diagram');

                // Send error message back to parent
                if (window.parent !== window) {
                  window.parent.postMessage({
                    type: 'mermaid-rendered',
                    success: false,
                    error: error.message
                  }, '*');
                }
              }
            }
            
            // Send ready message to parent
            if (window.parent !== window) {
              window.parent.postMessage({
                type: 'mermaid-ready'
              }, '*');
            }
          `
        }} />
      </body>
    </html>
  );
}