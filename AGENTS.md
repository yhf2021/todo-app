# AGENTS.md — 项目上下文

本项目面向 AI 助手和开发者，记录技术栈、架构设计、代码说明等工程上下文。

---

## 技术栈

| 层 | 当前技术 | 说明 |
|---|---------|------|
| 前端 | 原生 HTML + CSS + JavaScript | 无框架依赖，直接浏览器打开即可运行 |
| 后端框架 | **Node.js + Express** | 提供 RESTful API |
| 数据库 | **SQLite**（开发） | 通过 Prisma ORM 操作 |
| ORM | **Prisma** | 自动建表、类型安全 |
| 认证 | **JWT**（JSON Web Token） | 无状态登录，7 天过期 |
| 部署 | **Railway** | 免费套餐，支持 Node.js |

---

## 项目结构

```
package.json         根 package.json（Railway 部署识别为 Node 项目）
index.html           页面骨架（含登录/注册和待办界面）
css/
  style.css          全部样式（颜色、圆角、阴影、响应式）
js/
  api.js             HTTP 请求层（封装 fetch，自动带 JWT token）
  todo.js            业务逻辑层（待办的增删改查 + 排序，异步调 API）
  app.js             视图层（DOM 渲染、事件绑定、登录/注册管理）
server/               后端服务（Node.js + Express + Prisma）
  index.js           入口，Express 服务器
  db.js              Prisma 客户端
  auth.js            JWT 鉴权中间件
  routes/
    auth.js          注册/登录接口
    todos.js         待办 CRUD 接口
  prisma/
    schema.prisma    数据库表定义
  package.json       依赖管理
AGENTS.md             本文件（技术上下文）
README.md             用户说明文档
DEPLOY.md             部署指导文档（仅本地）
```

---

## 代码说明

### index.html — 页面骨架

HTML 标签引入外部 CSS 和 JS，不包含任何内联样式或脚本：

```html
<link rel="stylesheet" href="css/style.css">

<!-- JS 加载顺序严格：api → todo → app -->
<script src="js/api.js"></script>
<script src="js/todo.js"></script>
<script src="js/app.js"></script>
```

页面关键元素：

| 标签 | id | 作用 |
|------|----|------|
| `<input>` | `input` | 任务输入框 |
| `<select>` | `prioritySelect` | 优先级选择（高/中/低） |
| `<button>` | `addBtn` | 添加按钮 |
| `<ul>` | `todoList` | 待办列表容器 |
| `<span>` | `pendingCount` | 待完成数量 |
| `<span>` | `doneCount` | 已完成数量 |
| `<div>` | `hint` | 空输入错误提示 |
| `<button>` | `clearBtn` | 清空已完成（有完成项时显示） |
| `<button>` | `clearAllBtn` | 清空全部（有任务时显示） |
| `<input>` | `authUser` | 登录/注册用户名 |
| `<input>` | `authPass` | 登录/注册密码 |
| `<button>` | `loginBtn` | 登录按钮 |
| `<button>` | `registerBtn` | 注册按钮 |
| `<button>` | `logoutBtn` | 退出登录 |
| `<div>` | `authError` | 登录错误提示 |

---

### css/style.css — 样式

设计风格：简洁现代，蓝色调，圆角，阴影，响应式。

关键样式对照：

```css
/* 背景渐变：浅蓝 → 浅紫 */
body { background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%); }

/* 白色卡片容器 */
.container { border-radius: 16px; box-shadow: 0 8px 32px rgba(30,90,180,0.15); max-width: 540px; }

/* 优先级颜色标识（左侧边框） */
.todo-item.priority-high   { border-left-color: #e05050; }
.todo-item.priority-medium { border-left-color: #f0a030; }
.todo-item.priority-low    { border-left-color: #2d9f5e; }

/* 编辑模式高亮 */
.todo-item.editing { background: #fffbe6; border-left-color: #4a8cf7; }
.todo-item .edit-input { border: 2px solid #4a8cf7; border-radius: 6px; }

/* 操作按钮交互 */
.edit-btn:hover { color: #4a8cf7; background: #e8f0fe; }
.del-btn:hover  { color: #e05050; background: #ffe8e8; }
```

---

### js/api.js — HTTP 请求层

封装所有后端 API 请求，自动附带 JWT token。对外暴露 `Api` 全局对象：

```javascript
const Api = (function() {
  var BASE_URL = window.location.origin + '/api';

  function getToken() { return localStorage.getItem('token'); }

  async function request(method, path, body) {
    // 自动加 Content-Type 和 Authorization header
    // 401 时自动清除 token 并跳转到登录页
    // 其他错误抛异常
  }

  return {
    register, login,               // 认证
    getTodos, addTodo,             // 待办 CRUD
    updateTodo, toggleTodo,
    deleteTodo, clearDone, clearAll
  };
})();
```

---

### js/todo.js — 业务逻辑层

管理待办数据的**数组**，对外暴露 `TodoApp` 全局对象。内部维护 `_todos` 数组，外部只能通过暴露的方法操作。

**数据格式：**

```javascript
{ text: "买牛奶", done: false, priority: "medium" }
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `text` | string | 任务内容 |
| `done` | boolean | 是否已完成 |
| `priority` | string | `"high"` / `"medium"` / `"low"` |

**暴露的方法：**

| 方法 | 说明 | 触发时机 |
|------|------|---------|
| `init()` | 从 API 获取数据 + 按优先级排序 | 页面加载 |
| `getAll()` | 返回 `_todos` 数组引用 | render |
| `add(text, priority)` | 调 API 追加，按优先级排序后存本地 | 用户添加 |
| `toggle(id)` | 调 API 切换 `done` 状态 | 点击复选框 |
| `update(id, data)` | 调 API 修改 `text` 或 `priority` | 编辑保存 |
| `remove(id)` | 调 API 从数组删除指定项 | 点击删除按钮 |
| `clearDone()` | 调 API 过滤掉所有 `done=true` 的项 | 清空已完成 |
| `clearAll()` | 调 API 重置为空数组 | 清空全部 |
| `getStats()` | 返回 `{ total, pending, done }` | render |

**排序规则：** `high`(0) → `medium`(1) → `low`(2)，每次 `add()` 和 `init()` 时执行。

**关于代码风格：** 使用 `var` 而非 `let`/`const`，使用 `function` 表达式而非箭头函数，使用字符串拼接而非模板字符串，以兼容无构建工具的纯浏览器环境。

---

### js/app.js — 视图层

操作 DOM、绑定事件、管理编辑状态，对外暴露 `App` 全局对象。内部使用 IIFE 模式封装私有变量。

**核心数据结构：** `els` 对象缓存所有 DOM 引用，`editingIndex` 跟踪正在编辑的项。

**render 函数**（每次数据变化时调用）：

```javascript
function render() {
  // 1. 更新统计数字 + 按钮显隐
  // 2. 空列表 → 友好提示（🎉 今天还没有任务哦～）
  // 3. 遍历 todos 生成列表 HTML（带优先级 class、复选框、文字、编辑/删除按钮）
  // 4. 编辑状态 → 聚焦到 edit-input
}
```

**事件绑定清单：**

```javascript
els.addBtn.addEventListener('click', handleAdd);              // 点击添加
els.input.addEventListener('keydown', enterHandler);           // 回车添加
els.input.addEventListener('input', hideHint);                // 打字隐藏提示
els.list.addEventListener('click', handleListClick);          // 复选/编辑/删除
els.list.addEventListener('keydown', handleListKeydown);      // 编辑时 Enter/Esc
els.clearBtn.addEventListener('click', handleClearDone);      // 清空已完成
els.clearAllBtn.addEventListener('click', handleClearAll);    // 清空全部
```

**交互逻辑矩阵：**

| 操作 | 行为 |
|------|------|
| 输入为空点添加 | 输入框变红 + 提示，2 秒消失 |
| 点击 ✏️ | 文字变输入框，行变黄色 |
| 编辑按 Enter | 保存文字 |
| 编辑按 Esc | 取消修改 |
| 点击复选框 | 切换 done（编辑时锁定） |
| 清空全部 | `confirm()` 确认 |
| 删除正在编辑的项 | 自动退出编辑，后续 index 修正 |

---

### 数据流（当前架构）

```
用户操作（点击/输入）
       │
       ▼
  app.js（视图层）
   ── 调用 TodoApp.xxx() ──►  todo.js（业务层）
                                 ── 修改 _todos 数组
                                 ── 调用 Api.xxx() ──►  api.js（请求层）
                                                         ── HTTP ──► 后端服务器
  app.js（视图层）
   ── render() 刷新页面 ◄── 取自 TodoApp.getAll()
```

核心循环：**用户操作 → 改数据 → 调 API → 刷新页面**。

---

## 常见修改参考

| 修改目标 | 对应位置 |
|---------|---------|
| 标题文字 | `index.html` 中的 `<h1>` 标签 |
| 主题颜色 | `css/style.css` 中搜索 `#4a8cf7` |
| 优先级颜色 | `css/style.css` 中搜索 `.priority-` |
| 优先级选项 | `index.html` 中 `<select id="prioritySelect">` |
| 空状态提示 | `js/app.js` 中 `render()` 的 `empty-msg` |
| 清空确认文案 | `js/app.js` 中 `handleClearAll` 的 `confirm(...)` |
| 添加新功能 | 先在 `js/todo.js` 加函数，再到 `js/app.js` 调用 |

---

## 后端设计（多设备共享方案）

前后端代码已完整实现。启动服务器即可支持多设备共享。

### 启动服务器

```bash
cd server
npm install
npx prisma migrate dev --name init
npm start
```

服务运行在 http://localhost:3000，浏览器打开即可使用。

### Railway 部署

根目录 `package.json` 使 Railway 能自动识别为 Node 项目。`start` 脚本会自动执行 `cd server && npx prisma migrate deploy && node index.js`。

```bash
# 安装 CLI 并部署
sudo npm install -g @railway/cli
railway login
cd ~/reminder
railway init
railway up
```

部署完成后需在 Railway 控制台添加 Volume 持久化数据库（挂载路径 `server/prisma`）。

### 整体架构

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────┐
│  浏览器 (前端)    │─────▶│  后端 API 服务器  │─────▶│   数据库      │
│  index.html      │ HTTP │  Node.js/Express │ SQL  │  SQLite      │
│  js/app.js       │◀─────│  /api/todos      │◀─────│  (开发用)     │
└─────────────────┘      └──────────────────┘      └──────────────┘
```

### 数据库表

```sql
CREATE TABLE users (
  id       SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE todos (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  text       TEXT NOT NULL,
  done       BOOLEAN NOT NULL DEFAULT false,
  priority   TEXT NOT NULL DEFAULT 'medium'
               CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API 接口

| 方法 | 路径 | 说明 | 需登录 |
|------|------|------|--------|
| `POST` | `/api/register` | 注册 | ❌ |
| `POST` | `/api/login` | 登录，返回 JWT | ❌ |
| `GET` | `/api/todos` | 获取当前用户所有待办 | ✅ |
| `POST` | `/api/todos` | 新增一条 | ✅ |
| `PUT` | `/api/todos/:id` | 修改文字/优先级 | ✅ |
| `PATCH` | `/api/todos/:id/toggle` | 切换完成状态 | ✅ |
| `DELETE` | `/api/todos/:id` | 删除一条 | ✅ |
| `DELETE` | `/api/todos/done` | 清空已完成 | ✅ |
| `DELETE` | `/api/todos/all` | 清空全部 | ✅ |

### 当前项目结构

```
package.json        根 package.json（Railway 识别为 Node 项目的关键）
server/
  index.js          入口，Express
  db.js             Prisma 客户端
  auth.js           JWT 中间件
  package.json      server 依赖管理
  routes/
    auth.js         注册/登录
    todos.js        待办 CRUD
  prisma/
    schema.prisma   数据库表定义（SQLite，url = "file:./dev.db"）
```

### 安全规则

- 密码用 `bcrypt` 加密存储
- JWT 设置 7 天过期
- 强制 HTTPS
- 每次请求校验 token，用户只能操作自己的 `user_id` 对应的数据
- 前端的 API 地址通过配置而非硬编码，不暴露后端结构
