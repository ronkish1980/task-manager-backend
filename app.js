// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db'); // Ensure db.js is configured properly
const OpenAI = require('openai'); // Import OpenAI SDK

// OpenAI API configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors({ origin: '*' }));

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('Task Manager API is running');
});

// --- Task Routes ---

// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const [tasks] = await db.query(`
      SELECT 
        tasks.id, 
        tasks.title, 
        tasks.description, 
        tasks.due_date, 
        tasks.status, 
        users.name AS owner
      FROM tasks
      LEFT JOIN users ON tasks.user_id = users.id
    `);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).send('Error retrieving tasks');
  }
});

// Create a new task
app.post('/tasks', async (req, res) => {
  const { title, description, due_date } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO tasks (title, description, due_date) VALUES (?, ?, ?)',
      [title, description, due_date]
    );

    res.status(201).json({ message: 'Task created successfully', taskId: result.insertId });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).send('Error creating task');
  }
});



// Update an existing task
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, status } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE tasks SET title = ?, description = ?, due_date = ?, status = ? WHERE id = ?',
      [title, description, due_date, status, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).send('Task not found');
    } else {
      res.status(200).send('Task updated successfully');
    }
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).send('Error updating task');
  }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      res.status(404).send('Task not found');
    } else {
      res.status(200).send('Task deleted successfully');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).send('Error deleting task');
  }
});

// --- OpenAI Route ---

// Summarize a task description
app.post('/summarize-task', async (req, res) => {
  const { taskDescription } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Summarize this task: ${taskDescription}` }],
    });

    const summary = completion.choices[0].message.content.trim();
    res.status(200).json({ summary });
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).send('Failed to summarize task.');
  }
});

// Wildcard route to handle unknown paths
app.get('*', (req, res) => {
  res.status(404).send('Not Found');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
