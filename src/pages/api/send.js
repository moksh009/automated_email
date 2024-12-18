import { sendEmail } from '../../api/send';
import multer from 'multer';
import nextConnect from 'next-connect';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max file size
  },
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error('API Route Error:', error);
    res.status(500).json({ error: `Sorry, there was an error: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// Use multer middleware to handle file uploads
apiRoute.use(upload.array('attachment'));

// Handle POST requests
apiRoute.post(async (req, res) => {
  try {
    await sendEmail(req, res);
  } catch (error) {
    console.error('Send Email Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disable built-in bodyParser
  },
};
