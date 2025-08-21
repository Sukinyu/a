function injectDirectTrack() {
    const player = window.ytInitialPlayerResponse;
    if (!player?.captions?.playerCaptionsTracklistRenderer?.captionTracks?.length) {
        console.warn("No captions found");
        return;
    }

    const video = document.querySelector('video');
    if (!video) {
        console.warn("No video found");
        return;
    }

    const trackInfo = player.captions.playerCaptionsTracklistRenderer.captionTracks[0];
    const src = trackInfo.baseUrl;

    // Remove old injected tracks
    video.querySelectorAll('track[data-injected="true"]').forEach(t => t.remove());

    const track = document.createElement('track');
    track.kind = "subtitles";
    track.label = trackInfo.name?.runs?.[0]?.text || "Injected Captions";
    track.srclang = trackInfo.languageCode || "en";
    track.src = src;
    track.default = true;
    track.dataset.injected = "true";
    video.appendChild(track);

    console.log("Injected native track from YouTube captions:", src);

    
    const ttList = video.textTracks;
    for (let i = 0; i < ttList.length; i++) {
       const tt = ttList[i];
        console.log(`Track[${i}] "${tt.label}" mode=${tt.mode}, cues=${tt.cues ? tt.cues.length : "null"}`);
        tt.mode = "showing"; // force it on
        }
}

// Run once video + ytInitialPlayerResponse exist
setTimeout(injectDirectTrack, 400);
