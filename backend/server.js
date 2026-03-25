const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const cvRoutes = require('./routes/cvRoutes');

app.use(express.json());
app.use(cors());

// REQUEST LOGGING MIDDLEWARE - Log EVERYTHING
app.use((req, res, next) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Raw body received:', req.body);
  console.log(`${'='.repeat(80)}\n`);
  next();
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// routes
app.use('/api', authRoutes);
app.use('/api', cvRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server started on port ' + PORT);
});
