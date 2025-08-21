async function injectJson3Captions() {
  const res = await fetch(ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.captionTracks[0].baseUrl+"&fmt=json3");
  const data = await res.json();

  // Create a new track
  const track = document.querySelector("video").addTextTrack("subtitles", "Injected Captions", "en");
  track.mode = "showing"; // show by default

  for (const event of data.events) {
    const start = event.tStartMs / 1000;
    const end = (event.tStartMs + (event.dDurationMs || 2000)) / 1000;
    const text = (event.segs || []).map(s => s.utf8).join("") || "";

    if (text.trim()) {
      const cue = new VTTCue(start, end, text);
      track.addCue(cue);
    }
  }

  console.log("Injected", track.cues.length, "cues");
  alert(ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.captionTracks[0].baseUrl)
}
setTimeout(injectJson3Captions,200);
