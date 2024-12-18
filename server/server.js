const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const { sendEmail, scheduleEmail } = require('./emailService');

const app = express();
const port = 3001;

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Test endpoint
app.get('/', (req, res) => {
  console.log('Environment variables:', {
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Set' : 'Not set'
  });
  res.json({ message: 'Email server is running' });
});

// Send email endpoint
app.post('/send-email', upload.array('attachments'), async (req, res) => {
  try {
    console.log('Received send email request');
    console.log('Body:', {
      to: req.body.to,
      subject: req.body.subject,
      contentLength: req.body.content?.length,
      hasAttachments: req.files?.length > 0
    });
    
    const { to, subject, content } = req.body;
    const attachments = req.files || [];

    if (!to || !subject || !content) {
      console.log('Missing required fields:', { to, subject, hasContent: !!content });
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: to, subject, or content' 
      });
    }

    console.log('Processing attachments:', attachments.map(file => ({
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    })));

    const result = await sendEmail({
      to,
      subject,
      content,
      attachments: attachments.map(file => ({
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype
      }))
    });

    console.log('Email sent successfully:', result);
    res.json({ success: true, message: 'Email sent successfully', ...result });
  } catch (error) {
    console.error('Detailed error in send-email:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email', 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Schedule email endpoint
app.post('/schedule-email', upload.array('attachments'), async (req, res) => {
  try {
    console.log('Received schedule email request:', req.body);
    
    const { to, subject, content, scheduledTime } = req.body;
    const attachments = req.files || [];

    if (!to || !subject || !content || !scheduledTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: to, subject, content, or scheduledTime' 
      });
    }

    const result = await scheduleEmail({
      to,
      subject,
      content,
      attachments: attachments.map(file => ({
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype
      }))
    }, scheduledTime);

    res.json({ success: true, message: 'Email scheduled successfully', ...result });
  } catch (error) {
    console.error('Error scheduling email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to schedule email', 
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
