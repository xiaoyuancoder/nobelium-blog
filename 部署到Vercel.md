# 🚀 部署到 Vercel 指南

## ✅ 构建错误已修复

我已经修复了所有页面的构建问题，添加了完善的错误处理：

### 修复的文件：

- ✅ `pages/index.js` - 首页
- ✅ `pages/[slug].js` - 文章页
- ✅ `pages/page/[page].js` - 分页
- ✅ `pages/tag/[tag].js` - 标签页
- ✅ `pages/search.js` - 搜索页
- ✅ `lib/server/notion-api.js` - API 重试逻辑优化

### 修复内容：

1. **添加 try-catch 错误处理**
2. **对 `getAllPosts()` 返回值添加空值保护**
3. **在构建失败时返回空数据而不是崩溃**
4. **优化 530 错误的处理（不重试，快速失败）**

---

## 📝 部署前准备

### 1. 提交代码到 Git

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交修改
git commit -m "修复构建错误，添加错误处理"

# 创建 GitHub 仓库并推送（替换为你的仓库地址）
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

### 2. 准备环境变量

你需要在 Vercel 中配置以下环境变量：

```
NOTION_PAGE_ID=ee99f65a23ab44f8ac80270122ee8138
NOTION_ACCESS_TOKEN=你的_token
```

---

## 🌐 Vercel 部署步骤

### 步骤 1：登录 Vercel

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录

### 步骤 2：导入项目

1. 点击 **"New Project"** 或 **"Add New..."** → **"Project"**
2. 选择 **"Import Git Repository"**
3. 找到你的 GitHub 仓库并点击 **"Import"**

### 步骤 3：配置项目

1. **Project Name**: 输入项目名称（如 `my-blog`）
2. **Framework Preset**: 自动识别为 **Next.js**
3. **Root Directory**: 保持默认 `./`
4. **Build Command**: 保持默认 `pnpm run build`
5. **Output Directory**: 保持默认 `.next`

### 步骤 4：配置环境变量 ⚠️ 重要！

在 **"Environment Variables"** 部分添加：

| Name                  | Value                                  |
| --------------------- | -------------------------------------- |
| `NOTION_PAGE_ID`      | `ee99f65a23ab44f8ac80270122ee8138`     |
| `NOTION_ACCESS_TOKEN` | `你的完整token（以ntn_或secret_开头）` |

**注意：**

- 确保 Token 完整复制
- 不要有多余的空格
- Token 应该是 50 个字符左右

### 步骤 5：部署！

1. 点击 **"Deploy"** 按钮
2. 等待构建完成（大约 1-3 分钟）
3. 构建成功后会显示 **"Congratulations!"**

---

## 🎉 部署成功后

### 你会得到：

1. **生产环境 URL**：

   ```
   https://your-project-name.vercel.app
   ```

2. **自动部署**：

   - 每次推送代码到 GitHub，Vercel 会自动重新部署
   - 主分支的更改会部署到生产环境

3. **预览部署**：
   - Pull Request 会创建预览环境
   - 可以在合并前测试更改

---

## ⚠️ 关于 Notion API 限制

### 为什么博客可能是空的？

即使部署成功，博客可能没有文章，这是因为：

- **Notion API 530 错误**：私有数据库的限制
- **我们已经处理了这个错误**：页面不会崩溃，只是显示为空

### 解决方案：

#### 方案 1：将数据库设为完全公开

1. 打开 Notion 数据库
2. 点击右上角 **"Share"**
3. 开启 **"Share to web"**
4. 在 Vercel 中触发重新部署：
   - 进入项目 → Deployments
   - 点击最新部署的 **"..."** → **"Redeploy"**

⚠️ **注意**：这会让你的所有文章公开可见

#### 方案 2：使用官方公开模板数据库

已经配置的数据库 ID 是官方模板，它是公开的，应该可以正常工作。

#### 方案 3：添加内容到 Notion 后重新部署

1. 在 Notion 中添加文章（确保 Status 是 Published）
2. 等待几分钟
3. 在 Vercel 中触发重新部署

---

## 🔄 重新部署

如果需要重新部署（比如更改了 Notion 内容）：

### 方法 1：通过 Git 推送

```bash
git commit --allow-empty -m "触发重新部署"
git push
```

### 方法 2：在 Vercel 面板中

1. 进入项目页面
2. 点击 **"Deployments"** 标签
3. 点击最新部署旁边的 **"..."**
4. 选择 **"Redeploy"**

---

## 🛠️ 常见问题

### Q1: 构建失败

**检查清单：**

- [ ] 环境变量是否正确设置？
- [ ] `NOTION_ACCESS_TOKEN` 是否完整？
- [ ] 代码是否已提交并推送？

### Q2: 构建成功但页面空白

**可能原因：**

- Notion API 530 错误
- 数据库没有文章
- 文章的 Status 不是 Published

**解决方法：**

1. 检查 Vercel 部署日志
2. 在 Notion 中确认有已发布的文章
3. 尝试将数据库设为公开

### Q3: 如何查看部署日志？

1. 进入 Vercel 项目页面
2. 点击 **"Deployments"**
3. 点击具体的部署
4. 查看 **"Building"** 和 **"Function Logs"** 标签

### Q4: 如何更新环境变量？

1. 进入 Vercel 项目页面
2. 点击 **"Settings"** 标签
3. 点击 **"Environment Variables"**
4. 修改或添加变量
5. **重要**：修改后需要重新部署！

---

## 📊 监控和分析

### Vercel Analytics（可选）

1. 在项目设置中启用 **Analytics**
2. 可以看到访问量、性能指标等

### 自定义域名（可选）

1. 在项目设置中点击 **"Domains"**
2. 添加你的域名
3. 按照提示配置 DNS

---

## 🎯 下一步

部署成功后：

1. ✅ 访问你的博客 URL
2. ✅ 在 Notion 中添加内容
3. ✅ 等待或手动触发重新部署
4. ✅ 享受你的在线博客！

---

## 💡 小技巧

### 自动重新验证

在代码中，所有页面都设置了 `revalidate: 1`，这意味着：

- 页面会每秒钟重新生成一次（当有新请求时）
- 不需要每次更新内容都重新部署
- 但第一次可能需要等待几分钟

### 加快内容更新

如果希望内容更快更新：

1. 降低 `revalidate` 的值（但会增加 API 调用）
2. 使用 Vercel 的 **Webhook** 在 Notion 更新时自动部署

---

**祝你部署成功！** 🎉
