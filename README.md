# 待办事项应用

一个简单、漂亮的待办事项网页，数据保存在浏览器中，关掉页面再打开也不会丢。

---

## 如何使用

1. 用浏览器打开 `index.html`
2. 在输入框里写下要做的事，点击"添加"或按回车键
3. 勾选复选框标记完成，文字会自动加删除线
4. 点右边的 × 按钮可以删除这条待办
5. 顶部会显示还剩多少条没完成

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
<!-- 引入样式 -->
<link rel="stylesheet" href="css/style.css">

<!-- 引入 JavaScript，顺序不能乱 -->
<script src="js/storage.js"></script>
<script src="js/todo.js"></script>
<script src="js/app.js"></script>
```

页面上的关键元素：

| 标签 | id | 作用 |
|------|----|------|
| `<input>` | `input` | 输入框，用来打字 |
| `<button>` | `addBtn` | 添加按钮 |
| `<ul>` | `todoList` | 待办列表容器 |
| `<span>` | `pendingCount` | 显示待完成数量 |
| `<span>` | `doneCount` | 显示已完成数量 |

---

### css/style.css — 样式文件

```css
/* 蓝色渐变背景 */
body { background: linear-gradient(135deg, #e0f0ff 0%, #b8daff 100%); }

/* 白色卡片：圆角 + 阴影 + 最大宽度限制（响应式） */
.container {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(30, 90, 180, 0.15);
  max-width: 520px;
}

/* 蓝色主色调 */
.input-row button { background: #4a8cf7; }        /* 按钮蓝色 */
.input-row input { border-color: #d0e2ff; }       /* 输入框蓝色边框 */
.input-row input:focus { border-color: #4a8cf7; } /* 聚焦时变深蓝 */

/* 已完成：删除线 + 灰色 */
.todo-item .text.done {
  text-decoration: line-through;
  color: #9aafcf;
}

/* 删除按钮：默认浅灰，悬停变红 */
.todo-item .del-btn:hover { color: #e05050; background: #ffe8e8; }
```

每个文件都在做一件事，方便以后修改颜色或样式。

---

### js/storage.js — 数据层

负责和浏览器的"本地存储"（localStorage）打交道。只有两个函数：

```javascript
const Storage = (function() {
  const KEY = 'todos';

  // 从 localStorage 读取数据，没有就返回空数组
  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  // 把数据存进 localStorage
  function save(todos) {
    localStorage.setItem(KEY, JSON.stringify(todos));
  }
})();
```

你可以把 `localStorage` 想象成浏览器自带的一个"小仓库"，关掉页面数据也不会丢。

---

### js/todo.js — 业务层

负责所有"待办事项"相关的逻辑。数据存在内部的 `_todos` 数组里：

```javascript
const TodoApp = (function() {
  let _todos = [];   // 内部数据，外面不能直接改

  function init()          { _todos = Storage.load(); }           // 初始化时从仓库取数据
  function getAll()        { return _todos; }                     // 获取所有待办
  function add(text)       { _todos.push({ text, done: false }); Storage.save(_todos); }  // 添加
  function toggle(index)   { _todos[index].done = !_todos[index].done; Storage.save(_todos); }  // 切换完成
  function remove(index)   { _todos.splice(index, 1); Storage.save(_todos); }              // 删除
  function getStats()      { /* 统计已完成/未完成数量 */ }
})();
```

每一条待办的数据格式：

```javascript
{ text: "买牛奶", done: false }
```

- `text` — 任务内容
- `done` — 是否已完成（`false` = 没做完，`true` = 做完了）

---

### js/app.js — 视图层

负责操作页面上的东西（DOM），让页面和数据保持同步。

核心是 **render** 函数：

```javascript
function render() {
  const todos = TodoApp.getAll();   // 从业务层拿数据
  const stats = TodoApp.getStats();

  // 1. 更新统计数字
  els.pendingCount.textContent = stats.pending;
  els.doneCount.textContent = stats.done;

  // 2. 如果没数据，显示"暂无待办事项"
  if (todos.length === 0) {
    els.list.innerHTML = '<li class="empty-msg">暂无待办事项</li>';
    return;
  }

  // 3. 有数据，根据数组内容重新生成列表 HTML
  els.list.innerHTML = todos.map((t, i) => `...`).join('');
}
```

事件绑定：

```javascript
els.addBtn.addEventListener('click', handleAdd);              // 点击添加按钮
els.input.addEventListener('keydown', function(e) { ... });   // 按回车
els.list.addEventListener('click', handleListClick);          // 点击复选框/删除按钮
```

"事件委托"：只在 `<ul>` 上监听一次点击，判断点的是复选框还是删除按钮。

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
| localStorage 的 key | `js/storage.js` 中的 `KEY` 变量 |
| 添加新功能 | 先在 `js/todo.js` 加函数，再到 `js/app.js` 调用 |

---

## 常见问题

**Q: 换浏览器或清空缓存后数据会丢吗？**

A: 会。`localStorage` 是浏览器自带的仓库，换浏览器相当于换了个仓库。

**Q: 如何在手机上看？**

A: 把 `index.html` 整个文件夹传到手机上，用浏览器打开即可。

**Q: 可以两个人共享待办列表吗？**

A: 不能。这是纯前端页面。如果需要多人共享，需要加后端服务器。

**Q: JS 文件的加载顺序为什么重要？**

A: `todo.js` 依赖 `storage.js`（用了 `Storage`），`app.js` 依赖 `todo.js`（用了 `TodoApp`）。所以加载顺序必须是 storage → todo → app。
