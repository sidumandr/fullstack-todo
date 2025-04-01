const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Tüm görevleri getir
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni görev ekle
router.post('/', async (req, res) => {
  const task = new Task({
    task: req.body.task,
    description: req.body.description,
    priority: req.body.priority,
    completed: req.body.completed
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Görevi güncelle
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      task.task = req.body.task || task.task;
      task.description = req.body.description || task.description;
      task.priority = req.body.priority || task.priority;
      task.completed = req.body.completed !== undefined ? req.body.completed : task.completed;

      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Görev bulunamadı' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Görevi sil
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      await task.deleteOne();
      res.json({ message: 'Görev silindi' });
    } else {
      res.status(404).json({ message: 'Görev bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 