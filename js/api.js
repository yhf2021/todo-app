const Api = (function() {
  var BASE_URL = window.location.origin + '/api';
  // 如果前后端分离部署，改为后端地址：
  // var BASE_URL = 'https://todo-api.xxx.com/api';

  function getToken() {
    return localStorage.getItem('token');
  }

  function clearToken() {
    localStorage.removeItem('token');
  }

  async function request(method, path, body) {
    var headers = { 'Content-Type': 'application/json' };
    var token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    var options = { method: method, headers: headers };
    if (body) options.body = JSON.stringify(body);

    var res = await fetch(BASE_URL + path, options);
    if (res.status === 401) {
      clearToken();
      throw new Error('登录已过期');
    }
    if (!res.ok) {
      var err = await res.json().catch(function() { return { error: '请求失败' }; });
      throw new Error(err.error || '请求失败');
    }
    return res.json();
  }

  return {
    setBaseUrl: function(url) { BASE_URL = url; },
    register: function(username, password) { return request('POST', '/register', { username: username, password: password }); },
    login: function(username, password) { return request('POST', '/login', { username: username, password: password }); },
    getTodos: function() { return request('GET', '/todos'); },
    addTodo: function(text, priority) { return request('POST', '/todos', { text: text, priority: priority }); },
    updateTodo: function(id, data) { return request('PUT', '/todos/' + id, data); },
    toggleTodo: function(id) { return request('PATCH', '/todos/' + id + '/toggle'); },
    deleteTodo: function(id) { return request('DELETE', '/todos/' + id); },
    clearDone: function() { return request('DELETE', '/todos/done'); },
    clearAll: function() { return request('DELETE', '/todos/all'); }
  };
})();
