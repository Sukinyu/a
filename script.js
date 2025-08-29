// ==UserScript==
// @name         Fix MWeb Youtube Fullscreen Captions
// @author       Sukinyu
// ==/UserScript==

const injectedUrls = new Set();

const po = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    const url = entry.name;
    if (!url.includes("/api/timedtext") || injectedUrls.has(url)) continue;
    injectedUrls.add(url);

    console.log("Caption request detected:", url);
    let newURL = new URL(url);
    const removeParams = [
      "potc",
      "xorb",
      "xobt",
      "xovt",
      "cbr",
      "cbrver",
      "cver",
      "cplayer",
      "cos",
      "cosver",
      "cplatform",
    ];
    [...newURL.searchParams.keys()].forEach(
      (key) => removeParams.includes(key) && newURL.searchParams.delete(key)
    );

    const video = document.querySelector("video");
    if (!video) return;

    const tryFetch = (returnFormat) => {
      newURL.searchParams.set("fmt", returnFormat);
      injectedUrls.add(newURL.toString());
      return fetch(newURL.toString()).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      });
    };

    const createTrack = (vttUrl) => {
      const track = document.createElement("track");
      track.kind = "captions";
      track.label = "Injected CC";
      track.srclang = "en";
      track.src = vttUrl;
      track.default = true;
      video.appendChild(track);
      console.log("Injected captions track:", vttUrl);
    };

    // Try VTT first, fallback to SRV3/JSON3/XML
    tryFetch("vtt")
      .then(() => createTrack(newURL.toString()))
      .catch(() =>
        tryFetch("srv3")
          .then((txt) => {
            console.log("SRV3 fallback");
            // Optional: parse SRV3 here and add

          })
      );
  }
});

po.observe({ type: "resource", buffered: true });
