// ==UserScript==
// @name         YouTube Mobile Captions → WebVTT for iOS
// @match        https://m.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Convert JSON cues to WebVTT format
    function createVTTBlob(cues) {
        let vtt = "WEBVTT\n\n";
        cues.forEach((cue, i) => {
            const start = formatTime(cue.start);
            const end = formatTime(cue.end);
            vtt += `${i+1}\n${start} --> ${end}\n${cue.text}\n\n`;
        });
        return new Blob([vtt], { type: 'text/vtt' });
    }

    // Format seconds to hh:mm:ss.mmm
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600).toString().padStart(2,'0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2,'0');
        const s = Math.floor(seconds % 60).toString().padStart(2,'0');
        const ms = Math.floor((seconds*1000) % 1000).toString().padStart(3,'0');
        return `${h}:${m}:${s}.${ms}`;
    }

    // Inject track into the video element
    function injectTrack(cues) {
        const video = document.querySelector('video');
        if (!video) return;

    // Remove existing injected track
        const oldTrack = video.querySelector('track[data-injected="true"]');
        if (oldTrack) oldTrack.remove();

        const blob = createVTTBlob(cues);
        const track = document.createElement('track');
        track.kind = "subtitles";
        track.label = "Mobile Captions";
        track.srclang = "en";
        track.src = URL.createObjectURL(blob);
        track.default = true;
        track.dataset.injected = "true";

        track.addEventListener("load", () => {
            for (const t of video.textTracks) {
                t.mode = "showing"; // Ensure they are visible
            }
            console.log("Track loaded and forced to showing mode");
    });

    video.appendChild(track);
    console.log("Injected WebVTT track for iOS fullscreen");
}

    // Extract cues from YouTube mobile JSON
    function getCuesFromMobileYT() {
        try {
            const player = window.ytInitialPlayerResponse;
            if (!player?.captions?.playerCaptionsTracklistRenderer) return null;
            const tracks = player.captions.playerCaptionsTracklistRenderer.captionTracks;
            if (!tracks || !tracks.length) return null;

            // Fetch first track in WebVTT format
            fetch(tracks[0].baseUrl + "&fmt=vtt")
                .then(r => r.text())
                .then(vttText => {
                    const cues = [];
                    const blocks = vttText.split("\n\n");
                    blocks.forEach(block => {
                        const lines = block.split("\n");
                        if (lines.length >= 3) {
                            const [idx, time, ...txt] = lines;
                            const [start, end] = time.split(" --> ").map(parseVttTime);
                            cues.push({start, end, text: txt.join("\n")});
                        }
                    });
                    injectTrack(cues);
                });
        } catch(e) {
            console.warn("Failed to extract YouTube mobile captions:", e);
        }
    }

    function parseVttTime(t) {
        const parts = t.split(':');
        let seconds = 0;
        if (parts.length === 3) { // hh:mm:ss.mmm
            seconds += parseFloat(parts[0])*3600;
            seconds += parseFloat(parts[1])*60;
            seconds += parseFloat(parts[2]);
        } else if (parts.length === 2) { // mm:ss.mmm
            seconds += parseFloat(parts[0])*60;
            seconds += parseFloat(parts[1]);
        }
        return seconds;
    }

    // Observe video element presence
    const observer = new MutationObserver(() => {
        const video = document.querySelector('video');
        if (video) {
            getCuesFromMobileYT();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
