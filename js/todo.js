const TodoApp = (function() {
  var _todos = [];

  function priorityWeight(p) {
    if (p === 'high') return 0;
    if (p === 'medium') return 1;
    return 2;
  }

  function sort() {
    _todos.sort(function(a, b) {
      return priorityWeight(a.priority) - priorityWeight(b.priority);
    });
  }

  async function init() {
    try {
      _todos = await Api.getTodos();
      sort();
    } catch (e) {
      _todos = [];
      throw e;
    }
  }

  function getAll() {
    return _todos;
  }

  async function add(text, priority) {
    var todo = await Api.addTodo(text, priority || 'medium');
    _todos.push(todo);
    sort();
  }

  async function toggle(id) {
    await Api.toggleTodo(id);
    var todo = _todos.find(function(t) { return t.id === id; });
    if (todo) todo.done = !todo.done;
  }

  async function update(id, data) {
    var updated = await Api.updateTodo(id, data);
    var index = _todos.findIndex(function(t) { return t.id === id; });
    if (index !== -1) _todos[index] = updated;
  }

  async function remove(id) {
    await Api.deleteTodo(id);
    _todos = _todos.filter(function(t) { return t.id !== id; });
  }

  async function clearDone() {
    await Api.clearDone();
    _todos = _todos.filter(function(t) { return !t.done; });
  }

  async function clearAll() {
    await Api.clearAll();
    _todos = [];
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
