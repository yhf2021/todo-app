const App = (function() {
  var els = {};
  var editingIndex = null;
  var hintTimer = null;

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ---- 登录/注册 ----

  function showLogin() {
    els.authSection.style.display = 'block';
    els.todoSection.style.display = 'none';
    els.authError.textContent = '';
  }

  function showTodos() {
    els.authSection.style.display = 'none';
    els.todoSection.style.display = 'block';
  }

  async function handleLogin() {
    var username = els.authUser.value.trim();
    var password = els.authPass.value.trim();
    if (!username || !password) {
      els.authError.textContent = '请输入用户名和密码';
      return;
    }
    els.authError.textContent = '';
    try {
      var result = await Api.login(username, password);
      localStorage.setItem('token', result.token);
      await TodoApp.init();
      showTodos();
      render();
    } catch (e) {
      els.authError.textContent = e.message;
    }
  }

  async function handleRegister() {
    var username = els.authUser.value.trim();
    var password = els.authPass.value.trim();
    if (!username || !password) {
      els.authError.textContent = '请输入用户名和密码';
      return;
    }
    els.authError.textContent = '';
    try {
      var result = await Api.register(username, password);
      localStorage.setItem('token', result.token);
      await TodoApp.init();
      showTodos();
      render();
    } catch (e) {
      els.authError.textContent = e.message;
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    showLogin();
  }

  // ---- 待办操作 ----

  function render() {
    var todos = TodoApp.getAll();
    var stats = TodoApp.getStats();

    els.pendingCount.textContent = stats.pending;
    els.doneCount.textContent = stats.done;

    els.clearBtn.classList.toggle('show', stats.done > 0);
    els.clearAllBtn.classList.toggle('show', todos.length > 0);

    if (todos.length === 0) {
      els.list.innerHTML =
        '<li class="empty-msg">' +
          '<span class="icon">🎉</span>' +
          '今天还没有任务哦～<br>快来添加第一条吧！' +
        '</li>';
      return;
    }

    var html = '';
    for (var i = 0; i < todos.length; i++) {
      var t = todos[i];
      var isEditing = (editingIndex === i);
      var priority = t.priority || 'medium';

      html += '<li class="todo-item priority-' + priority + (isEditing ? ' editing' : '') + '">';
      html += '<input type="checkbox" ' + (t.done ? 'checked' : '') + ' data-index="' + i + '" data-id="' + t.id + '">';

      if (isEditing) {
        html += '<input class="edit-input" value="' + escapeHtml(t.text) + '" data-index="' + i + '" data-id="' + t.id + '">';
      } else {
        html += '<span class="text' + (t.done ? ' done' : '') + '">' + escapeHtml(t.text) + '</span>';
      }

      html += '<button class="edit-btn" data-index="' + i + '" data-id="' + t.id + '" title="编辑">✏️</button>';
      html += '<button class="del-btn" data-index="' + i + '" data-id="' + t.id + '" title="删除">&times;</button>';
      html += '</li>';
    }
    els.list.innerHTML = html;

    if (editingIndex !== null) {
      var editInput = els.list.querySelector('.edit-input');
      if (editInput) {
        editInput.focus();
        editInput.setSelectionRange(editInput.value.length, editInput.value.length);
      }
    }
  }

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

  async function handleAdd() {
    var text = els.input.value.trim();
    if (!text) {
      showHint();
      return;
    }
    hideHint();
    try {
      await TodoApp.add(text, els.prioritySelect.value);
      render();
      els.input.value = '';
      els.input.focus();
    } catch (e) {
      alert('添加失败: ' + e.message);
    }
  }

  function handleEditClick(index) {
    if (editingIndex === index) return;
    editingIndex = index;
    render();
  }

  async function saveEdit(index, text, id) {
    text = text.trim();
    if (text) {
      try {
        await TodoApp.update(id, { text: text });
      } catch (e) {
        alert('保存失败: ' + e.message);
      }
    }
    editingIndex = null;
    render();
  }

  function cancelEdit() {
    editingIndex = null;
    render();
  }

  async function handleClearDone() {
    try {
      await TodoApp.clearDone();
      render();
    } catch (e) {
      alert('操作失败: ' + e.message);
    }
  }

  async function handleClearAll() {
    if (confirm('确定要清空全部待办事项吗？此操作不可撤销。')) {
      try {
        await TodoApp.clearAll();
        editingIndex = null;
        render();
      } catch (e) {
        alert('操作失败: ' + e.message);
      }
    }
  }

  async function handleListClick(e) {
    var checkbox = e.target.closest('input[type="checkbox"]');
    var delBtn = e.target.closest('.del-btn');
    var editBtn = e.target.closest('.edit-btn');

    if (checkbox && editingIndex === null) {
      try {
        await TodoApp.toggle(+checkbox.dataset.id);
        render();
      } catch (e) {
        alert('操作失败: ' + e.message);
      }
    }

    if (delBtn) {
      var id = +delBtn.dataset.id;
      var idx = +delBtn.dataset.index;
      try {
        await TodoApp.remove(id);
        if (editingIndex !== null) {
          if (editingIndex === idx) {
            editingIndex = null;
          } else if (editingIndex > idx) {
            editingIndex--;
          }
        }
        render();
      } catch (e) {
        alert('操作失败: ' + e.message);
      }
    }

    if (editBtn) {
      handleEditClick(+editBtn.dataset.index);
    }
  }

  function handleListKeydown(e) {
    if (editingIndex === null) return;
    var editInput = e.target.closest('.edit-input');
    if (!editInput) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(editingIndex, editInput.value, +editInput.dataset.id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  }

  async function init() {
    els.input = document.getElementById('input');
    els.addBtn = document.getElementById('addBtn');
    els.list = document.getElementById('todoList');
    els.pendingCount = document.getElementById('pendingCount');
    els.doneCount = document.getElementById('doneCount');
    els.hint = document.getElementById('hint');
    els.clearBtn = document.getElementById('clearBtn');
    els.clearAllBtn = document.getElementById('clearAllBtn');
    els.prioritySelect = document.getElementById('prioritySelect');

    els.authSection = document.getElementById('authSection');
    els.todoSection = document.getElementById('todoSection');
    els.authUser = document.getElementById('authUser');
    els.authPass = document.getElementById('authPass');
    els.authError = document.getElementById('authError');

    els.loginBtn = document.getElementById('loginBtn');
    els.registerBtn = document.getElementById('registerBtn');
    els.logoutBtn = document.getElementById('logoutBtn');

    var token = localStorage.getItem('token');
    if (token) {
      try {
        await TodoApp.init();
        showTodos();
        render();
      } catch (e) {
        localStorage.removeItem('token');
        showLogin();
      }
    } else {
      showLogin();
    }

    els.addBtn.addEventListener('click', handleAdd);
    els.input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleAdd();
    });
    els.input.addEventListener('input', hideHint);
    els.list.addEventListener('click', handleListClick);
    els.list.addEventListener('keydown', handleListKeydown);
    els.clearBtn.addEventListener('click', handleClearDone);
    els.clearAllBtn.addEventListener('click', handleClearAll);
    els.loginBtn.addEventListener('click', handleLogin);
    els.registerBtn.addEventListener('click', handleRegister);
    els.logoutBtn.addEventListener('click', handleLogout);
  }

  return { init: init, showLogin: showLogin };
})();

document.addEventListener('DOMContentLoaded', App.init);
