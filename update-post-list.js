// 更新文章列表脚本
// 用于从 Zapier 或命令行更新 posts.config.js

const fs = require('fs');
const path = require('path');

// 从命令行参数或环境变量获取文章ID
const newPostId = process.argv[2] || process.env.NEW_POST_ID;

if (!newPostId) {
    console.error('错误：请提供文章ID');
    console.error('用法：node update-post-list.js <文章ID>');
    console.error('或设置环境变量：NEW_POST_ID=<文章ID> node update-post-list.js');
    process.exit(1);
}

const configPath = path.join(__dirname, 'posts.config.js');

try {
    // 读取当前配置
    const configContent = fs.readFileSync(configPath, 'utf-8');

    // 检查ID是否已存在
    if (configContent.includes(newPostId)) {
        console.log(`✓ 文章 ${newPostId} 已存在，无需添加`);
        process.exit(0);
    }

    // 在 manualPostIds 数组中添加新ID
    const updatedContent = configContent.replace(
        /(manualPostIds:\s*\[)(\s*)/,
        `$1$2\n    '${newPostId}', // 自动添加于 ${new Date().toISOString()}`
    );

    // 写入文件
    fs.writeFileSync(configPath, updatedContent, 'utf-8');

    console.log(`✓ 成功添加文章 ${newPostId}`);
    console.log(`✓ 已更新 posts.config.js`);

} catch (error) {
    console.error('错误：', error.message);
    process.exit(1);
}

