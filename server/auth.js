const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'todo-dev-secret';

function authMiddleware(req, res, next) {
  var header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }
  try {
    var token = header.split(' ')[1];
    var decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'token 无效或已过期' });
  }
}

module.exports = { authMiddleware, SECRET };
