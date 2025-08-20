// ==UserScript==
// @name         YouTube Mobile Captions → WebVTT for iOS
// @match        https://m.youtube.com/*
// @grant        none
// ==/UserScript==

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
    const absoluteUrl = trackInfo.baseUrl + "&fmt=vtt";

    // Remove old
    video.querySelectorAll('track[data-injected="true"]').forEach(t => t.remove());

    const track = document.createElement('track');
    track.kind = "subtitles";
    track.label = trackInfo.name?.runs?.[0]?.text || "Injected Captions";
    track.srclang = trackInfo.languageCode || "en";
    track.src = absoluteUrl;
    track.default = true;
    track.dataset.injected = "true";
    video.appendChild(track);

    console.log("Injected native track from YouTube captions:", absoluteUrl);

    for (let i = 0; i < tracks.length; i++) {
    let cues = tracks[i].cues;
    alert(`Track[${i}] cues count: ${cues ? cues.length : "null"}`);
}
}

// Run once video + ytInitialPlayerResponse exist
setTimeout(injectDirectTrack, 400)
