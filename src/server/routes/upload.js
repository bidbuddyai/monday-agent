const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * Upload file endpoint
 * Accepts a file and returns a public URL that can be used for parsing
 */
router.post('/upload-file', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log(`File upload: ${file.originalname} (${file.size} bytes)`);

    // For now, we'll convert the file to a data URL that can be sent to Poe
    // In production, you'd want to upload to Monday's asset server or S3
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    // Return the data URL - the parse-file endpoint can handle this
    res.json({
      fileUrl: dataUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
