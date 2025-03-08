// public/app.js

// Initialize YouTube IFrame Player API
let player;

// Initialize animation to store scrolling animation
let lastVideoId;
let lastTitle;
let scrollingAnimation;

// Playlist array to store video IDs
let playlist = [];
let currentVideoIndex = 0;

// Flag to track if the YouTube API is ready
let isYouTubeAPIReady = false;

// Load video IDs from the server endpoint
async function loadVideoIds() {
  try {
    console.log('Attempting to fetch video IDs from /api/live-video-ids');
    const response = await fetch('/api/live-video-ids');
    console.log('Response status from /api/live-video-ids:', response.status);
    const responseText = await response.clone().text(); // Clone to avoid consuming the stream
    console.log('Raw response from /api/live-video-ids:', responseText);
    const videoIds = await response.json();
    console.log('Parsed video IDs:', videoIds);
    return videoIds.length > 0 ? videoIds : [
      'jfKfPfyJRdk', // "lofi hip hop radio - beats to relax/study to" by Lofi Girl (active as of March 2025)
      '5qap5aO4i9A', // Another active lofi stream (verify)
      'p53rW6sMfqw', // Verify if still active
    ];
  } catch (error) {
    console.error('Error loading video IDs from /api/live-video-ids:', error.message);
    console.log('Falling back to hardcoded video IDs');
    return [
      'jfKfPfyJRdk', // "lofi hip hop radio - beats to relax/study to" by Lofi Girl
      '5qap5aO4i9A', // Another active lofi stream
      'p53rW6sMfqw', // Verify if still active
    ];
  }
}

// Initialize the player manually after the playlist is ready
function initializePlayer() {
  console.log('Initializing player with video ID:', playlist[currentVideoIndex]);
  player = new YT.Player('player', {
    videoId: playlist[currentVideoIndex],
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError, // Add error handler
    },
    playerVars: {
      autoplay: 1,
      controls: 0,
      mute: 0,
      loop: 1,
      playlist: playlist.join(','),
      rel: 0,
      showinfo: 0,
    },
  });
  console.log(`Player initialized with video ID: ${playlist[currentVideoIndex]}`);
}

// This function will be called by the YouTube IFrame API
window.onYouTubeIframeAPIReady = function () {
  console.log('YouTube IFrame API is ready');
  isYouTubeAPIReady = true;
  // Check if the playlist is already loaded
  if (playlist.length > 0) {
    initializePlayer();
  } else {
    console.log('Waiting for playlist to load before initializing player');
  }
};

// Load the playlist and initialize the player
(async () => {
  playlist = await loadVideoIds();
  console.log('Playlist initialized with video IDs:', playlist);
  // Check if the YouTube API is ready
  if (isYouTubeAPIReady) {
    initializePlayer();
  } else {
    console.log('Waiting for YouTube IFrame API to be ready');
  }
})();

// Error handler for unavailable videos
function onPlayerError(event) {
  console.log('Player error occurred:', event.data);
  // Common error codes: 100 (video not found), 101/150 (embedding not allowed)
  if (event.data === 100 || event.data === 101 || event.data === 150) {
    console.log('Video unavailable, loading next video');
    currentVideoIndex = (currentVideoIndex + 1) % playlist.length;
    loadVideo(currentVideoIndex);
  }
}

/**
 * Event handler for when the YouTube player is ready.
 * It starts video playback and sets the initial volume.
 * @param {Object} event - The event object from the YouTube API
 */
function onPlayerReady(event) {
  console.log('YouTube player is ready to play');
  event.target.playVideo();
  console.log(`Player is ready, current video ID: ${playlist[currentVideoIndex]}`);
  fetchVideoDetails(playlist[currentVideoIndex]);
  event.target.setVolume(75);
}

/**
 * Event handler for changes in the YouTube player state.
 * It updates the video title when a new video starts playing.
 * @param {Object} event - The event object from the YouTube API
 */
function onPlayerStateChange(event) {
  console.log('Player state changed:', event.data);
  if (event.data === YT.PlayerState.PLAYING) {
    const videoId = player.getVideoData().video_id;
    console.log(`Video is playing. Current video ID: ${videoId}`);
    if (videoId !== lastVideoId) {
      lastVideoId = videoId;
      fetchVideoDetails(videoId);
    }
  } else if (event.data === YT.PlayerState.ENDED) {
    console.log('Video ended, attempting to play next video');
  } else if (event.data === YT.PlayerState.UNSTARTED) {
    console.log('Video unstarted, check if video ID is valid');
  }
}

/**
 * Adds event listeners to the control buttons.
 */
document.getElementById('play').addEventListener('click', () => {
  console.log('Play button clicked');
  player.unMute();
  player.playVideo();
});

document.getElementById('pause').addEventListener('click', () => {
  console.log('Pause button clicked');
  player.pauseVideo();
});

document.getElementById('next').addEventListener('click', () => {
  console.log('Next button clicked');
  currentVideoIndex = (currentVideoIndex + 1) % playlist.length;
  loadVideo(currentVideoIndex);
});

document.getElementById('stop').addEventListener('click', () => {
  console.log('Stop button clicked');
  player.stopVideo();
});

document.getElementById('prev').addEventListener('click', () => {
  console.log('Previous button clicked');
  currentVideoIndex = (currentVideoIndex - 1 + playlist.length) % playlist.length;
  loadVideo(currentVideoIndex);
});

document.getElementById('mute').addEventListener('click', () => {
  console.log('Mute button clicked');
  player.mute();
});

document.getElementById('unmute').addEventListener('click', () => {
  console.log('Unmute button clicked');
  player.unMute();
});

document.getElementById('volume-control').addEventListener('input', (e) => {
  const volume = e.target.value;
  console.log(`Volume changed to: ${volume}`);
  player.setVolume(volume);
});

/**
 * Loads a new video by its index in the playlist and fetches its details.
 * @param {number} index - The index of the video in the playlist
 */
function loadVideo(index) {
  currentVideoIndex = index;
  const videoId = playlist[index];
  console.log(`Loading video at index ${index}, video ID: ${videoId}`);
  player.loadVideoById(videoId);
  fetchVideoDetails(videoId);
}

/**
 * Fetches video details (e.g., title) from the server-side API.
 * @param {string} videoId - The YouTube video ID
 */
async function fetchVideoDetails(videoId) {
  console.log(`Fetching video details for video ID: ${videoId}`);
  try {
    const response = await fetch('/api/video-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: videoId }),
    });
    console.log('Response status from /api/video-details:', response.status);
    const responseText = await response.clone().text();
    console.log('Raw response from /api/video-details:', responseText);
    const data = await response.json();

    if (data.error) {
      console.error('Error fetching video details:', data.error);
      return;
    }

    const title = data.title;

    if (title !== lastTitle) {
      lastTitle = title;
      const scrollingText = document.getElementById('video-title');
      scrollingText.innerText = title;

      console.log(`Video title updated to: ${title}`);

      document.fonts.ready.then(() => {
        adjustScrollSpeed();
      });
    }
  } catch (error) {
    console.error('Error fetching video details:', error.message);
  }
}

/**
 * Adjusts the scrolling speed based on the text width.
 */
function adjustScrollSpeed() {
  try {
    const scrollingText = document.getElementById('video-title');
    const container = document.getElementById('video-titleContainer');

    document.fonts.ready.then(() => {
      const containerWidth = container.offsetWidth;
      const textWidth = scrollingText.scrollWidth * 1.5;

      const totalScrollDistance = textWidth + containerWidth;
      const scrollSpeed = 85;
      let duration = totalScrollDistance / scrollSpeed;

      if (duration < 5) {
        duration = 5;
      }

      console.log(`[adjustScrollSpeed] containerWidth: ${containerWidth}px, textWidth: ${textWidth}px, duration: ${duration}s`);

      scrollingText.style.transform = `translateX(${containerWidth}px)`;

      if (scrollingAnimation) {
        scrollingAnimation.cancel();
      }

      scrollingAnimation = scrollingText.animate(
        [
          { transform: `translateX(${containerWidth}px)` },
          { transform: `translateX(-${textWidth}px)` }
        ],
        {
          duration: duration * 1000,
          iterations: Infinity,
          easing: 'linear'
        }
      );
    });
  } catch (error) {
    console.error('Error in adjustScrollSpeed():', error);
  }
}
