import { NotionAPI } from 'notion-client'

const { NOTION_ACCESS_TOKEN } = process.env

const client = new NotionAPI({ authToken: NOTION_ACCESS_TOKEN })

// 带重试逻辑的包装器
async function retryOperation(operation, maxRetries = 1, delayMs = 500) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            const isLastAttempt = i === maxRetries - 1;
            // 对于 530 错误，不要重试，直接返回
            const is530Error = error.message?.includes('530');

            if (is530Error || isLastAttempt) {
                throw error;
            }

            const isRetryableError =
                error.message?.includes('timeout') ||
                error.message?.includes('ECONNRESET');

            if (!isRetryableError) {
                throw error;
            }

            console.warn(`Notion API 调用失败 (尝试 ${i + 1}/${maxRetries}):`, error.message);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}

// 创建带重试功能的客户端代理
const clientWithRetry = new Proxy(client, {
    get(target, prop) {
        const originalMethod = target[prop];

        // 如果是函数，添加重试逻辑
        if (typeof originalMethod === 'function') {
            return function (...args) {
                return retryOperation(() => originalMethod.apply(target, args));
            };
        }

        return originalMethod;
    }
});

export default clientWithRetry;
