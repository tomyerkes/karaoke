// IMPORTANT: Replace with your actual YouTube Data API Key
const YOUTUBE_API_KEY = 'AIzaSyATyoCbAaZ5W47vOVaZuBi7Ii3ZI8winrY';

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsList = document.getElementById('resultsList');
const videoPlayerIframe = document.getElementById('videoPlayer'); // Reference the iframe directly
const videoPlayerMessage = document.getElementById('videoPlayerMessage'); // Message below the player

// No need for onYouTubeIframeAPIReady or dynamically loading the API script anymore

// Handle Search Button Click
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
    videoPlayerIframe.style.display = 'none'; // Hide iframe during search
    videoPlayerIframe.src = ''; // Clear current video
    videoPlayerMessage.textContent = 'Searching for karaoke videos...'; // Update message

    try {
        const query = encodeURIComponent(searchTerm + ' karaoke');
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${YOUTUBE_API_KEY}&maxResults=5`;

        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();

        displayResults(data.items);

    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        resultsList.innerHTML = '<li>Error fetching results. Please ensure your API key is correct and "YouTube Data API v3" is enabled for your project.</li>';
        videoPlayerMessage.textContent = 'Error fetching videos. Please try again.';
    }
}

// Display Search Results
function displayResults(videos) {
    resultsList.innerHTML = ''; // Clear previous results

    if (videos.length === 0) {
        resultsList.innerHTML = '<li>No karaoke videos found for your search. Try a different search term.</li>';
        videoPlayerMessage.textContent = 'No videos found.';
        return;
    }

    videoPlayerMessage.textContent = 'Select a video from the list below to play.'; // Instruction after search results are loaded

    videos.forEach(video => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');

        const title = video.snippet.title;
        const videoId = video.id.videoId;

        // Attempt to extract song title and artist from YouTube title
        let displayTitle = title;
        displayTitle = displayTitle.replace(/(\s*\(karaoke\)\s*|\s*\[karaoke\]\s*|\s*karaoke\s*|\s*instrumental\s*|\s*lyrics\s*|\s*\(official\s*video\)\s*|\s*\[official\s*video\]\s*)/gi, '').trim();
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

// Play Video using direct iframe src
function playVideo(videoId) {
    // Construct the YouTube embed URL
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`;

    videoPlayerIframe.src = embedUrl; // Set the iframe's source
    videoPlayerIframe.style.display = 'block'; // Make the iframe visible
    videoPlayerMessage.textContent = 'Playing video...'; // Update message
}
