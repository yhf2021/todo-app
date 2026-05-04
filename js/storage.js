const Storage = (function() {
  const KEY = 'todos';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function save(todos) {
    localStorage.setItem(KEY, JSON.stringify(todos));
  }

  return { load, save };
})();
