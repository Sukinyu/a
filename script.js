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
    const absoluteUrl = "https://www.youtube.com" + trackInfo.baseUrl + "&fmt=vtt";

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
}

// Run once video + ytInitialPlayerResponse exist
setTimeout(injectDirectTrack, 3000);


// Debug helper for YouTube captions injection
setTimeout(() => {
    const video = document.querySelector('video');
    if (!video) {
        alert("No <video> element found!");
        return;
    }

    const tracks = video.textTracks;
    alert("Video element found. Track count: " + tracks.length);

    if (tracks.length > 0) {
        for (let i = 0; i < tracks.length; i++) {
            const t = tracks[i];
            alert(`Track[${i}] → label: ${t.label}, lang: ${t.language}, kind: ${t.kind}, mode: ${t.mode}`);
        }

        // Force the first track on
        tracks[0].mode = "showing";
        alert("Forced Track[0] mode to 'showing'");
    } else {
        alert("No tracks registered in video.textTracks yet.");
    }

    // Also check the <track> element itself
    const el = video.querySelector('track[data-injected="true"]');
    if (el) {
        alert("Injected <track> element exists with src: " + el.src);
    } else {
        alert("No injected <track> element found.");
    }
}, 5000)
