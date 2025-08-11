let currentVideoURLs = [];

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    function: extractVideosFromPage
  });
});

function extractVideosFromPage() {
  const videos = document.querySelectorAll("video");
  const videoURLs = [];

  videos.forEach(video => {
    if (!video.paused) {
      if (video.src) videoURLs.push(video.src);

      const sources = video.querySelectorAll("source");
      sources.forEach(source => {
        if (source.src) videoURLs.push(source.src);
      });
    }
  });

  chrome.runtime.sendMessage({ type: "VIDEOS_FOUND", videos: videoURLs });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "VIDEOS_FOUND" && message.videos.length > 0) {
    const videoList = document.getElementById("videoList");
    videoList.innerHTML = "";

    const url = message.videos[0];
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = url;
    a.textContent = url;
    a.target = "_blank";
    li.appendChild(a);
    videoList.appendChild(li);

    // Save for sending later
    currentVideoURLs = [url];
  }
});

// ✅ Add button click only once
document.getElementById("deepfake-btn").addEventListener("click", () => {
  const statusMessage = document.getElementById("status-message");
  statusMessage.textContent = "Analyzing video... Please wait.";

  fetch("http://localhost:5000/process-video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ videos: currentVideoURLs })
  })
    .then(res => res.json())
    .then(data => {
      statusMessage.textContent = "";
      const resultDiv = document.getElementById("predictionResult");
      // Clear previous class
      resultDiv.className = "";
      resultDiv.classList.add(
       data.prediction === "Real" ? "real-result" : "fake-result"
      );
      
      resultDiv.innerHTML = `
        <p><strong>Prediction:</strong> ${data.prediction}</p>
        <p><strong>Confidence Score:</strong> ${data.score.toFixed(2)}</p>
      `;
    })
    .catch(err => {
      console.error("❌ Error sending to server:", err);
      statusMessage.textContent = "Failed to analyze the video.";
    });
});
