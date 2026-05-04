const TodoApp = (function() {
  let _todos = [];

  function init() {
    _todos = Storage.load();
    let migrated = false;
    _todos = _todos.map(function(t) {
      if (!t.priority) {
        migrated = true;
        return { text: t.text, done: t.done, priority: 'medium' };
      }
      return t;
    });
    if (migrated) Storage.save(_todos);
  }

  function getAll() {
    return _todos;
  }

  function add(text, priority) {
    _todos.push({ text, done: false, priority: priority || 'medium' });
    Storage.save(_todos);
  }

  function toggle(index) {
    _todos[index].done = !_todos[index].done;
    Storage.save(_todos);
  }

  function update(index, data) {
    if (data.text !== undefined) _todos[index].text = data.text;
    if (data.priority !== undefined) _todos[index].priority = data.priority;
    Storage.save(_todos);
  }

  function remove(index) {
    _todos.splice(index, 1);
    Storage.save(_todos);
  }

  function clearDone() {
    _todos = _todos.filter(function(t) { return !t.done; });
    Storage.save(_todos);
  }

  function clearAll() {
    _todos = [];
    Storage.save(_todos);
  }

  function getStats() {
    var total = _todos.length;
    var done = _todos.filter(function(t) { return t.done; }).length;
    var pending = total - done;
    return { total: total, pending: pending, done: done };
  }

  return {
    init: init,
    getAll: getAll,
    add: add,
    toggle: toggle,
    update: update,
    remove: remove,
    clearDone: clearDone,
    clearAll: clearAll,
    getStats: getStats
  };
})();
