# 待办事项应用

一个简单、漂亮的待办事项网页，数据保存在浏览器中，关掉页面再打开也不会丢。

---

## 如何使用

1. 用浏览器打开 `index.html`
2. 在输入框里写下要做的事，选择优先级（🔴高/🟡中/🟢低），点击"添加"或按回车
3. 勾选复选框标记完成，文字会自动加删除线
4. 悬停任务项，点 ✏️ 编辑文字，点 × 删除这条待办
5. 编辑时按 Enter 保存、Esc 取消
6. 底部可一键清空已完成或清空全部（有确认提示）
7. 顶部会显示还剩多少条没完成

---

## 项目结构

```
index.html          页面骨架（仅 HTML，没有样式和脚本）
css/
  style.css         样式（颜色、圆角、阴影、响应式）
js/
  storage.js        数据层（localStorage 读写）
  todo.js           业务层（待办事项的增删改查）
  app.js            视图层（渲染页面、事件绑定）
.gitignore          Git 忽略规则
README.md           本文件
```

---

## 代码说明（小白友好版）

### index.html — 页面骨架

只包含 HTML 标签，没有任何样式和 JavaScript。通过下面两行引入外部文件：

```html
<link rel="stylesheet" href="css/style.css">

<!-- js 加载顺序：storage → todo → app -->
<script src="js/storage.js"></script>
<script src="js/todo.js"></script>
<script src="js/app.js"></script>
```

页面上的关键元素：

| 标签 | id | 作用 |
|------|----|------|
| `<input>` | `input` | 输入框，用来打字 |
| `<select>` | `prioritySelect` | 选择任务优先级（高/中/低） |
| `<button>` | `addBtn` | 添加按钮 |
| `<ul>` | `todoList` | 待办列表容器 |
| `<span>` | `pendingCount` | 显示待完成数量 |
| `<span>` | `doneCount` | 显示已完成数量 |
| `<div>` | `hint` | 空输入提示（红色，自动消失） |
| `<button>` | `clearBtn` | 清空已完成（有已完成项时才显示） |
| `<button>` | `clearAllBtn` | 清空全部（有任务时才显示） |

---

### css/style.css — 样式文件

```css
/* 浅蓝→浅紫渐变背景 */
body { background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%); }

/* 白色卡片：圆角 + 阴影 + 最大宽度限制 */
.container { border-radius: 16px; box-shadow: 0 8px 32px rgba(...); max-width: 540px; }

/* 优先级颜色：左侧彩色边框 */
.todo-item.priority-high   { border-left-color: #e05050; }  /* 红 */
.todo-item.priority-medium { border-left-color: #f0a030; }  /* 橙 */
.todo-item.priority-low    { border-left-color: #2d9f5e; }  /* 绿 */

/* 编辑模式：黄色背景 + 蓝色边框 */
.todo-item.editing { background: #fffbe6; border-left-color: #4a8cf7; }

/* 编辑输入框 */
.todo-item .edit-input { border: 2px solid #4a8cf7; border-radius: 6px; }

/* 操作按钮（编辑/删除/清空） */
.edit-btn:hover { color: #4a8cf7; background: #e8f0fe; }
.del-btn:hover  { color: #e05050; background: #ffe8e8; }
```

---

### js/storage.js — 数据层

负责和浏览器的本地存储（localStorage）打交道。只有两个函数：

```javascript
const Storage = (function() {
  const KEY = 'todos';

  function load() {           // 从 localStorage 读取数据
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }

  function save(todos) {      // 把数据存进 localStorage
    localStorage.setItem(KEY, JSON.stringify(todos));
  }
})();
```

---

### js/todo.js — 业务层

负责所有"待办事项"相关的逻辑：

```javascript
const TodoApp = (function() {
  let _todos = [];

  function init()        { _todos = Storage.load(); /* + 旧数据迁移 */ }
  function getAll()      { return _todos; }
  function add(text, priority)   { _todos.push({ text, done: false, priority }); save; }
  function toggle(index) { _todos[index].done = !_todos[index].done; save; }
  function update(index, data)   { /* 修改 text 或 priority */ save; }
  function remove(index) { _todos.splice(index, 1); save; }
  function clearDone()   { _todos = _todos.filter(t => !t.done); save; }
  function clearAll()    { _todos = []; save; }
  function getStats()    { /* 返回 { total, pending, done } */ }
})();
```

每条待办的数据格式：

```javascript
{ text: "买牛奶", done: false, priority: "medium" }
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `text` | string | 任务内容 |
| `done` | boolean | 是否已完成 |
| `priority` | string | `"high"` / `"medium"` / `"low"` |

---

### js/app.js — 视图层

负责操作页面上的 DOM，让页面和数据保持同步。

**render 函数** — 每次数据变化都会调用：

```javascript
function render() {
  var todos = TodoApp.getAll();
  var stats = TodoApp.getStats();

  // 1. 更新统计数字 + 按钮显隐
  els.pendingCount.textContent = stats.pending;
  els.doneCount.textContent = stats.done;
  els.clearBtn.classList.toggle('show', stats.done > 0);
  els.clearAllBtn.classList.toggle('show', todos.length > 0);

  // 2. 空列表 → 友好提示
  if (todos.length === 0) {
    els.list.innerHTML = '<li class="empty-msg">🎉 今天还没有任务哦～<br>快来添加第一条吧！</li>';
    return;
  }

  // 3. 根据数组内容生成列表 HTML（带优先级颜色、编辑/删除按钮）
  var html = '';
  for (var i = 0; i < todos.length; i++) { ... }
  els.list.innerHTML = html;

  // 4. 如果在编辑状态，聚焦到输入框
  if (editingIndex !== null) {
    var editInput = els.list.querySelector('.edit-input');
    if (editInput) { editInput.focus(); }
  }
}
```

**事件绑定：**

```javascript
els.addBtn.addEventListener('click', handleAdd);              // 点击添加
els.input.addEventListener('keydown', enterHandler);           // 按回车添加
els.input.addEventListener('input', hideHint);                // 打字隐藏错误提示
els.list.addEventListener('click', handleListClick);          // 点击复选/编辑/删除
els.list.addEventListener('keydown', handleListKeydown);      // 编辑时 Enter/Esc
els.clearBtn.addEventListener('click', handleClearDone);      // 清空已完成
els.clearAllBtn.addEventListener('click', handleClearAll);    // 清空全部（有 confirm）
```

几个关键交互逻辑：

| 操作 | 行为 |
|------|------|
| 输入为空点添加 | 输入框变红 + 提示"请输入待办内容"，2秒消失 |
| 点击 ✏️ 编辑 | 文字变为输入框，黄色高亮行 |
| 编辑时按 Enter | 保存文字 |
| 编辑时按 Esc | 取消修改 |
| 点击复选框 | 切换完成状态（编辑时不允许切换） |
| 清空全部 | 弹出 `confirm` 确认框，防止误操作 |
| 删除正在编辑的项 | 自动退出编辑状态 |

---

### 三个文件的关系（数据流）

```
用户操作（点击/输入）
       │
       ▼
  app.js（视图层）
   ── 调用 TodoApp.xxx() ──►  todo.js（业务层）
                                 ── 修改 _todos 数组
                                 ── 调用 Storage.save() ──►  storage.js（数据层）
                                                               ── 写入 localStorage
  app.js（视图层）
   ── render() 刷新页面 ◄── 取自 TodoApp.getAll()
```

简单说：**用户操作 → 改数据 → 存仓库 → 刷新页面**。

---

## 如果想修改

| 想改什么 | 在哪里改 |
|---------|---------|
| 标题文字 | `index.html` 中的 `<h1>` 标签 |
| 主题颜色 | `css/style.css` 中搜索 `#4a8cf7` |
| 优先级颜色 | `css/style.css` 中搜索 `.priority-high` / `.priority-medium` / `.priority-low` |
| 优先级选项 | `index.html` 中 `<select id="prioritySelect">` 里的 `<option>` |
| localStorage 的 key | `js/storage.js` 中的 `KEY` 变量 |
| 空状态提示文字 | `js/app.js` 中 `render()` 函数的 `empty-msg` |
| 清空全部确认文案 | `js/app.js` 中 `handleClearAll` 的 `confirm(...)` |
| 添加新功能 | 先在 `js/todo.js` 加函数，再到 `js/app.js` 调用 |

---

---

## 后端设计文档（多设备数据共享）

当前版本的数据只存在浏览器本地。下面是改造为"多设备共享"的技术方案。

### 整体架构

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────┐
│  浏览器 (前端)    │─────▶│  后端 API 服务器  │─────▶│   数据库      │
│  index.html      │ HTTP │  Node.js/Express │ SQL  │  PostgreSQL  │
│  js/app.js       │◀─────│  /api/todos      │◀─────│  /  MySQL     │
└─────────────────┘      └──────────────────┘      └──────────────┘
```

- **前端**：现有代码基本不变，`storage.js` 改为调用后端 API
- **后端**：新写一个 Node.js 服务，提供 RESTful 接口
- **数据库**：存储所有用户的待办数据

### 技术选型

| 层 | 技术 | 原因 |
|---|------|------|
| 后端框架 | **Node.js + Express** | 前端开发者直接用 JavaScript，上手快 |
| 数据库 | **PostgreSQL**（生产）或 **SQLite**（开发/演示） | 关系型数据库，数据结构稳定 |
| ORM | **Prisma** | 不用手写 SQL，自动建表、类型安全 |
| 认证 | **JWT**（JSON Web Token） | 无状态，简单易用 |
| 部署 | **Railway / Render / Vercel** | 免费套餐足够个人项目使用 |

### 数据库表结构

```sql
-- 用户表
CREATE TABLE users (
  id       SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL          -- 加密存储（bcrypt）
);

-- 待办事项表
CREATE TABLE todos (
  id        SERIAL PRIMARY KEY,
  user_id   INTEGER NOT NULL REFERENCES users(id),
  text      TEXT NOT NULL,
  done      BOOLEAN NOT NULL DEFAULT false,
  priority  TEXT NOT NULL DEFAULT 'medium'
              CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API 接口设计

| 方法 | 路径 | 说明 | 是否需要登录 |
|------|------|------|------------|
| `POST` | `/api/register` | 注册新用户 | ❌ |
| `POST` | `/api/login` | 登录，返回 JWT | ❌ |
| `GET` | `/api/todos` | 获取当前用户所有待办 | ✅ |
| `POST` | `/api/todos` | 新增一条待办 | ✅ |
| `PUT` | `/api/todos/:id` | 修改待办（文字/优先级） | ✅ |
| `PATCH` | `/api/todos/:id/toggle` | 切换完成状态 | ✅ |
| `DELETE` | `/api/todos/:id` | 删除一条待办 | ✅ |
| `DELETE` | `/api/todos/done` | 清空已完成 | ✅ |
| `DELETE` | `/api/todos/all` | 清空全部 | ✅ |

### 请求与响应示例

```
POST /api/register
请求: { "username": "alice", "password": "123456" }
响应: { "token": "eyJhbGciOiJIUzI1NiIs..." }

POST /api/login
请求: { "username": "alice", "password": "123456" }
响应: { "token": "eyJhbGciOiJIUzI1NiIs..." }

GET /api/todos
请求头: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
响应: [
  { "id": 1, "text": "买牛奶", "done": false, "priority": "high" },
  { "id": 2, "text": "写作业", "done": true, "priority": "medium" }
]

POST /api/todos
请求头: Authorization: Bearer ...
请求: { "text": "去跑步", "priority": "low" }
响应: { "id": 3, "text": "去跑步", "done": false, "priority": "low" }
```

### 数据流变化

改造后，前端不再读写 `localStorage`，改为调 API：

```
用户操作（点击/输入）
       │
       ▼
  app.js ──调用──▶  api.js（新增） ──HTTP──▶ 后端服务器 ──SQL──▶ 数据库
       │                 │
       │          统一管理所有请求         response 返回最新数据
       │                 │
       ▼                 ▼
  render() 刷新页面 ◄────┘
```

### 前端需要修改的部分

| 现有文件 | 改动 |
|---------|------|
| `js/storage.js` | **删掉**，不再使用 `localStorage` |
| `js/todo.js` | `add/toggle/remove/clearDone/clearAll` 改为异步调 API |
| `js/app.js` | 加上登录/注册页面，保存 JWT token |
| `js/api.js` | **新建**，统一封装 `fetch` 请求，自动携带 token |
| `index.html` | 增加登录/注册表单 |

### 改造后的项目结构

```
index.html
css/style.css
js/
  api.js          ← 新增：封装所有 HTTP 请求
  todo.js         ← 修改：调 API 而非 localStorage
  app.js          ← 修改：增加登录/注册逻辑
storage.js        ← 删除
server/             ← 新增：后端代码
  index.js        入口，Express 服务器
  db.js           Prisma 数据库连接
  auth.js         JWT 鉴权中间件
  routes/
    auth.js       注册/登录接口
    todos.js      待办 CRUD 接口
```

### 部署方式

后端和前端可以分开部署，也可以合并部署：

**方案 A：前后端分离（推荐）**

| 服务 | 部署平台 | 地址 |
|------|---------|------|
| 前端（HTML/CSS/JS） | GitHub Pages | `https://yhf2021.github.io/todo-app` |
| 后端 API（Node.js） | Railway / Render | `https://todo-api.xxx.com` |

前端通过环境变量或配置指定后端地址。

**方案 B：单体部署**

把前后端放在一起，用 Express 直接托管 `index.html` 和静态文件，部署到单一平台。

### 安全注意事项

- 密码**绝不**明文存储，使用 `bcrypt` 加密
- JWT 设置过期时间（如 7 天）
- API 使用 HTTPS（部署平台自动提供）
- 每个请求校验 token，用户只能操作自己的数据
- 前端不暴露后端数据库结构

---

## 常见问题

**Q: 换浏览器或清空缓存后数据会丢吗？**

A: 会。`localStorage` 是浏览器自带的仓库，换浏览器相当于换了个仓库。

**Q: 如何在手机上看？**

A: 把整个文件夹传到手机上，用浏览器打开 `index.html` 即可。

**Q: 可以两个人共享待办列表吗？**

A: 不能。这是纯前端页面。如果需要多人共享，需要加后端服务器。

**Q: JS 文件的加载顺序为什么重要？**

A: `todo.js` 依赖 `storage.js`（用了 `Storage`），`app.js` 依赖 `todo.js`（用了 `TodoApp`）。所以加载顺序必须是 storage → todo → app。
