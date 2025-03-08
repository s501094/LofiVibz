// fetch_lofi_live_streams.js

// Import required packages
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config(); // Adjust the path if your .env is located elsewhere

// Constants
const API_KEY = process.env.YOUTUBE_API_KEY;
const SEARCH_QUERY = 'lofi chill relax live stream royalty free';
const MAX_RESULTS = 300; // Maximum allowed by YouTube API per request
const OUTPUT_FILE = 'lofi_live_video_ids.txt';

// Initialize YouTube API client
const youtube = google.youtube({
  version: 'v3',
  auth: API_KEY,
});

/**
 * Searches for live lofi chill beats streams on YouTube and retrieves video IDs.
 */
async function fetchLiveLofiVideoIds() {
  try {
    // Perform the search.list API request
    const response = await youtube.search.list({
      part: 'snippet',
      q: SEARCH_QUERY,
      type: 'video',
      eventType: 'live',
      maxResults: MAX_RESULTS,
      safeSearch: 'moderate', // Options: 'none', 'moderate', 'strict'
    });

    // Extract video IDs from the search results
    const videoIds = response.data.items.map((item) => item.id.videoId);

    // Remove duplicate video IDs, if any
    const uniqueVideoIds = [...new Set(videoIds)];

    console.log(`Found ${uniqueVideoIds.length} unique live lofi chill beats Video IDs at ${new Date().toLocaleString()}:`);

    // Optionally, log the IDs (uncomment if needed)
    // uniqueVideoIds.forEach((id, index) => {
    //   console.log(`${index + 1}. ${id}`);
    // });

    // Save the video IDs to a file
    saveVideoIds(uniqueVideoIds, OUTPUT_FILE);
  } catch (error) {
    console.error('Error fetching live lofi chill beats video IDs:', error.message);
  }
}

/**
 * Saves the list of video IDs to a specified file.
 * @param {Array} videoIds - Array of YouTube video IDs.
 * @param {string} filename - Name of the file to save the IDs.
 */
function saveVideoIds(videoIds, filename) {
  const filePath = path.resolve(__dirname, filename);
  const data = videoIds.join('\n');

  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error(`Error writing to file ${filename} at ${new Date().toLocaleString()}:`, err.message);
    } else {
      console.log(`Successfully saved Video IDs to ${filename} at ${new Date().toLocaleString()}`);
    }
  });
}

// Schedule the task to run every day at 2:00 AM (adjust time as needed)
// Cron syntax: 'minute hour dayOfMonth month dayOfWeek'
// '0 2 * * *' means 2:00 AM every day
const cron = require('node-cron');
cron.schedule('0 2 * * *', () => {
  console.log('Running scheduled fetch of live lofi video IDs at 2:00 AM');
  fetchLiveLofiVideoIds();
});

// Run immediately on script start (optional, for testing)
fetchLiveLofiVideoIds();
