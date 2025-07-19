# Requirements Document

## Introduction

本功能旨在创建一个 Mermaid 图表展示网页，支持通过 URL 参数接收压缩编码的 Mermaid 内容，并提供完整的图表查看、编辑和分享功能。该网页可以被其他网站通过 iframe 嵌入，为用户提供便捷的 Mermaid 图表展示服务。此外，系统还将提供一个交互式的 Playground 页面，让用户能够直接编辑 Mermaid 代码并实时查看渲染结果。

## Requirements

### Requirement 1

**User Story:** 作为一个网站开发者，我希望能够通过 iframe 嵌入 Mermaid 图表展示页面，这样我可以在我的网站中展示动态的 Mermaid 图表内容。

#### Acceptance Criteria

1. WHEN 用户访问 `https://example.com/mermaid.html?pako:[encoded_content]` THEN 系统 SHALL 解析 URL 参数中的 pako 编码内容
2. WHEN 系统接收到编码内容 THEN 系统 SHALL 解码 pako 压缩的 Mermaid 内容
3. WHEN 解码成功 THEN 系统 SHALL 使用 Mermaid 库渲染图表到页面中
4. WHEN 页面被 iframe 嵌入 THEN 系统 SHALL 正常显示图表内容
5. IF 解码失败或内容无效 THEN 系统 SHALL 显示友好的错误提示信息

### Requirement 2

**User Story:** 作为用户，我希望能够通过触控板和鼠标对 Mermaid 图表进行缩放操作，这样我可以更好地查看图表的细节。

#### Acceptance Criteria

1. WHEN 用户使用鼠标滚轮 THEN 系统 SHALL 支持图表的放大和缩小
2. WHEN 用户使用触控板双指缩放手势 THEN 系统 SHALL 支持图表的放大和缩小
3. WHEN 用户进行缩放操作 THEN 系统 SHALL 保持图表的中心点位置
4. WHEN 图表被缩放 THEN 系统 SHALL 提供平滑的缩放动画效果
5. WHEN 图表达到最大或最小缩放比例 THEN 系统 SHALL 限制进一步的缩放操作

### Requirement 3

**User Story:** 作为用户，我希望能够将 Mermaid 图表导出为不同格式的图片，这样我可以在其他地方使用这些图表。

#### Acceptance Criteria

1. WHEN 用户点击导出按钮 THEN 系统 SHALL 提供 SVG、PNG、JPG 三种格式选项
2. WHEN 用户选择 SVG 格式 THEN 系统 SHALL 生成矢量格式的图片文件
3. WHEN 用户选择 PNG 格式 THEN 系统 SHALL 生成高质量的 PNG 图片文件
4. WHEN 用户选择 JPG 格式 THEN 系统 SHALL 生成压缩的 JPG 图片文件
5. WHEN 导出完成 THEN 系统 SHALL 自动下载生成的图片文件

### Requirement 4

**User Story:** 作为用户，我希望能够复制原始的 Mermaid 源代码，这样我可以在其他地方使用或编辑这些代码。

#### Acceptance Criteria

1. WHEN 用户点击复制源码按钮 THEN 系统 SHALL 将解码后的 Mermaid 源代码复制到剪贴板
2. WHEN 复制操作成功 THEN 系统 SHALL 显示复制成功的提示信息
3. WHEN 复制操作失败 THEN 系统 SHALL 显示复制失败的错误信息
4. WHEN 浏览器不支持剪贴板 API THEN 系统 SHALL 提供文本选择框供用户手动复制

### Requirement 5

**User Story:** 作为用户，我希望能够选择不同的 Mermaid 主题来预览图表，这样我可以找到最适合的视觉效果。

#### Acceptance Criteria

1. WHEN 用户打开主题选择器 THEN 系统 SHALL 显示所有可用的 Mermaid 主题选项
2. WHEN 用户选择不同主题 THEN 系统 SHALL 实时更新图表的显示效果
3. WHEN 主题切换完成 THEN 系统 SHALL 保存用户的主题偏好设置
4. WHEN 用户重新访问页面 THEN 系统 SHALL 应用之前保存的主题设置
5. IF 主题应用失败 THEN 系统 SHALL 回退到默认主题

### Requirement 6

**User Story:** 作为用户，我希望能够使用 AI 来修复 Mermaid 语法错误，这样我可以快速解决图表显示问题。

#### Acceptance Criteria

1. WHEN 用户点击 AI 修复按钮 THEN 系统 SHALL 连接到 Deepseek 或豆包大模型 API
2. WHEN AI 分析完成 THEN 系统 SHALL 提供修复建议或修正后的 Mermaid 代码
3. WHEN 用户接受 AI 修复建议 THEN 系统 SHALL 应用修正后的代码并重新渲染图表
4. WHEN AI 服务不可用 THEN 系统 SHALL 显示服务不可用的提示信息
5. IF Mermaid 代码语法正确 THEN 系统 SHALL 提示无需修复

### Requirement 7

**User Story:** 作为用户，我希望能够分享我的 Mermaid 图表，这样其他人也可以查看相同的图表内容。

#### Acceptance Criteria

1. WHEN 用户点击分享按钮 THEN 系统 SHALL 生成包含当前图表内容的分享链接
2. WHEN 分享链接生成 THEN 系统 SHALL 将链接复制到剪贴板
3. WHEN 其他用户访问分享链接 THEN 系统 SHALL 显示相同的图表内容和设置
4. WHEN 分享链接过长 THEN 系统 SHALL 提供短链接服务
5. WHEN 用户分享成功 THEN 系统 SHALL 显示分享成功的确认信息

### Requirement 8

**User Story:** 作为用户，我希望网页支持深色模式，这样我可以在不同的环境光线下舒适地使用。

#### Acceptance Criteria

1. WHEN 用户访问页面 THEN 系统 SHALL 检测用户的系统主题偏好
2. WHEN 系统检测到深色模式偏好 THEN 系统 SHALL 自动应用深色主题
3. WHEN 用户手动切换主题模式 THEN 系统 SHALL 在浅色和深色模式之间切换
4. WHEN 主题模式切换 THEN 系统 SHALL 同步更新所有 UI 元素的颜色方案
5. WHEN 用户设置主题偏好 THEN 系统 SHALL 保存设置供下次访问使用### R
equirement 9

**User Story:** 作为用户，我希望有一个交互式的 Playground 页面，这样我可以直接编辑 Mermaid 代码并实时查看渲染结果。

#### Acceptance Criteria

1. WHEN 用户访问 Playground 页面 THEN 系统 SHALL 显示分为左右两栏的界面，左侧为编辑区，右侧为预览区
2. WHEN 用户在左侧编辑区输入 Mermaid 代码 THEN 系统 SHALL 在右侧实时渲染更新后的图表
3. WHEN 用户在编辑区修改代码 THEN 系统 SHALL 提供语法高亮功能以提高代码可读性
4. WHEN 用户点击 AI 修复按钮 THEN 系统 SHALL 分析当前代码并提供修复建议
5. WHEN 编辑区的代码存在语法错误 THEN 系统 SHALL 在预览区显示错误信息并提示使用 AI 修复功能
6. WHEN 用户在参数控制面板中调整设置 THEN 系统 SHALL 实时应用这些设置到预览图表
7. WHEN 用户完成编辑 THEN 系统 SHALL 提供保存、导出和分享功能