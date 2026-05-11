# 安装部署指导文档

## 目录

- [环境要求](#环境要求)
- [本地部署](#本地部署)
- [Railway 云部署](#railway-云部署)
- [数据库管理](#数据库管理)
- [常见问题](#常见问题)

---

## 环境要求

| 软件 | 用途 | 安装命令 |
|------|------|---------|
| Git | 版本管理 | `sudo dnf install git` |
| Node.js + npm | 运行后端服务 | `sudo dnf install nodejs` |
| sqlite3（可选） | 查看数据库 | `sudo dnf install sqlite` |

验证安装：

```bash
node -v
npm -v
git --version
```

---

## 本地部署

### 1. 克隆代码

```bash
git clone https://github.com/yhf2021/todo-app.git
cd todo-app
```

### 2. 安装后端依赖

```bash
cd server
npm install
```

### 3. 初始化数据库

```bash
npx prisma migrate dev --name init
```

执行后会在 `server/prisma/` 下生成 `dev.db` 文件，所有数据存储在该文件中。

### 4. 启动服务

```bash
npm start
```

终端显示 `Todo 服务已启动: http://localhost:3000` 即表示启动成功。

### 5. 访问

浏览器打开 `http://localhost:3000`，注册账号后即可使用。

### 6. 停止服务

按 `Ctrl + C`。如果没反应：

```bash
kill $(lsof -t -i :3000)
```

---

## Railway 云部署

### 1. 安装 Railway CLI

```bash
sudo npm install -g @railway/cli
```

### 2. 登录 Railway

```bash
railway login
```

终端会输出一个验证链接，浏览器打开完成 GitHub 授权登录。

### 3. 初始化 Railway 项目

```bash
cd ~/reminder
railway init
```

- 选择你的 Workspace
- 输入项目名（如 `todo-app`）

### 4. 部署

```bash
railway up
```

等待终端显示 `Deploy complete`，部署完成后会输出访问地址。

### 5. 添加数据库持久化

Railway 默认重启后会清除本地文件，需要挂载 Volume 来持久化 SQLite 数据库。

```bash
# 1. 创建 Volume，挂载到数据库目录
railway volume add --mount-path /app/server/prisma

# 2. 验证创建成功
railway volume list
```

> 注意：挂载路径必须以 `/` 开头，且需与 Prisma 数据库文件的目录对应（即 `/app/server/prisma`）。Volume 会自动命名，可通过 `railway volume list` 查看。

### 6. 重新部署

右上角 **Deploy** → **Trigger Deploy**，等待部署完成。

### 7. 验证部署

访问 Railway 提供的 URL（如 `https://todo-app-production-xxxx.up.railway.app`），注册账号测试是否正常。

### 8. 查看部署日志

```bash
railway logs
```

或在 Railway 网页 → 左侧 **Deployments** → 点最新部署 → **Deploy Log**。

### 9. 重新部署更新

```bash
cd ~/reminder
railway up
```

### 10. 删除项目后重新部署（重置）

如果需要从头开始（比如部署配置出错），可以删除项目后重新创建：

```bash
cd ~/reminder

# 删除项目（会提示确认，输入 y 回车）
railway project delete

# 创建新项目
railway init

# 部署
railway up
```

> 注意：删除项目会同时清除 Volume 中的数据，所有用户和待办数据将丢失。如有需要，先备份数据库。

---

## 数据库管理

### 查看用户数据

```bash
sqlite3 server/prisma/dev.db "SELECT id, username FROM user;"
```

### 查看待办数据

```bash
sqlite3 server/prisma/dev.db "SELECT * FROM todo;"
```

### 重置数据库

```bash
cd server
rm -f prisma/dev.db
npx prisma migrate dev --name init
```

> 注意：此操作会删除所有数据，不可恢复。

### 备份数据库

```bash
cp server/prisma/dev.db server/prisma/dev.db.backup
```

### 恢复数据库

```bash
cp server/prisma/dev.db.backup server/prisma/dev.db
```

---

## 常见问题

### Q: 部署成功后注册/登录返回 404

**原因：** Railway 把项目当成了静态网站，未启动 Node.js 服务。

**解决：** 检查项目根目录是否有 `package.json`。如果没有，创建并重新部署：

```json
{
  "name": "todo-app",
  "private": true,
  "scripts": {
    "build": "cd server && npm install",
    "start": "cd server && npx prisma migrate deploy && node index.js"
  }
}
```

### Q: Prisma 报错 "Environment variable not found: DATABASE_URL"

**原因：** Prisma schema 中使用了 `env("DATABASE_URL")` 但未设置环境变量。

**解决：** 将 schema 中的 `url = env("DATABASE_URL")` 改为 `url = "file:./dev.db"` 直接指定 SQLite 文件路径。

### Q: 重启后数据丢失

**原因：** 未配置 Volume，SQLite 文件存储在临时文件系统中。

**解决：** 在 Railway 控制台添加 Volume，挂载路径为 `server/prisma`。

### Q: railway up 部署很慢

Railway 的免费构建队列有时需要排队等待。通常 2-5 分钟完成，如果超过 10 分钟，检查网络或重试。

### Q: 如何查看当前部署的 URL？

```bash
railway domain
```

或在 Railway 网页 → 项目页面顶部可直接看到。
