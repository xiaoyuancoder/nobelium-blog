# ⚡ Zapier 快速配置（你的工作流已就绪版本）

既然你已经配置好 Zapier 工作流，现在只需要添加 **GitHub 更新步骤**！

---

## 🎯 你需要做的事

### 1️⃣ 获取 GitHub Token（2 分钟）

1. 访问：https://github.com/settings/tokens/new

2. 配置：

   - **Note**: `Zapier Blog Automation`
   - **Expiration**: 选择 `No expiration` 或 `1 year`
   - **权限**：只勾选 `repo` ✓

3. 点击 **Generate token**

4. **复制并保存** Token（只显示一次！）

---

### 2️⃣ 在 Zapier 中添加 Code 步骤

在你现有的 Zap 中，在 **Notion Trigger 之后** 添加：

#### 步骤：Code by Zapier

**配置**：

- Language: **JavaScript**
- Code: 复制下面的代码

```javascript
// ========================================
// Zapier Code: 自动更新博客文章列表
// ========================================

// 👇 在这里修改你的配置
const GITHUB_TOKEN = "ghp_你的GitHub_Token在这里"; // ⚠️ 替换为你的 Token
const GITHUB_REPO = "你的用户名/仓库名"; // 例如：xiaoyuancoder/nobelium
// ========================================

// 从 Notion 获取数据
const notionPageUrl = inputData.url; // Notion 页面 URL
const postTitle = inputData.title || "新文章"; // 文章标题

// 提取文章 ID（从 URL 中）
const postIdMatch = notionPageUrl.match(/([a-f0-9]{32})/);
if (!postIdMatch) {
  throw new Error("无法从 URL 提取文章 ID: " + notionPageUrl);
}
const postId = postIdMatch[1];

// GitHub API 配置
const filePath = "posts.config.js";
const branch = "main";

try {
  // 1️⃣ 获取当前文件
  const getResponse = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!getResponse.ok) {
    throw new Error(`GitHub API 错误: ${getResponse.status}`);
  }

  const fileData = await getResponse.json();
  const currentContent = Buffer.from(fileData.content, "base64").toString(
    "utf-8"
  );
  const sha = fileData.sha;

  // 2️⃣ 检查是否已存在
  if (currentContent.includes(postId)) {
    output = {
      status: "skipped",
      message: "文章已存在",
      postId: postId,
    };
    return; // 跳过，不重复添加
  }

  // 3️⃣ 更新内容
  const timestamp = new Date().toISOString().split("T")[0];
  const newLine = `    '${postId}', // ${postTitle} - ${timestamp}`;

  const updatedContent = currentContent.replace(
    /(manualPostIds:\s*\[)/,
    `$1\n${newLine},`
  );

  // 4️⃣ 提交到 GitHub
  const updateResponse = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `chore: add new post - ${postTitle}`,
        content: Buffer.from(updatedContent, "utf-8").toString("base64"),
        sha: sha,
        branch: branch,
      }),
    }
  );

  if (!updateResponse.ok) {
    const errorData = await updateResponse.json();
    throw new Error(`提交失败: ${JSON.stringify(errorData)}`);
  }

  const result = await updateResponse.json();

  // 5️⃣ 返回结果
  output = {
    status: "success",
    message: "文章已添加",
    postId: postId,
    postTitle: postTitle,
    commitUrl: result.commit.html_url,
    deployNote: "Vercel 将在几分钟内自动部署",
  };
} catch (error) {
  output = {
    status: "error",
    error: error.message,
    postId: postId,
  };
  throw error;
}
```

**输入数据配置**：

- `url`: 选择 Notion 的 **Page URL** 字段
- `title`: 选择 Notion 的 **Title** 或 **Name** 字段

---

### 3️⃣ 测试工作流

1. 在 Zapier 中点击 **Test & Continue**

2. 选择一个测试文章

3. 运行测试

4. 检查输出：

   - ✅ `status: success`
   - ✅ `commitUrl`: GitHub 提交链接

5. 访问你的 GitHub 仓库，确认 `posts.config.js` 已更新

---

### 4️⃣ 启用 Zap

1. 点击 **Publish Zap**

2. 🎉 完成！

---

## 🧪 验证自动化

### 端到端测试：

1. **在 Notion 中**：

   - 创建一篇新文章
   - 设置 Status = `Published`

2. **等待 1-2 分钟**：

   - Zapier 检测到变化
   - 自动运行工作流

3. **检查 GitHub**：

   - 访问：`https://github.com/YOUR_USERNAME/nobelium-blog/commits`
   - 应该看到新的自动提交

4. **检查 Vercel**：

   - 访问 Vercel Dashboard
   - 应该看到新的部署正在进行

5. **5-7 分钟后**：
   - 访问你的博客
   - 新文章应该出现了！🎉

---

## 📊 Zapier 工作流完整示意图

```
┌─────────────────────────────────────┐
│   1. Notion Database Item Created   │
│      (或 Updated)                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   2. Filter (可选)                   │
│      - Status = "Published"          │
│      - Type = "Post"                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   3. Code by Zapier ⭐               │
│      - 提取文章 ID                   │
│      - 更新 posts.config.js          │
│      - 提交到 GitHub                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   4. GitHub Auto-Commit ✓            │
│      posts.config.js updated         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   5. Vercel Auto-Deploy 🚀           │
│      (自动触发，无需配置)            │
└─────────────────────────────────────┘
```

---

## 🔒 安全建议

### ⚠️ 不要将 Token 硬编码！

**更安全的方式**：使用 Zapier Storage

#### 设置步骤：

1. 在 Zapier 中添加 **Storage by Zapier** 步骤

2. **Set Value in Storage**：

   - Key: `github_token`
   - Value: `你的 GitHub Token`

3. 在 Code 步骤中使用：
   ```javascript
   // 从 Zapier Storage 获取
   const GITHUB_TOKEN = inputData.github_token;
   ```

---

## 🐛 故障排查

### 问题 1：`401 Unauthorized`

**原因**：Token 无效或权限不足

**解决**：

1. 检查 Token 是否正确复制
2. 确认 Token 有 `repo` 权限
3. 重新生成 Token

### 问题 2：`404 Not Found`

**原因**：仓库名称错误

**解决**：

- 确认 `GITHUB_REPO` 格式：`用户名/仓库名`
- 例如：`craigary/nobelium`

### 问题 3：文章 ID 提取失败

**原因**：Notion URL 格式不同

**解决**：

- 打印 `notionPageUrl` 查看实际格式
- 调整正则表达式

### 问题 4：Vercel 没有自动部署

**原因**：Vercel 未连接到 GitHub

**解决**：

1. 访问 Vercel Dashboard
2. Settings → Git
3. 确认已连接到正确的仓库
4. 确认 `main` 分支已启用自动部署

---

## 📝 输入字段映射

在 Zapier Code 步骤中，你需要映射 Notion 字段：

| Zapier 输入 | 选择的 Notion 字段       |
| ----------- | ------------------------ |
| `url`       | **Page URL** 或 **Link** |
| `title`     | **Name** 或 **Title**    |

**示例**：

```javascript
// inputData 配置
inputData: {
  url: "步骤1 - Page URL",
  title: "步骤1 - Name"
}
```

---

## ✅ 配置检查清单

- [ ] GitHub Token 已创建
- [ ] Token 有 `repo` 权限
- [ ] `GITHUB_REPO` 变量已正确设置
- [ ] Code 步骤已添加到 Zap
- [ ] 输入字段已映射（`url`, `title`）
- [ ] 已测试并成功
- [ ] Zap 已发布（Published）
- [ ] Vercel 已连接到 GitHub

---

## 🎉 完成！

现在你的博客已经**完全自动化**！

**工作流程**：

1. 在 Notion 写文章 ✍️
2. 设置 Status = Published 📝
3. Zapier 自动更新 GitHub 🤖
4. Vercel 自动部署 🚀
5. 博客自动显示新文章 🎉

**全程无需手动操作！** 😎

---

## 🆘 需要帮助？

如果遇到问题：

1. 查看 Zapier Task History
2. 查看 GitHub Commits
3. 查看 Vercel Deployment Logs
4. 联系我获取帮助！

**祝你的自动化博客运行顺利！** 🚀✨
