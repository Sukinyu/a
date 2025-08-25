// Hook into YouTube's caption XHR
const origOpen = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function (method, url, ...rest) {
  this.addEventListener("load", function () {
    if (url.includes("/api/timedtext") && this.responseText.startsWith("{")) {
      try {
        const data = JSON.parse(this.responseText);
        if (!data.events) return;

        const video = document.querySelector("video");
        if (!video) return;
        // Reuse track if it exists, else make one
        const Track = document.createElement("track");
        Track.default = true;  // important for iOS to try displaying it
        Track.mode = true;
        const track = Track.track;
        track.kind = "subtitles";
        track.label = "Custom CC";
        track.srclang = "en";

        video.appendChild(Track);
        // Add cues for each event
        for (const ev of data.events) {
          if (!ev.segs) continue;
          const text = ev.segs.map(s => s.utf8).join("").trim();
          if (!text) continue;

          const start = ev.tStartMs / 1000;
          const end = (ev.tStartMs + (ev.dDurationMs || 2000)) / 1000;

          // Prevent duplicate cues
          if ([...track.cues].some(c => Math.abs(c.startTime - start) < 0.05)) continue;

          track.addCue(new VTTCue(start, end, text));
        }
      } catch (e) {
        alert("Caption parse failed: " + e);
      }
    }
  });
  return origOpen.call(this, method, url, ...rest);
};
