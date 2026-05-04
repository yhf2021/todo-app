const App = (function() {
  let els = {};

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function render() {
    const todos = TodoApp.getAll();
    const stats = TodoApp.getStats();

    els.pendingCount.textContent = stats.pending;
    els.doneCount.textContent = stats.done;

    if (todos.length === 0) {
      els.list.innerHTML = '<li class="empty-msg">暂无待办事项</li>';
      return;
    }

    els.list.innerHTML = todos.map((t, i) => `
      <li class="todo-item">
        <input type="checkbox" ${t.done ? 'checked' : ''} data-index="${i}">
        <span class="text${t.done ? ' done' : ''}">${escapeHtml(t.text)}</span>
        <button class="del-btn" data-index="${i}" title="删除">&times;</button>
      </li>
    `).join('');
  }

  let hintTimer = null;

  function showHint() {
    els.hint.classList.add('show');
    els.input.classList.add('error');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function() {
      els.hint.classList.remove('show');
      els.input.classList.remove('error');
    }, 2000);
  }

  function hideHint() {
    els.hint.classList.remove('show');
    els.input.classList.remove('error');
    clearTimeout(hintTimer);
  }

  function handleAdd() {
    const text = els.input.value.trim();
    if (!text) {
      showHint();
      return;
    }
    hideHint();
    TodoApp.add(text);
    render();
    els.input.value = '';
    els.input.focus();
  }

  function handleListClick(e) {
    const checkbox = e.target.closest('input[type="checkbox"]');
    const delBtn = e.target.closest('.del-btn');
    if (checkbox) {
      TodoApp.toggle(+checkbox.dataset.index);
      render();
    }
    if (delBtn) {
      TodoApp.remove(+delBtn.dataset.index);
      render();
    }
  }

  function init() {
    els.input = document.getElementById('input');
    els.addBtn = document.getElementById('addBtn');
    els.list = document.getElementById('todoList');
    els.pendingCount = document.getElementById('pendingCount');
    els.doneCount = document.getElementById('doneCount');
    els.hint = document.getElementById('hint');

    TodoApp.init();

    els.addBtn.addEventListener('click', handleAdd);
    els.input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleAdd();
    });
    els.input.addEventListener('input', hideHint);
    els.list.addEventListener('click', handleListClick);

    render();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
