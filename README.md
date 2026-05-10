# 待办事项应用

一个支持**多设备共享**的待办事项网页，注册账号后，任何设备登录同一账号都能看到同一份数据。

---

## 如何启动

```bash
# 1. 安装依赖（只需执行一次）
cd server
npm install

# 2. 初始化数据库（只需执行一次）
npx prisma migrate dev --name init

# 3. 启动服务
npm start
```

浏览器打开 `http://localhost:3000`，先注册账号，登录后即可使用。

---

## 如何使用

1. 在输入框里写下要做的事，选择优先级（🔴高/🟡中/🟢低），点击"添加"或按回车
2. 勾选复选框标记完成，文字会自动加删除线
3. 悬停任务项，点 ✏️ 编辑文字，点 × 删除这条待办
4. 编辑时按 Enter 保存、Esc 取消
5. 底部可一键清空已完成或清空全部（有确认提示）
6. 顶部会显示还剩多少条没完成
7. 右上角可退出登录

---

## 项目结构

```
index.html          页面骨架（含登录/注册和待办界面）
css/
  style.css         样式文件
js/
  api.js            HTTP 请求层（调后端 API）
  todo.js           业务逻辑（增删改查）
  app.js            页面交互（渲染 + 事件 + 登录管理）
server/              后端服务
  index.js          Express 服务器入口
  db.js             数据库连接
  auth.js           JWT 鉴权
  routes/
    auth.js         注册/登录接口
    todos.js        待办 CRUD 接口
  prisma/
    schema.prisma   数据库表定义
AGENTS.md           技术文档（架构、代码说明）
README.md           本文件
```

详细代码说明见 [AGENTS.md](AGENTS.md)。

---

## 常见问题

**Q: 停止服务用什么命令？**

A: 终端按 `Ctrl + C`。如果没反应，执行 `kill $(lsof -t -i :3000)`。

**Q: 数据存在哪里？**

A: 存在 `server/prisma/dev.db` 数据库文件中。可以用 `sqlite3` 查看。

**Q: 查看数据库里的用户？**

```bash
sqlite3 server/prisma/dev.db "SELECT id, username FROM user;"
```

**Q: 换电脑后数据还在吗？**

A: 只要启动同一个服务端（同一份 `dev.db` 文件），数据就在。换设备登录同一账号也能看到同一份数据。

**Q: 如何删除所有数据？**

```bash
cd server
rm -f prisma/dev.db
npx prisma migrate dev --name init
```
