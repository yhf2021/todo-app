const App = (function() {
  var els = {};
  var editingIndex = null;
  var hintTimer = null;

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

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
      html += '<input type="checkbox" ' + (t.done ? 'checked' : '') + ' data-index="' + i + '">';

      if (isEditing) {
        html += '<input class="edit-input" value="' + escapeHtml(t.text) + '" data-index="' + i + '">';
      } else {
        html += '<span class="text' + (t.done ? ' done' : '') + '">' + escapeHtml(t.text) + '</span>';
      }

      html += '<button class="edit-btn" data-index="' + i + '" title="编辑">✏️</button>';
      html += '<button class="del-btn" data-index="' + i + '" title="删除">&times;</button>';
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

  function handleAdd() {
    var text = els.input.value.trim();
    if (!text) {
      showHint();
      return;
    }
    hideHint();
    TodoApp.add(text, els.prioritySelect.value);
    render();
    els.input.value = '';
    els.input.focus();
  }

  function handleEditClick(index) {
    if (editingIndex === index) return;
    editingIndex = index;
    render();
  }

  function saveEdit(index, text) {
    text = text.trim();
    if (text) {
      TodoApp.update(index, { text: text });
    }
    editingIndex = null;
    render();
  }

  function cancelEdit() {
    editingIndex = null;
    render();
  }

  function handleClearDone() {
    TodoApp.clearDone();
    render();
  }

  function handleClearAll() {
    if (confirm('确定要清空全部待办事项吗？此操作不可撤销。')) {
      TodoApp.clearAll();
      editingIndex = null;
      render();
    }
  }

  function handleListClick(e) {
    var checkbox = e.target.closest('input[type="checkbox"]');
    var delBtn = e.target.closest('.del-btn');
    var editBtn = e.target.closest('.edit-btn');

    if (checkbox && editingIndex === null) {
      TodoApp.toggle(+checkbox.dataset.index);
      render();
    }

    if (delBtn) {
      var idx = +delBtn.dataset.index;
      TodoApp.remove(idx);
      if (editingIndex !== null) {
        if (editingIndex === idx) {
          editingIndex = null;
        } else if (editingIndex > idx) {
          editingIndex--;
        }
      }
      render();
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
      saveEdit(editingIndex, editInput.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  }

  function init() {
    els.input = document.getElementById('input');
    els.addBtn = document.getElementById('addBtn');
    els.list = document.getElementById('todoList');
    els.pendingCount = document.getElementById('pendingCount');
    els.doneCount = document.getElementById('doneCount');
    els.hint = document.getElementById('hint');
    els.clearBtn = document.getElementById('clearBtn');
    els.clearAllBtn = document.getElementById('clearAllBtn');
    els.prioritySelect = document.getElementById('prioritySelect');

    TodoApp.init();

    els.addBtn.addEventListener('click', handleAdd);
    els.input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleAdd();
    });
    els.input.addEventListener('input', hideHint);
    els.list.addEventListener('click', handleListClick);
    els.list.addEventListener('keydown', handleListKeydown);
    els.clearBtn.addEventListener('click', handleClearDone);
    els.clearAllBtn.addEventListener('click', handleClearAll);

    render();
  }

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', App.init);
