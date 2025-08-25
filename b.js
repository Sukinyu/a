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

async function injectCaptionsFromPlayer() {
  const player = window.ytInitialPlayerResponse;
  if (!player?.captions?.playerCaptionsTracklistRenderer?.captionTracks) return;

  const trackInfo = player.captions.playerCaptionsTracklistRenderer.captionTracks[0];
  const video = document.querySelector("video");
  if (!video || !trackInfo) return;
/*
  const url = trackInfo.baseUrl + "&pot=Mlq3f81rUkG0Brc8Sb3X66CD2b_5LFvcmbyWCdAU62f4YnDZTWY1-tBntmhO4sV5mDQSUV5clQlRYexOnxDLClUPpDxoyldvLgyi_Elmy5m6wy5a6Qg_lVbzK6M%3D" + "&c=MWEB" + "&fmt=json3"+"&tlang=en";
   json3 = await fetch(url)
    const data = await json3.json();
alert(data);
        if (!data.events) return;

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
*/
vtt = "WEBVTT\n\n00:00:00.000 --> 01:00:00.000\nIs this working?"
        const track = document.createElement("track");
        track.kind = "captions";
        track.label = "Custom CC";
        track.srclang = "en";
        track.src = URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
        track.default = true;
        track.dataset.injected = "true";
        video.appendChild(track);
alert(track);
};

setTimeout(injectCaptionsFromPlayer, 200);
