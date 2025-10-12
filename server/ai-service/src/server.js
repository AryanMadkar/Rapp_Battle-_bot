const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');
const config = require('./config/env');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'ai-service', 
    status: 'running',
    models: ['groq', 'gemini', 'huggingface'],
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
  console.log(`Available models: Groq, Gemini, Hugging Face`);
});
