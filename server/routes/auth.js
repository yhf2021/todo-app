const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { SECRET } = require('../auth');

var router = express.Router();

router.post('/register', async function(req, res) {
  try {
    var { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    var hash = await bcrypt.hash(password, 10);
    var user = await prisma.user.create({
      data: { username: username, password: hash }
    });
    var token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '7d' });
    res.json({ token: token });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(400).json({ error: '用户名已存在' });
    }
    res.status(500).json({ error: '注册失败' });
  }
});

router.post('/login', async function(req, res) {
  try {
    var { username, password } = req.body;
    var user = await prisma.user.findUnique({ where: { username: username } });
    if (!user) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }
    var ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }
    var token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '7d' });
    res.json({ token: token });
  } catch (e) {
    res.status(500).json({ error: '登录失败' });
  }
});

module.exports = router;
