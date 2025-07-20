# Mermaid 图表查看器部署指南

本文档提供了将 Mermaid 图表查看器部署到生产环境的详细步骤和最佳实践。

## 前提条件

- Node.js 18.x 或更高版本
- pnpm 8.x 或更高版本
- 一个支持 Node.js 应用的托管服务（如 Vercel、Netlify、AWS、阿里云等）

## 部署步骤

### 1. 准备环境变量

在部署之前，请确保正确配置以下环境变量：

1. 复制 `.env.production` 文件并根据您的环境进行修改
2. 设置 API 密钥（如果使用 AI 修复功能）
   - `DEEPSEEK_API_KEY`: Deepseek API 密钥
   - `DOUBAO_API_KEY`: 豆包 API 密钥
3. 设置应用 URL
   - `NEXT_PUBLIC_APP_URL`: 应用的完整 URL，例如 `https://mermaid-chart-viewer.example.com`

### 2. 构建应用

```bash
# 安装依赖
pnpm install

# 构建生产版本
pnpm build
```

构建完成后，输出文件将位于 `.next` 目录中。

### 3. 部署到托管服务

#### Vercel 部署（推荐）

1. 安装 Vercel CLI：`pnpm add -g vercel`
2. 登录 Vercel：`vercel login`
3. 部署应用：`vercel --prod`

#### Netlify 部署

1. 安装 Netlify CLI：`pnpm add -g netlify-cli`
2. 登录 Netlify：`netlify login`
3. 部署应用：`netlify deploy --prod`

#### 自托管部署

如果您想在自己的服务器上部署：

1. 将构建后的文件传输到服务器
2. 安装依赖：`pnpm install --production`
3. 启动应用：`pnpm start`

### 4. 配置域名和 HTTPS

为了确保应用的安全性和可访问性，建议配置自定义域名和 HTTPS：

1. 在您的域名注册商处添加 DNS 记录，指向您的托管服务
2. 在托管服务中配置 SSL 证书（大多数现代托管服务会自动处理这一步）

### 5. 监控和日志

部署后，建议设置监控和日志记录：

1. 使用托管服务提供的监控工具
2. 考虑集成第三方监控服务，如 Sentry 或 LogRocket
3. 定期检查应用日志以识别潜在问题

## 性能优化

为了确保最佳性能，请考虑以下优化：

1. 启用 CDN 缓存
2. 配置适当的缓存头
3. 使用压缩（gzip 或 brotli）
4. 优化图像和静态资源

## 安全注意事项

1. 确保 API 密钥安全存储，不要在客户端代码中暴露
2. 定期更新依赖以修复安全漏洞
3. 考虑实施速率限制以防止滥用

## 故障排除

如果您在部署过程中遇到问题，请检查：

1. 环境变量是否正确设置
2. 构建日志中是否有错误
3. 服务器日志中是否有运行时错误

## 更新流程

当需要更新应用时：

1. 拉取最新代码
2. 安装依赖：`pnpm install`
3. 构建应用：`pnpm build`
4. 部署更新后的构建

## 联系支持

如果您需要帮助，请通过以下方式联系我们：

- 提交 GitHub Issue
- 发送电子邮件至 support@example.com