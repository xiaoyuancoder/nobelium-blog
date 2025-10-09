// API 端点：接收 Zapier Webhook，更新文章列表
// 访问地址：/api/update-posts

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export default async function handler(req, res) {
    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 验证密钥（安全措施）
        const apiKey = req.headers['x-api-key'] || req.query.key;
        const expectedKey = process.env.ZAPIER_API_KEY;

        if (expectedKey && apiKey !== expectedKey) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // 获取文章 ID
        const { postId, title } = req.body;

        if (!postId) {
            return res.status(400).json({ error: 'Missing postId' });
        }

        // 验证 ID 格式（32位十六进制）
        if (!/^[a-f0-9]{32}$/i.test(postId)) {
            return res.status(400).json({ error: 'Invalid postId format' });
        }

        // 读取当前配置
        const configPath = path.join(process.cwd(), 'posts.config.js');
        const configContent = await fs.readFile(configPath, 'utf-8');

        // 检查是否已存在
        if (configContent.includes(postId)) {
            return res.status(200).json({
                success: true,
                message: 'Post already exists',
                postId,
                alreadyExists: true
            });
        }

        // 生成新的配置行
        const timestamp = new Date().toISOString();
        const comment = title ? `${title} - ${timestamp}` : `自动添加于 ${timestamp}`;
        const newLine = `    '${postId}', // ${comment}`;

        // 更新配置内容
        const updatedContent = configContent.replace(
            /(manualPostIds:\s*\[)/,
            `$1\n${newLine},`
        );

        // 写入文件
        await fs.writeFile(configPath, updatedContent, 'utf-8');

        // 如果在 Vercel 环境，直接返回成功
        // 实际的 Git 提交由 Zapier 通过 GitHub API 完成
        return res.status(200).json({
            success: true,
            message: 'Post added successfully',
            postId,
            title,
            timestamp,
            note: 'Configuration updated. Please commit and push to deploy.'
        });

    } catch (error) {
        console.error('Error updating posts:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

// 配置说明
// 1. 在 Vercel 环境变量中设置 ZAPIER_API_KEY
// 2. Zapier Webhook URL: https://your-domain.com/api/update-posts?key=YOUR_KEY
// 3. 请求体格式：
//    {
//      "postId": "文章ID（32位十六进制）",
//      "title": "文章标题（可选）"
//    }

