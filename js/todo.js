const TodoApp = (function() {
  let _todos = [];

  function init() {
    _todos = Storage.load();
  }

  function getAll() {
    return _todos;
  }

  function add(text) {
    _todos.push({ text, done: false });
    Storage.save(_todos);
  }

  function toggle(index) {
    _todos[index].done = !_todos[index].done;
    Storage.save(_todos);
  }

  function remove(index) {
    _todos.splice(index, 1);
    Storage.save(_todos);
  }

  function clearDone() {
    _todos = _todos.filter(t => !t.done);
    Storage.save(_todos);
  }

  function getStats() {
    const total = _todos.length;
    const done = _todos.filter(t => t.done).length;
    const pending = total - done;
    return { total, pending, done };
  }

  return { init, getAll, add, toggle, remove, clearDone, getStats };
})();
