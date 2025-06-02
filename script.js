// IMPORTANT: Replace with your actual YouTube Data API Key
const YOUTUBE_API_KEY = 'AIzaSyATyoCbAaZ5W47vOVaZuBi7Ii3ZI8winrY';

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsList = document.getElementById('resultsList');
const videoPlayerDiv = document.getElementById('videoPlayer');

let player; // This will hold the YouTube Player object

// 1. Load the IFrame Player API asynchronously
function onYouTubeIframeAPIReady() {
    console.log('YouTube IFrame API is ready.');
}

// Ensure the API script is loaded
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. Handle Search Button Click
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        performSearch();
    }
});

async function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm === '') {
        alert('Please enter a song, artist, or band to search.');
        return;
    }

    resultsList.innerHTML = '<li>Searching...</li>';
    videoPlayerDiv.innerHTML = ''; // Clear previous video

    try {
        const query = encodeURIComponent(searchTerm + ' karaoke');
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${YOUTUBE_API_KEY}&maxResults=5`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        displayResults(data.items);

    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        resultsList.innerHTML = '<li>Error fetching results. Please try again.</li>';
    }
}

// 3. Display Search Results
function displayResults(videos) {
    resultsList.innerHTML = ''; // Clear previous results

    if (videos.length === 0) {
        resultsList.innerHTML = '<li>No karaoke videos found for your search.</li>';
        return;
    }

    videos.forEach(video => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');

        const title = video.snippet.title;
        const videoId = video.id.videoId;

        // Attempt to extract song title and artist from YouTube title
        // This is a heuristic and might not be perfect for all titles
        let displayTitle = title;
        const dashIndex = title.indexOf('-');
        if (dashIndex !== -1 && dashIndex < title.length - 1) {
             // Example: "Artist - Song (Karaoke)" -> "Artist - Song"
            displayTitle = title.substring(0, dashIndex) + ' - ' + title.substring(dashIndex + 1);
            // Remove common karaoke suffixes if they remain
            displayTitle = displayTitle.replace(/(\s*\(karaoke\)\s*|\s*\[karaoke\]\s*|\s*karaoke\s*|\s*instrumental\s*|\s*lyrics\s*)/gi, '').trim();
        } else {
             // Fallback if no dash, try to clean "karaoke" word directly
            displayTitle = title.replace(/(\s*\(karaoke\)\s*|\s*\[karaoke\]\s*|\s*karaoke\s*|\s*instrumental\s*|\s*lyrics\s*)/gi, '').trim();
        }

        link.textContent = displayTitle;
        link.href = '#'; // Prevent actual navigation
        link.dataset.videoId = videoId; // Store video ID for embedding

        link.addEventListener('click', (event) => {
            event.preventDefault(); // Stop the browser from following the link
            playVideo(event.target.dataset.videoId);
        });

        listItem.appendChild(link);
        resultsList.appendChild(listItem);
    });
}

// 4. Play Video in Embedded Box
function playVideo(videoId) {
    // If a player already exists, destroy it to avoid multiple players
    if (player) {
        player.destroy();
    }

    // Create a new player
    player = new YT.Player('videoPlayer', {
        height: videoPlayerDiv.style.height || '405', // Use CSS height or default
        width: videoPlayerDiv.style.width || '720',   // Use CSS width or default
        videoId: videoId,
        playerVars: {
            'autoplay': 1,      // Autoplay the video
            'controls': 1,      // Show player controls
            'modestbranding': 1, // Remove YouTube logo
            'rel': 0            // Do not show related videos
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    // You can add logic here based on player state (e.g., video ended, paused)
    // console.log('Player state changed:', event.data);
}
