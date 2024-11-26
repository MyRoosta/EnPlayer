const audio = document.getElementById('audio');
const musicInput = document.getElementById('musicInput');
const subtitleInput = document.getElementById('subtitleInput');
const subtitles = document.getElementById('subtitles');
const repeatInput = document.getElementById('repeatInput');
const delayInput = document.getElementById('delayInput');

let subtitlesData = [];
let currentIndex = 0;
let currentRepeatCount = 1;
let repeatDelay = 4000;

musicInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        audio.src = URL.createObjectURL(file);
        subtitlesData = []; // Reset subtitles when a new music file is loaded
        subtitles.textContent = ''; // Clear subtitles display
        currentIndex = 0;
        currentRepeatCount = 1;
    }
});

subtitleInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            parseSRT(reader.result);
        };
        reader.readAsText(file);
    }
});

function parseSRT(data) {
    const lines = data.split('\n');
    let subtitleEntry = null;

    lines.forEach(line => {
        line = line.trim();
        if (!isNaN(line)) {
            // This line is the index number
            subtitleEntry = {};
        } else if (line.includes('-->')) {
            // This line contains the time
            const times = line.split(' --> ');
            const startTime = convertToSeconds(times[0]);
            const endTime = convertToSeconds(times[1]);
            subtitleEntry.start = startTime;
            subtitleEntry.end = endTime;
        } else if (line) {
            // This line is the subtitle text
            subtitleEntry.text = line;
            subtitlesData.push(subtitleEntry);
        }
    });
}

function convertToSeconds(timeString) {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2].split(',')[0], 10);
    return (hours * 3600) + (minutes * 60) + seconds;
}

audio.addEventListener('timeupdate', () => {
    const currentTime = audio.currentTime;

    if (currentIndex < subtitlesData.length) {
        const activeSubtitle = subtitlesData[currentIndex];
        
        if (currentTime >= activeSubtitle.start && currentTime <= activeSubtitle.end) {
            subtitles.textContent = activeSubtitle.text;
        } else if (currentTime > activeSubtitle.end) {
            if (currentRepeatCount < 5) {
                currentRepeatCount++;
                audio.currentTime = activeSubtitle.start; // Restart current subtitle
                const delay = parseInt(4000) || 0;
                setTimeout(() => {
                    audio.currentTime = activeSubtitle.end; // Move time to end after delay
                }, delay);
            } else {
                currentRepeatCount = 0; // Reset repeat count for next subtitle
                currentIndex++; // Move to next subtitle
                audio.currentTime = activeSubtitle.start; // Move to start of next subtitle
            }
        }
    }
});
