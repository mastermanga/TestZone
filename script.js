// Liste statique des animes (extensible avec une API/base de données)
const animeList = [
  {
    title: "Black Clover",
    altTitles: ["ブラッククローバー", "Black Clover"],
    opening: "Black Rover",
    videoId: "4QDEWNg5hAM",
    startTime: 0,
    endTime: 15
  },
  // Ajoute d'autres animes ici, ex :
  // { title: "Hunter x Hunter", altTitles: ["ハンター×ハンター"], opening: "Departure!", videoId: "xxx", startTime: 0, endTime: 15 }
];

// Sélectionner l’anime du jour (basé sur la date)
function getDailyAnime() {
  const today = new Date().toISOString().split('T')[0];
  const index = Math.floor(today.replace(/-/g, '') % animeList.length);
  return animeList[index];
}

let player;
let stopInterval;
let videoVisible = false; // Vidéo masquée par défaut
let currentAnime = getDailyAnime();

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "270",
    width: "480",
    videoId: currentAnime.videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      start: currentAnime.startTime,
      end: currentAnime.endTime
    },
    events: {
      onReady: () => {
        document.getElementById("playAudio").disabled = false;
        document.getElementById("stopAudio").disabled = false;
      },
      onStateChange: onPlayerStateChange,
      onError: (event) => {
        document.getElementById("result").textContent = "Erreur : Impossible de charger la vidéo.";
        document.getElementById("result").classList.add("incorrect");
      }
    }
  });
}

// Gestion de l’état du lecteur
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    clearInterval(stopInterval);
    stopInterval = setInterval(() => {
      if (player.getCurrentTime() >= currentAnime.endTime) {
        player.pauseVideo();
        clearInterval(stopInterval);
      }
    }, 300);
  }
}

// Bouton Jouer
document.getElementById("playAudio").addEventListener("click", () => {
  if (player) {
    player.seekTo(currentAnime.startTime);
    player.playVideo();
  }
});

// Bouton Stop
document.getElementById("stopAudio").addEventListener("click", () => {
  if (player) {
    player.pauseVideo();
    clearInterval(stopInterval);
  }
});

// Bouton Afficher/Cacher la vidéo
document.getElementById("toggleVideo").addEventListener("click", () => {
  const wrapper = document.getElementById("playerWrapper");
  videoVisible = !videoVisible;
  wrapper.style.display = videoVisible ? "block" : "none";
  document.getElementById("toggleVideo").textContent = videoVisible ? "📺 Cacher la vidéo" : "📺 Afficher la vidéo";
});

// Vérifier la réponse
function checkAnswer() {
  const input = document.getElementById("guessInput").value.trim().toLowerCase();
  const isCorrect = currentAnime.altTitles.some(ans => ans.toLowerCase() === input);
  const result = document.getElementById("result");
  const shareButton = document.getElementById("shareButton");

  result.textContent = isCorrect
    ? `✅ Bravo ! C’est ${currentAnime.title} - ${currentAnime.opening}`
    : `❌ Faux. C’était ${currentAnime.title} - ${currentAnime.opening}`;
  result.classList.remove("correct", "incorrect");
  result.classList.add(isCorrect ? "correct" : "incorrect");

  shareButton.classList.remove("hidden");
}

// Partage sur Twitter/X
document.getElementById("shareButton").addEventListener("click", () => {
  const result = document.getElementById("result").textContent;
  const text = `J’ai joué à Guess The Anime Opening ! ${result} 🎶 Essayez ici : [URL de votre site]`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
});

// Autocomplétion
document.getElementById("guessInput").addEventListener("input", function () {
  const input = this.value.toLowerCase();
  const autocompleteList = document.getElementById("autocomplete-list");
  autocompleteList.innerHTML = "";

  if (!input) return;

  const suggestions = animeList.filter(
    anime =>
      anime.title.toLowerCase().includes(input) ||
      anime.altTitles.some(alt => alt.toLowerCase().includes(input)) ||
      anime.opening.toLowerCase().includes(input)
  );

  suggestions.forEach(anime => {
    const div = document.createElement("div");
    div.textContent = `${anime.title} - ${anime.opening}`;
    div.addEventListener("click", () => {
      document.getElementById("guessInput").value = anime.title;
      autocompleteList.innerHTML = "";
      checkAnswer(); // Valider automatiquement si suggestion cliquée
    });
    autocompleteList.appendChild(div);
  });
});

// Cacher l’autocomplétion quand on clique ailleurs
document.addEventListener("click", e => {
  if (!e.target.closest("#guessInput") && !e.target.closest(".autocomplete-items")) {
    document.getElementById("autocomplete-list").innerHTML = "";
  }
});

// Navigation au clavier pour l’autocomplétion
document.getElementById("guessInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    checkAnswer();
  }
});
