// ==UserScript==
// @name         Fix MWeb Youtube Fullscreen Captions
// @author       Sukinyu
// @version      0.2.0
// @last         8/29/2025 (mm/dd/yyyy)
// @description  Fix captions on youtube videos in fullscreen mode on iOS (https://m.youtube.com/watch?). Injects a captions track with user-preferred language.
// @match        https://m.youtube.com/watch?*
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
    const userLang = navigator.language.split("-")[0] || "en"; // Use browser language or default to English
    if (
      !newURL.searchParams.has("lang", userLang) &&
      !newURL.searchParams.has("tlang")
    ) {
      newURL.searchParams.set("tlang", userLang);
    }
    const translated = newURL.searchParams.has("tlang");

    const video = document.querySelector("video");
    if (!video) return;

    const tryFetch = (returnFormat) => {
      newURL.searchParams.set("fmt", returnFormat);
      injectedUrls.add(newURL.toString());
      return fetch(newURL).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      });
    };

    const createTrack = (vttUrl) => {
      let track = video.querySelector("track[data-injected]");
      if (track) {
        track.src = vttUrl;
        console.log("Updated captions track:", vttUrl);
      } else {
        track = document.createElement("track");
        track.kind = "captions";
        track.label = "Injected CC";
        track.srclang = "en";
        track.src = vttUrl;
        track.default = true;
        track.setAttribute("data-injected", true);
        video.appendChild(track);
        console.log("Injected captions track:", vttUrl);
      }
      if (translated) {
        track.label += " (TS)"; // short form of "Translated"
      }
    };

    function srv3ToVttBlob(srv3Text) {
      const lines = ["WEBVTT\n\n"];

      const pMatches = srv3Text.matchAll(
        /<p\s+[^>]*t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/gi
      );

      for (const [, tStr, dStr, content] of pMatches) {
        const start = +tStr / 1000;
        const dur = +dStr / 1000;
        const end = start + dur;

        const sMatches = [
          ...content.matchAll(/<s(?:\s+t="(\d+)")?[^>]*>(.*?)<\/s>/gi),
        ];

        if (!sMatches.length) {
          lines.push(`${fmtTime(start)} --> ${fmtTime(end)}`, "", "");
          continue;
        }

        const cueText = sMatches
          .map(([, offsetStr, text], i) => {
            if (!text) return "";
            const abs = start + (+offsetStr || 0) / 1000;
            return text + `<${fmtTime(abs)}>`;
          })
          .join("");

        lines.push(`${fmtTime(start)} --> ${fmtTime(end)}`, cueText, "");
      }

      return URL.createObjectURL(
        new Blob([lines.join("\n")], { type: "text/vtt" })
      );

      function fmtTime(t) {
        const h = Math.floor(t / 3600);
        const m = Math.floor((t % 3600) / 60);
        const s = Math.floor(t % 60);
        const ms = Math.floor((t % 1) * 1000);

        const pad = (n, len = 2) => String(n).padStart(len, "0");
        return h
          ? `${pad(h)}:${pad(m)}:${pad(s)}.${String(ms).padStart(3, "0")}`
          : `${pad(m)}:${pad(s)}.${String(ms).padStart(3, "0")}`;
      }
    }
    // Try VTT first, fallback to SRV3/JSON3/XML
    tryFetch("vtt")
      .then(() => createTrack(newURL.toString()))
      .catch(() =>
        tryFetch("srv3").then((txt) => {
          // Optional: parse SRV3 here and run createTrack with a Blob URL
          console.log("SRV3 fallback");
          createTrack(srv3ToVttBlob(txt));
        })
      );
  }
});

po.observe({ type: "resource", buffered: true });
