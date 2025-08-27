// --- Hook XHR ---
const origOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url, ...rest) {
  if (url.includes("/api/")) {
    this.addEventListener("load", function () {
      try {
        if (this.responseText.startsWith("{")) {
          alert("[XHR Captions] " + JSON.parse(this.responseText));
        } else {
          alert("[XHR Captions XML] " + this.responseText.slice(0, 200));
        }
      } catch (e) {
        console.warn("XHR parse fail", e);
      }
    });
  }
  return origOpen.call(this, method, url, ...rest);
};

// --- Hook fetch ---
const origFetch = window.fetch;
window.fetch = async function (input, init) {
  let url = typeof input === "string" ? input : input.url;

  if (url.includes("/api/")) {
    alert("[Fetch Hook] Captions request "+ url);

    try {
      const resp = await origFetch(input, init);
      const clone = resp.clone(); // clone so original can still be read

      clone.text().then(txt => {
        try {
          if (txt.startsWith("{")) {
            alert("[Fetch Captions] "+ JSON.parse(txt));
          } else {
            alert("[Fetch Captions XML] " + txt.slice(0, 200));
          }
        } catch (e) {
          console.warn("Fetch parse fail", e);
        }
      });

      return resp; // return untouched
    } catch (err) {
      console.error("Fetch hook error", err);
      throw err;
    }
  }

  return origFetch(input, init);
};
