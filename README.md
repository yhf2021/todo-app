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

## 项目文件

- `index.html` — 唯一的文件，HTML / CSS / JavaScript 全写在一起
- `.gitignore` — 告诉 Git 哪些文件不需要管

---

## 代码说明（小白友好版）

### 整体结构

整个应用只有一个 `index.html`，从上到下分三大块：

### 1. HTML（页面骨架）— 第 135~147 行

这部分定义了页面上能看到的所有元素：

```html
<!-- 输入框 + 添加按钮 — 第 138~141 行 -->
<div class="input-row">
  <input id="input" type="text" placeholder="输入新的待办..." autofocus>
  <button id="addBtn">添加</button>
</div>

<!-- 统计数量 — 第 142~145 行 -->
<div class="stats">
  <span>待完成 <span class="num pending" id="pendingCount">0</span></span>
  <span>已完成 <span class="num done" id="doneCount">0</span></span>
</div>

<!-- 待办列表 — 第 146 行 -->
<ul class="todo-list" id="todoList"></ul>
```

| 标签 | 作用 |
|------|------|
| `<input id="input">` | 输入框，用来打字 |
| `<button id="addBtn">` | 添加按钮 |
| `<ul id="todoList">` | 列表容器，待办事项会动态插入到这里面 |
| `<span id="pendingCount">` | 显示还剩多少条没完成 |
| `<span id="doneCount">` | 显示已完成多少条 |

### 2. CSS（页面美颜）— 第 7~133 行

整段 `<style>` 标签里的代码都是 CSS。

```
第 7~133 行     全部 CSS 代码
```

关键样式说明：

| 代码位置 | 做了什么 |
|---------|---------|
| `第 10~12 行` `background: linear-gradient(...)` | 页面背景蓝色渐变 |
| `第 18~25 行` `.container` | 白色卡片，`border-radius` 圆角，`box-shadow` 阴影 |
| `第 24 行` `max-width: 520px` | 限制最大宽度，手机/电脑都能看（响应式） |
| `第 38~46 行` `.input-row input` | 输入框：圆角、蓝色边框 |
| `第 48~59 行` `.input-row button` | 添加按钮：蓝色背景、圆角 |
| `第 85~94 行` `.todo-item` | 每行待办：圆角、浅蓝背景 |
| `第 110~113 行` `.text.done` | 已完成文字的删除线 + 灰色 |

### 3. JavaScript（让页面动起来）— 第 148~226 行

#### 数据存在哪？— 第 149、158~165 行

数据存在浏览器的 `localStorage` 里（浏览器的"小仓库"，关掉页面也不会丢）。

```javascript
// 第 149 行
const STORAGE_KEY = 'todos';

// 第 158~161 行 — 打开页面时从仓库取数据
function loadTodos() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

// 第 163~165 行 — 数据变化时存回仓库
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
```

#### 数据长啥样？— 第 150 行

每一条待办是一个"对象"，所有待办放在一个"数组"里：

```javascript
// 第 150 行
let todos = loadTodos();   // 开始时: [] 空数组
                            // 添加后: [{ text: "买牛奶", done: false }, ...]
```

- `text` — 任务的内容
- `done` — 是否已完成（`false` 没做完，`true` 做完了）

#### 三个核心操作 — 第 193~213 行

```javascript
// 第 193~201 行 — 添加
function addTodo() {
  const text = input.value.trim();
  if (!text) return;
  todos.push({ text, done: false });  // 塞进数组
  saveTodos();                         // 存仓库
  render();                            // 刷新页面
  input.value = '';                    // 清空输入框
  input.focus();                       // 光标回到输入框
}

// 第 203~207 行 — 切换完成状态
function toggleTodo(index) {
  todos[index].done = !todos[index].done;  // true→false, false→true
  saveTodos();
  render();
}

// 第 209~213 行 — 删除
function deleteTodo(index) {
  todos.splice(index, 1);  // 从数组里移除这一项
  saveTodos();
  render();
}
```

#### 渲染 render() — 第 167~185 行

```javascript
function render() {
  // 第 168~171 行 — 统计数量，更新到顶部显示
  const pending = todos.filter(t => !t.done).length;
  const done = todos.filter(t => t.done).length;
  pendingCount.textContent = pending;
  doneCount.textContent = done;

  // 第 173~176 行 — 如果数组空，显示"暂无"
  if (todos.length === 0) {
    list.innerHTML = '<li class="empty-msg">暂无待办事项</li>';
    return;
  }

  // 第 178~184 行 — 根据数组内容生成列表 HTML
  list.innerHTML = todos.map((t, i) => `
    <li class="todo-item">
      <input type="checkbox" ${t.done ? 'checked' : ''} data-index="${i}">
      <span class="text${t.done ? ' done' : ''}">${escapeHtml(t.text)}</span>
      <button class="del-btn" data-index="${i}" title="删除">&times;</button>
    </li>
  `).join('');
}
```

每次添加/切换/删除都会调用 `render()`，让页面和数据保持一致。

#### 事件监听 — 第 215~223 行

```javascript
// 第 215 行 — 点击"添加"按钮
addBtn.addEventListener('click', addTodo);

// 第 216 行 — 在输入框按回车
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});

// 第 218~223 行 — 事件委托：在列表上统一监听点击
list.addEventListener('click', e => {
  const checkbox = e.target.closest('input[type="checkbox"]');
  const delBtn = e.target.closest('.del-btn');
  if (checkbox) toggleTodo(+checkbox.dataset.index);
  if (delBtn) deleteTodo(+delBtn.dataset.index);
});
```

"事件委托"的意思是：不在每个复选框/删除按钮上单独绑监听，只在 `<ul>` 上绑一个，点的时候判断点的是哪个元素。

---

## 如果想修改

| 想改什么 | 在哪里改 |
|---------|---------|
| 标题文字 | 找到 `<h1>` 标签 |
| 主题颜色 | 搜索 `#4a8cf7`（蓝色主色），替换成喜欢的颜色 |
| 本地存储的 key | 找到 `STORAGE_KEY = 'todos'` 改成别的名字 |

---

## 常见问题

**Q: 换浏览器或清空缓存后数据会丢吗？**

A: 会。`localStorage` 是浏览器自带的仓库，换浏览器相当于换了个仓库。清空浏览器数据也会清空。

**Q: 如何在手机上看？**

A: 把 `index.html` 传到手机上，用浏览器打开即可。

**Q: 可以两个人共享待办列表吗？**

A: 不能。这是一个纯前端页面，数据只存在你自己的浏览器里。如果需要多人共享，需要加上后端服务器和数据库。
