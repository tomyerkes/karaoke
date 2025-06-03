// IMPORTANT: Replace with your actual YouTube Data API Key
const YOUTUBE_API_KEY = 'AIzaSyATyoCbAaZ5W47vOVaZuBi7Ii3ZI8winrY'; // Ensure this is correct and YouTube Data API v3 is enabled for your project!

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
tag.src = "https://www.youtube.com/iframe_api"; // Corrected URL for YouTube IFrame API
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
    videoPlayerDiv.innerHTML = '<p>Search for a song and click a link to play the video.</p>'; // Clear previous video and show instructions

    try {
        // Correct query to search for karaoke versions
        const query = encodeURIComponent(searchTerm + ' karaoke');
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${YOUTUBE_API_KEY}&maxResults=5`;

        const response = await fetch(url);
        if (!response.ok) {
            // Log the full error to the console for debugging if status is not OK
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();

        displayResults(data.items);

    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        resultsList.innerHTML = '<li>Error fetching results. Please ensure your API key is correct and "YouTube Data API v3" is enabled for your project.</li>';
    }
}

// 3. Display Search Results
function displayResults(videos) {
    resultsList.innerHTML = ''; // Clear previous results

    if (videos.length === 0) {
        resultsList.innerHTML = '<li>No karaoke videos found for your search. Try a different search term.</li>';
        return;
    }

    videos.forEach(video => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');

        const title = video.snippet.title;
        const videoId = video.id.videoId;

        // Attempt to extract song title and artist from YouTube title
        let displayTitle = title;
        // Simple heuristic for cleaning up titles:
        // Remove common karaoke/instrumental/lyrics suffixes and "official" often in parentheses/brackets
        displayTitle = displayTitle.replace(/(\s*\(karaoke\)\s*|\s*\[karaoke\]\s*|\s*karaoke\s*|\s*instrumental\s*|\s*lyrics\s*|\s*\(official\s*video\)\s*|\s*\[official\s*video\]\s*)/gi, '').trim();
        // Remove trailing hyphens or similar if they are left after cleaning
        displayTitle = displayTitle.replace(/[-–—\s]*$/, '').trim();


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
    // Clear any previous error messages
    videoPlayerDiv.innerHTML = '';

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
            'modestbranding': 1, // Remove YouTube logo (if possible)
            'rel': 0            // Do not show related videos
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError // Add the error handler
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

// NEW: Error handling for the YouTube player
function onPlayerError(event) {
    let errorMessage = `Sorry, this video cannot be played here.`;
    const videoId = player.getVideoUrl().match(/(?:v=|\/embed\/|\.be\/)([\w-]{11})(?:&|$)/)[1]; // Extract video ID from player URL

    switch (event.data) {
        case 2: // Invalid Parameter or Video ID not found
            errorMessage = `Video not found or invalid ID. Please try another link.`;
            break;
        case 5: // HTML5 player error
            errorMessage = `HTML5 player error. Please try another link.`;
            break;
        case 100: // Video not found
            errorMessage = `Video not found. It may have been deleted or is unavailable.`;
            break;
        case 101: // Embedding disabled
        case 150: // Embedding disabled (alias for 101)
            errorMessage = `Playback on this website has been disabled by the video owner.`;
            break;
        default:
            errorMessage = `An unknown error occurred with the video player.`;
    }

    // Display the error message in the video player area
    videoPlayerDiv.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <p style="color: #d9534f; font-weight: bold;">Error: ${errorMessage}</p>
            <p>Please select a different karaoke video from the list above.</p>
            ${videoId ? `<p><a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" style="color: #007bff; text-decoration: underline;">Watch on YouTube (opens new tab)</a></p>` : ''}
        </div>
    `;

    // Optionally, destroy the player to clean up
    if (player) {
        player.destroy();
        player = null; // Clear the player reference
    }
}
