// musicfetchserver.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors({
  origin: 'https://lofivibz.com', // Replace with your actual domain
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// API endpoint to fetch live video IDs
app.get('/api/live-video-ids', (req, res) => {
  const filePath = path.resolve(__dirname, 'lofi_live_video_ids.txt');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Failed to read video IDs' });
    }
    const videoIds = data.trim().split('\n').filter(id => id);
    console.log('Serving video IDs:', videoIds);
    res.json(videoIds);
  });
});

// Start the server
app.listen(3001, () => {
  console.log('Music fetch server running on port 3001');
});
