function injectCaptionsFromPlayer() {
  const player = window.ytInitialPlayerResponse;
  if (!player?.captions?.playerCaptionsTracklistRenderer?.captionTracks) return;

  const trackInfo = player.captions.playerCaptionsTracklistRenderer.captionTracks[0];
  const video = document.querySelector("video");
  if (!video || !trackInfo) return;

  const url = trackInfo.baseUrl + "&pot=Mlq3f81rUkG0Brc8Sb3X66CD2b_5LFvcmbyWCdAU62f4YnDZTWY1-tBntmhO4sV5mDQSUV5clQlRYexOnxDLClUPpDxoyldvLgyi_Elmy5m6wy5a6Qg_lVbzK6M%3D" + "&c=MWEB";
  fetch(url)
    .then(r => r.text())
    .then(vttText => {
      const oldTrack = video.querySelector('track[data-injected="true"]');
      if (oldTrack) oldTrack.remove();

      const track = document.createElement("track");
      track.kind = "subtitles";
      track.label = "Custom CC";
      track.srclang = "en";
      track.src = URL.createObjectURL(new Blob([vttText], { type: "text/vtt" }));
      track.default = true;
      track.dataset.injected = "true";
      video.appendChild(track);
      console.log("Injected WebVTT track on iOS via player response");
    });
}

// Poll until the player is ready
const interval = setInterval(() => {
  if (window.ytInitialPlayerResponse) {
    clearInterval(interval);
    injectCaptionsFromPlayer();
  }
}, 200);
