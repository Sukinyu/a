// Hook into YouTube's caption XHR
const origOpen = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function (method, url, ...rest) {
  this.addEventListener("load", function () {
    if (url.includes("/api/timedtext")) {
      try {
        const data = JSON.parse(this.responseText);
        if (!data.events) return;

        // Get video element
        const video = document.querySelector("video");
        if (!video) return;

        // Make a captions track
        let track = video.querySelector("track[kind='subtitles']");
        if (!track) {
          track = document.createElement("track");
          track.kind = "subtitles";
          track.label = "Custom CC";
          track.srclang = "en";
          track.default = true;
          video.appendChild(track);
        }

        // Wait for track to be ready
        track.addEventListener("load", () => {
          const cues = track.track;
          cues.mode = "showing";
          // Clear old cues
          while (cues.cues.length > 0) cues.removeCue(cues.cues[0]);

          // Convert json3 events → VTTCue
          for (const ev of data.events) {
            if (!ev.segs) continue;
            const text = ev.segs.map(s => s.utf8).join("");
            if (!text.trim()) continue;

            const start = ev.tStartMs / 1000;
            const end = (ev.tStartMs + (ev.dDurationMs || 2000)) / 1000;
            const cue = new VTTCue(start, end, text);
            cues.addCue(cue);
          }
        }, { once: true });

      } catch (e) {
        console.warn("Caption parse failed:", e);
      }
    }
  });
  return origOpen.call(this, method, url, ...rest);
};
