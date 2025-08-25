function formatTime(ms) {
  const totalSeconds = ms / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const millis = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 1000);

  const hh = hours > 0 ? String(hours).padStart(2, "0") + ":" : "";
  const mm = String(hours > 0 ? minutes : minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const mmm = String(millis).padStart(3, "0");

  return `${hh}${mm}:${ss}.${mmm}`;
}

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

        let vtt = "WEBVTT\n\n";
        data.events.forEach(ev => {
          if (!ev.segs) return;
          const text = ev.segs.map(s => s.utf8).join("").trim();
          if (!text) return;

          const start = formatTime(ev.tStartMs);
          const end = formatTime(ev.tStartMs + (ev.dDurationMs || 2000));

          vtt += `${start} --> ${end}\n${text}\n\n`;
        });

        const oldTrack = video.querySelector('track[data-injected="true"]');
        if (oldTrack) oldTrack.remove();

        const track = document.createElement("track");
        track.kind = "subtitles";
        track.label = "Custom CC";
        track.srclang = "en";
        track.src = URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
        track.default = true;
        track.dataset.injected = "true";

        video.appendChild(track);
        console.log("Injected WebVTT track for iOS fullscreen");

      } catch (e) {
        console.warn("Caption parse failed:", e);
      }
    }
  });
  return origOpen.call(this, method, url, ...rest);
};
