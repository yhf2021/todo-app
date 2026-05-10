const express = require('express');
const cors = require('cors');
const path = require('path');

var app = express();

app.use(cors());
app.use(express.json());

// API 路由
app.use('/api', require('./routes/auth'));
app.use('/api/todos', require('./routes/todos'));

// 静态文件托管（部署时可选）
app.use(express.static(path.join(__dirname, '..')));

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('Todo 服务已启动: http://localhost:' + PORT);
});
