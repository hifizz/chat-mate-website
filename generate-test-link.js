const pako = require('pako');

// 测试用的 Mermaid 内容
const testContents = {
    simple: `graph TD
    A[开始] --> B[处理]
    B --> C[结束]`,
    
    complex: `graph TB
    subgraph "用户界面"
        A[用户输入] --> B[表单验证]
        B --> C{验证通过?}
    end
    
    subgraph "业务逻辑"
        C -->|是| D[处理请求]
        C -->|否| E[显示错误]
        D --> F[调用API]
        F --> G{API成功?}
        G -->|是| H[更新数据]
        G -->|否| I[错误处理]
    end
    
    subgraph "数据层"
        H --> J[保存到数据库]
        J --> K[返回结果]
    end
    
    E --> L[用户重新输入]
    I --> L
    K --> M[显示成功信息]
    L --> A`,
    
    sequence: `sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as 数据库
    
    U->>F: 提交表单
    F->>F: 表单验证
    F->>B: 发送请求
    B->>D: 查询数据
    D-->>B: 返回数据
    B-->>F: 响应结果
    F-->>U: 显示结果`,
    
    themed: `graph LR
    A[浅色主题] --> B[深色主题]
    B --> C[森林主题]
    C --> D[中性主题]
    D --> A`
};

// 使用 pako 压缩并编码
function encodePako(content) {
    const compressed = pako.deflate(content);
    return Buffer.from(compressed).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// 生成测试链接
function generateTestLinks() {
    const baseUrl = 'http://localhost:3000';
    
    console.log('=== Mermaid 图表查看器 iframe 嵌入测试链接 ===\n');
    
    // 测试 1: 默认图表
    console.log('1. 默认图表:');
    console.log(`   ${baseUrl}\n`);
    
    // 测试 2: 简单流程图
    const simpleEncoded = encodePako(testContents.simple);
    console.log('2. 简单流程图:');
    console.log(`   ${baseUrl}?pako=${simpleEncoded}\n`);
    
    // 测试 3: 复杂图表
    const complexEncoded = encodePako(testContents.complex);
    console.log('3. 复杂图表:');
    console.log(`   ${baseUrl}?pako=${complexEncoded}\n`);
    
    // 测试 4: 主题参数
    const themedEncoded = encodePako(testContents.themed);
    console.log('4. 深色主题:');
    console.log(`   ${baseUrl}?pako=${themedEncoded}&theme=dark\n`);
    
    // 测试 5: 序列图
    const sequenceEncoded = encodePako(testContents.sequence);
    console.log('5. 序列图:');
    console.log(`   ${baseUrl}?pako=${sequenceEncoded}\n`);
    
    // 测试 6: 错误处理
    console.log('6. 错误处理 (无效 pako):');
    console.log(`   ${baseUrl}?pako=invalid-content\n`);
    
    // 生成 iframe 嵌入代码示例
    console.log('=== iframe 嵌入代码示例 ===\n');
    
    console.log('简单嵌入:');
    console.log(`<iframe src="${baseUrl}?pako=${simpleEncoded}" width="800" height="600" frameborder="0"></iframe>\n`);
    
    console.log('带主题的嵌入:');
    console.log(`<iframe src="${baseUrl}?pako=${themedEncoded}&theme=dark" width="800" height="600" frameborder="0"></iframe>\n`);
    
    console.log('响应式嵌入:');
    console.log(`<div style="position: relative; width: 100%; height: 0; padding-bottom: 75%;">
    <iframe src="${baseUrl}?pako=${complexEncoded}" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            frameborder="0">
    </iframe>
</div>\n`);
}

// 运行生成器
generateTestLinks();