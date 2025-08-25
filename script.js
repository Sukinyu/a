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
        if (!video._ccTrack) {
          video._ccTrack = video.addTextTrack("subtitles", "Custom CC", "en");
          video._ccTrack.mode = "showing";
          video._ccTrack.default = true;
        }
        const track = video._ccTrack;
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
