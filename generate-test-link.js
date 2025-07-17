const pako = require('pako');

// 简单的 Mermaid 图表内容
const content = `graph TD
    A[开始] --> B[结束]
    style A fill:#f9d5e5,stroke:#333,stroke-width:2px
    style B fill:#f8cecc,stroke:#333,stroke-width:2px`;

// 将字符串转换为 Uint8Array
const encoder = new TextEncoder();
const data = encoder.encode(content);

// 使用 pako 压缩
const compressed = pako.deflate(data);

// 将压缩后的数据转换为 Base64 字符串
let binaryString = '';
const bytes = new Uint8Array(compressed);
const len = bytes.byteLength;
for (let i = 0; i < len; i++) {
    binaryString += String.fromCharCode(bytes[i]);
}
const encoded = Buffer.from(binaryString, 'binary').toString('base64');

// 确保 Base64 字符串不包含换行符
const cleanEncoded = encoded.replace(/[\n\r\s]/g, '');

// 生成测试链接
const baseUrl = 'http://192.168.0.153:3000';
const testLink = `${baseUrl}/?pako=${cleanEncoded}&theme=dark`;

// 将链接写入文件
const fs = require('fs');
fs.writeFileSync('test-link.txt', testLink);