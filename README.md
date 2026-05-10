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
index.html          页面骨架
css/
  style.css         样式文件
js/
  storage.js        数据存储（localStorage）
  todo.js           业务逻辑（增删改查）
  app.js            页面交互（渲染 + 事件）
AGENTS.md           技术文档（架构、代码说明）
README.md           本文件
```

详细代码说明和技术架构请见 [AGENTS.md](AGENTS.md)。

---

## 如果想修改

| 想改什么 | 在哪里改 |
|---------|---------|
| 标题文字 | `index.html` 中的 `<h1>` 标签 |
| 主题颜色 | `css/style.css` 中搜索 `#4a8cf7` |
| 优先级颜色 | `css/style.css` 中搜索 `.priority-` |
| 优先级选项 | `index.html` 中 `<select id="prioritySelect">` |
| localStorage key | `js/storage.js` 中的 `KEY` 变量 |
| 空状态提示 | `js/app.js` 中 `render()` 的 `empty-msg` |
| 清空确认文案 | `js/app.js` 中 `handleClearAll` 的 `confirm(...)` |
| 添加新功能 | 先在 `js/todo.js` 加函数，再到 `js/app.js` 调用 |

---

## 常见问题

**Q: 换浏览器或清空缓存后数据会丢吗？**

A: 会。`localStorage` 是浏览器自带的仓库，换浏览器相当于换了个仓库。

**Q: 如何在手机上看？**

A: 把整个文件夹传到手机上，用浏览器打开 `index.html` 即可。

**Q: 可以两个人共享待办列表吗？**

A: 当前不能。这是纯前端页面。多设备共享方案见 [AGENTS.md](AGENTS.md) 中的后端设计。

**Q: JS 文件的加载顺序为什么重要？**

A: `todo.js` 依赖 `storage.js`（用了 `Storage`），`app.js` 依赖 `todo.js`（用了 `TodoApp`）。所以加载顺序必须是 storage → todo → app。

---

## 在线预览

已部署在 GitHub Pages：https://yhf2021.github.io/todo-app
