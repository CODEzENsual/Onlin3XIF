const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

let ytPlayer;
let progressInterval;
let isMuted = true;
let isPlayerReady = false;

window.onYouTubeIframeAPIReady = function() {
  ytPlayer = new YT.Player('yt-iframe-container', {
    height: '1',
    width: '1',
    videoId: 'ViFHruS6oO8',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      listType: 'playlist',
      list: 'RDViFHruS6oO8'
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError
    }
  });
};

function onPlayerReady(event) {
  isPlayerReady = true;
  event.target.mute();
  event.target.playVideo();
  startProgressBar();
}

function onPlayerStateChange(event) {
  const playPauseBtn = document.getElementById('ytPlayPause');
  const icon = playPauseBtn ? playPauseBtn.querySelector('.material-symbols-rounded') : null;
  
  if (event.data === YT.PlayerState.PLAYING) {
    if (icon) icon.textContent = 'pause';
    startProgressBar();
  } else if (event.data === YT.PlayerState.PAUSED) {
    if (icon) icon.textContent = 'play_arrow';
    stopProgressBar();
  }
}

function onPlayerError(event) {
  console.error('YouTube Player Error:', event.data);
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function updateProgressBar() {
  if (!isPlayerReady || !ytPlayer) return;
  
  try {
    const current = ytPlayer.getCurrentTime();
    const duration = ytPlayer.getDuration();
    
    if (duration > 0 && current >= 0) {
      const percent = (current / duration) * 100;
      const progressBar = document.getElementById('ytProgressBar');
      const timeDisplay = document.getElementById('ytTime');
      
      if (progressBar) progressBar.style.width = `${percent}%`;
      if (timeDisplay) timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    }
  } catch(e) {}
}

function startProgressBar() {
  if (progressInterval) clearInterval(progressInterval);
  progressInterval = setInterval(updateProgressBar, 300);
}

function stopProgressBar() {
  if (progressInterval) clearInterval(progressInterval);
}

function initPlayerControls() {
  const ytMini = document.getElementById('ytMini');
  const ytToggle = document.getElementById('ytToggle');
  const playPauseBtn = document.getElementById('ytPlayPause');
  const prevBtn = document.getElementById('ytPrev');
  const nextBtn = document.getElementById('ytNext');
  const progressContainer = document.getElementById('ytProgressContainer');

  if (ytToggle) {
    const icon = document.getElementById('ytToggleIcon');
    ytToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      ytMini.classList.toggle('collapsed');
      if (icon) {
        icon.textContent = ytMini.classList.contains('collapsed') ? 'expand_less' : 'expand_more';
      }
    });
  }

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isPlayerReady || !ytPlayer) return;
      
      try {
        const state = ytPlayer.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
          ytPlayer.pauseVideo();
        } else {
          ytPlayer.playVideo();
        }
      } catch(e) {}
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isPlayerReady && ytPlayer) {
        try {
          ytPlayer.previousVideo();
        } catch(e) {}
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isPlayerReady && ytPlayer) {
        try {
          ytPlayer.nextVideo();
        } catch(e) {}
      }
    });
  }

  if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isPlayerReady || !ytPlayer) return;
      
      try {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, clickX / rect.width));
        const duration = ytPlayer.getDuration();
        const seekTime = percent * duration;
        ytPlayer.seekTo(seekTime, true);
      } catch(e) {}
    });
  }

  document.addEventListener('click', () => {
    if (isMuted && ytPlayer && isPlayerReady) {
      try {
        ytPlayer.unMute();
        ytPlayer.setVolume(50);
        isMuted = false;
      } catch(e) {}
    }
  }, { once: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlayerControls);
} else {
  initPlayerControls();
}
