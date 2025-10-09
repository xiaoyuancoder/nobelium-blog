# 🔄 Zapier 自动化部署指南

## 📋 目标

当在 Notion 中发布新文章时，自动：

1. 提取文章 ID
2. 更新 GitHub 仓库中的 `posts.config.js`
3. 触发 Vercel 重新部署

---

## 🎯 Zapier 工作流配置

### 工作流结构

```
Notion (Trigger)
    ↓
Filter (只处理 Published 文章)
    ↓
Formatter (提取文章 ID)
    ↓
GitHub (更新 posts.config.js)
    ↓
Vercel (自动部署)
```

---

## 📝 详细步骤

### 步骤 1：Notion Trigger（已完成 ✓）

**触发器设置**：

- App: Notion
- Trigger: New Database Item
- Database: 你的博客数据库
- Trigger Field: Status = Published

### 步骤 2：Filter（可选但推荐）

**添加过滤器**：

- 只处理 `Status` 为 `Published` 的文章
- 只处理 `Type` 为 `Post` 的内容

**Filter 规则**：

```
Status exactly matches "Published"
AND
Type exactly matches "Post"
```

### 步骤 3：Formatter - 提取文章 ID

**配置**：

- App: Formatter by Zapier
- Event: Text
- Transform: Extract Pattern
- Pattern: `([a-f0-9]{32})` (提取 32 位 ID)
- Input: Notion 页面 URL

**或者直接使用 Notion 的 Page ID 字段**

### 步骤 4：Code - 生成更新内容

**配置**：

- App: Code by Zapier
- Language: JavaScript

**代码**：

```javascript
// 输入参数
const postId = inputData.notionPageId; // 从上一步获取的文章ID
const postTitle = inputData.title || "新文章"; // 文章标题（可选）

// 获取当前时间
const now = new Date().toISOString().split("T")[0];

// 生成新的一行配置
const newLine = `    '${postId}', // ${postTitle} - ${now}`;

output = {
  postId: postId,
  newLine: newLine,
};
```

### 步骤 5：GitHub - 获取当前文件

**配置**：

- App: GitHub
- Action: Get File
- Account: 你的 GitHub 账号
- Repository: 你的仓库名
- File Path: `posts.config.js`
- Reference: `main`

### 步骤 6：Code - 更新文件内容

**配置**：

- App: Code by Zapier
- Language: JavaScript

**代码**：

```javascript
// 输入参数
const currentContent = inputData.fileContent; // 从 GitHub 获取的当前内容
const newPostId = inputData.postId; // 新文章ID
const newLine = inputData.newLine; // 新的配置行

// 检查ID是否已存在
if (currentContent.includes(newPostId)) {
  output = {
    needsUpdate: false,
    newContent: currentContent,
    message: "Post already exists",
  };
} else {
  // 在 manualPostIds 数组中添加新ID
  const updatedContent = currentContent.replace(
    /(manualPostIds:\s*\[)/,
    `$1\n${newLine},`
  );

  output = {
    needsUpdate: true,
    newContent: updatedContent,
    message: "Post added successfully",
  };
}
```

### 步骤 7：Filter - 只在需要更新时继续

**Filter 规则**：

```
needsUpdate is true
```

### 步骤 8：GitHub - 更新文件

**配置**：

- App: GitHub
- Action: Update File
- Repository: 你的仓库名
- File Path: `posts.config.js`
- File Content: (从步骤 6 的 `newContent`)
- Commit Message: `chore: add new post ${postId}`
- Branch: `main`

---

## 🚀 Vercel 自动部署

Vercel 会自动检测 GitHub 仓库的变化：

- 当 `posts.config.js` 更新后
- Vercel 自动触发重新构建
- 几分钟后新文章就会出现在博客上

**无需额外配置！**

---

## 📝 简化方案：使用 GitHub API 直接更新

如果你想更简单，可以只用一个 Code 步骤：

### Zapier Code 步骤（All-in-One）

```javascript
// 输入参数（从 Notion trigger 获取）
const notionPageUrl = inputData.notionPageUrl;
const postTitle = inputData.title;

// GitHub 配置
const githubToken = "YOUR_GITHUB_TOKEN"; // 需要在 Zapier 中设置
const repo = "YOUR_USERNAME/YOUR_REPO";
const filePath = "posts.config.js";

// 提取文章ID
const postId = notionPageUrl.match(/([a-f0-9]{32})/)?.[1];

if (!postId) {
  throw new Error("无法从URL中提取文章ID");
}

// 1. 获取当前文件内容
const getFileResponse = await fetch(
  `https://api.github.com/repos/${repo}/contents/${filePath}`,
  {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  }
);

const fileData = await getFileResponse.json();
const currentContent = Buffer.from(fileData.content, "base64").toString();
const sha = fileData.sha;

// 2. 检查是否已存在
if (currentContent.includes(postId)) {
  output = { status: "already_exists", postId };
  return;
}

// 3. 更新内容
const newLine = `    '${postId}', // ${postTitle} - ${
  new Date().toISOString().split("T")[0]
}`;
const updatedContent = currentContent.replace(
  /(manualPostIds:\s*\[)/,
  `$1\n${newLine},`
);

// 4. 提交更新
const updateResponse = await fetch(
  `https://api.github.com/repos/${repo}/contents/${filePath}`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `chore: add new post - ${postTitle}`,
      content: Buffer.from(updatedContent).toString("base64"),
      sha: sha,
      branch: "main",
    }),
  }
);

const result = await updateResponse.json();

output = {
  status: "updated",
  postId: postId,
  commitUrl: result.commit?.html_url,
};
```

---

## 🔑 GitHub Token 设置

### 创建 GitHub Personal Access Token

1. 访问：https://github.com/settings/tokens

2. 点击 **"Generate new token (classic)"**

3. 设置权限：

   - `repo` (Full control of private repositories) ✓

4. 生成并复制 Token

5. 在 Zapier 中保存为密钥：
   - 使用 Storage by Zapier
   - 或直接在 Code 步骤中设置（不推荐）

---

## 🧪 测试工作流

### 本地测试脚本

```bash
# 测试添加文章
node update-post-list.js "文章ID"

# 查看更新结果
cat posts.config.js
```

### Zapier 测试

1. 在 Zapier 中点击 "Test & Review"
2. 选择一个现有的 Notion 文章
3. 运行测试
4. 检查 GitHub 仓库是否更新
5. 等待 Vercel 自动部署

---

## 📊 工作流监控

### 查看部署状态

1. **GitHub**：

   - 查看 Commits 历史
   - 确认自动提交成功

2. **Vercel**：

   - 访问 Vercel Dashboard
   - 查看 Deployments
   - 确认自动部署完成

3. **博客**：
   - 访问博客首页
   - 确认新文章显示

---

## ⚠️ 注意事项

### 1. GitHub Token 安全

- ❌ 不要在代码中硬编码 Token
- ✅ 使用 Zapier 的 Storage 或环境变量
- ✅ 定期更新 Token
- ✅ 只给必要的权限

### 2. 避免重复添加

- Code 步骤已包含重复检查
- 如果文章 ID 已存在，会跳过更新

### 3. 部署时间

- GitHub 更新：即时
- Vercel 检测：1-2 分钟
- Vercel 构建：3-5 分钟
- **总计：约 5-7 分钟**

### 4. 错误处理

在 Zapier 中添加错误通知：

- 发送邮件
- Slack 通知
- 记录到 Google Sheets

---

## 🎯 完整工作流示例

### Zapier Zap 配置

```
1. [Trigger] Notion - New Database Item
   ↓
2. [Filter] Status = "Published" AND Type = "Post"
   ↓
3. [Code] Extract Post ID from URL
   ↓
4. [Code] Update posts.config.js via GitHub API
   ↓
5. [Notification] Send success email (可选)
```

---

## 📝 替代方案

### 如果不想用 Zapier Code：

可以创建一个简单的 Webhook 服务：

1. 创建 API 端点（Vercel Serverless Function）
2. Zapier 调用这个 API
3. API 更新 GitHub

**我可以帮你创建这个 API 端点！**

---

## ✅ 验证清单

部署前检查：

- [ ] GitHub Token 已创建并保存
- [ ] Zapier 工作流已配置
- [ ] 已测试单个文章的自动添加
- [ ] Vercel 已连接到 GitHub 仓库
- [ ] `posts.config.js` 在 Git 中
- [ ] `.github/workflows/auto-deploy.yml` 已提交

---

## 🚀 下一步

1. **测试工作流**：

   ```bash
   # 手动测试添加
   node update-post-list.js "测试ID12345678901234567890abcd"
   git add posts.config.js
   git commit -m "test: add post"
   git push
   ```

2. **配置 Zapier**：

   - 按照上面的步骤配置
   - 运行测试

3. **验证自动化**：
   - 在 Notion 创建测试文章
   - 设置为 Published
   - 等待 5-10 分钟
   - 检查博客

---

**需要帮助配置具体步骤吗？** 告诉我你在哪一步需要协助！ 😊
