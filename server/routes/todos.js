const express = require('express');
const prisma = require('../db');
const { authMiddleware } = require('../auth');

var router = express.Router();

router.use(authMiddleware);

router.get('/', async function(req, res) {
  var todos = await prisma.todo.findMany({
    where: { userId: req.userId }
  });
  res.json(todos);
});

router.post('/', async function(req, res) {
  var { text, priority } = req.body;
  var todo = await prisma.todo.create({
    data: {
      text: text,
      priority: priority || 'medium',
      userId: req.userId
    }
  });
  res.json(todo);
});

router.put('/:id', async function(req, res) {
  var id = +req.params.id;
  var todo = await prisma.todo.findUnique({ where: { id: id } });
  if (!todo || todo.userId !== req.userId) {
    return res.status(404).json({ error: '未找到' });
  }
  var { text, priority } = req.body;
  var updated = await prisma.todo.update({
    where: { id: id },
    data: { text: text, priority: priority }
  });
  res.json(updated);
});

router.patch('/:id/toggle', async function(req, res) {
  var id = +req.params.id;
  var todo = await prisma.todo.findUnique({ where: { id: id } });
  if (!todo || todo.userId !== req.userId) {
    return res.status(404).json({ error: '未找到' });
  }
  var newDone = !todo.done;
  var updated = await prisma.todo.update({
    where: { id: id },
    data: {
      done: newDone,
      completedAt: newDone ? new Date() : null
    }
  });
  res.json(updated);
});

router.delete('/done', async function(req, res) {
  await prisma.todo.deleteMany({
    where: { userId: req.userId, done: true }
  });
  res.json({ success: true });
});

router.delete('/all', async function(req, res) {
  await prisma.todo.deleteMany({
    where: { userId: req.userId }
  });
  res.json({ success: true });
});

router.delete('/:id', async function(req, res) {
  var id = +req.params.id;
  var todo = await prisma.todo.findUnique({ where: { id: id } });
  if (!todo || todo.userId !== req.userId) {
    return res.status(404).json({ error: '未找到' });
  }
  await prisma.todo.delete({ where: { id: id } });
  res.json({ success: true });
});

module.exports = router;
