// Select all video elements on the page
const videos = document.querySelectorAll('video');
const playingVideoURLs = [];

// Loop through all video elements
videos.forEach(video => {
  // Only process the video that is currently playing
  if (!video.paused && !video.ended && video.readyState > 2) {
    // Add the direct video src if available
    if (video.src) {
      playingVideoURLs.push(video.src);
    }

    // Also check inside <source> tags
    const sources = video.querySelectorAll('source');
    sources.forEach(source => {
      if (source.src) {
        playingVideoURLs.push(source.src);
      }
    });
  }
});

// Send only the playing video(s) to the background or popup script
chrome.runtime.sendMessage({ type: "VIDEOS_FOUND", videos: playingVideoURLs });

