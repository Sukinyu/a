// ==UserScript==
// @name         Inject YouTube Captions for iOS Fullscreen
// @match        https://m.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function createVTTBlob(cues) {
        let vtt = "WEBVTT\n\n";
        cues.forEach((cue, i) => {
            const start = new Date(cue.start * 1000).toISOString().substr(11, 12);
            const end = new Date(cue.end * 1000).toISOString().substr(11, 12);
            vtt += `${i+1}\n${start} --> ${end}\n${cue.text}\n\n`;
        });
        return new Blob([vtt], {type: 'text/vtt'});
    }

    function injectTrack(cues) {
        const video = document.querySelector('video');
        if (!video) return;

        const blob = createVTTBlob(cues);
        const track = document.createElement('track');
        track.kind = "subtitles";
        track.label = "Injected Subtitles";
        track.srclang = "en";
        track.src = URL.createObjectURL(blob);
        track.default = true;
        video.appendChild(track);
        console.log("Injected captions track for fullscreen");
    }

    function getCuesFromYT() {
        try {
            const player = window.ytInitialPlayerResponse;
            const captionTracks = player.captions.playerCaptionsTracklistRenderer.captionTracks;
            if (!captionTracks || !captionTracks.length) return null;
            
            // Fetch first track
            fetch(captionTracks[0].baseUrl + "&fmt=vtt")
                .then(r => r.text())
                .then(vttText => {
                    const cues = [];
                    // VERY simple parser: split by double newline
                    const blocks = vttText.split("\n\n");
                    blocks.forEach(b => {
                        const lines = b.split("\n");
                        if (lines.length >= 3) {
                            const [idx, time, ...txt] = lines;
                            const [start, end] = time.split(" --> ").map(t => parseTime(t));
                            cues.push({start, end, text: txt.join("\n")});
                        }
                    });
                    injectTrack(cues);
                });
        } catch(e) {
            console.log("Failed to extract YouTube captions:", e);
        }
    }

    function parseTime(t) {
        const [hms, ms] = t.split(".");
        const [h, m, s] = hms.split(":").map(Number);
        return h*3600 + m*60 + s + (ms ? parseFloat("0."+ms) : 0);
    }

    // Wait for video element to appear
    const observer = new MutationObserver(() => {
        if (document.querySelector('video')) {
            getCuesFromYT();
            observer.disconnect();
        }
    });
    observer.observe(document.body, {childList: true, subtree: true});
})();
