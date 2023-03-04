const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Todo, Post, Comment } = require('./model');

const app = express();
const port = 3000;
const jwtSecret = 'secret-key';

app.use(bodyParser.json());

// User signup endpoint
app.post('/user', async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = new User({ email, password: hashedPassword });
  await user.save();

  const token = jwt.sign({ email }, jwtSecret);
  res.json({ token });
});

// User login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ email }, jwtSecret);
  res.json({ token });
});

// Todo endpoints
app.post('/todo', async (req, res) => {
  const { title, description } = req.body;
  const { email } = req.user;

  const todo = new Todo({ title, description, userEmail: email });
  await todo.save();

  res.json(todo);
});

app.get('/todo', async (req, res) => {
  const { email } = req.user;
  const todos = await Todo.find({ userEmail: email });

  res.json(todos);
});

app.get('/todo/:id', async (req, res) => {
  const { email } = req.user;
  const { id } = req.params;

  const todo = await Todo.findOne({ _id: id, userEmail: email });
  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  res.json(todo);
});

app.put('/todo/:id', async (req, res) => {
  const { email } = req.user;
  const { id } = req.params;
  const { title, description } = req.body;

  const todo = await Todo.findOne({ _id: id, userEmail: email });
  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  todo.title = title || todo.title;
  todo.description = description || todo.description;

  await todo.save();

  res.json(todo);
});

app.delete('/todo/:id', async (req, res) => {
  const { email } = req.user;
  const { id } = req.params;

  const todo = await Todo.findOne({ _id: id, userEmail: email });
  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  await todo.delete();

  res.json({ message: 'Todo deleted' });
});


// Post endpoints (continued)
app.post('/post', async (req, res) => {
    const { text } = req.body;
    const { email } = req.user;
  
    const post = new Post({ text, userEmail: email });
    await post.save();
  
    res.json(post);
  });
  
  app.get('/posts', async (req, res) => {
    const posts = await Post.find();
  
    res.json(posts);
  });
  
  app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
  
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
  
    res.json(post);
  });
  
  // Comment endpoints
  app.post('/post/:id/comment', async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    const { email } = req.user;
  
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
  
    const comment = new Comment({ text, userEmail: email, postId: id });
    await comment.save();
  
    post.comments.push(comment);
    await post.save();
  
    res.json(comment);
  });
  
  // User endpoints
  app.get('/user/:email', async (req, res) => {
    const { email } = req.params;
  
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    const { password, ...userData } = user.toObject();
    res.json(userData);
  });
  
  // Middleware to verify JWT token
  function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Access token not provided' });
    }
  
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Invalid access token' });
    }
  }
  
  // Apply middleware to all endpoints except /user and /login
  app.use(/^(?!\/(user|login)).*$/, verifyToken);
  
  // Run the server
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  
//   export default app;