try {
(() => {
  const script = document.createElement("script");
  script.textContent = `
    (function(){
      const origOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (url.includes("/api/timedtext")) {
          this.addEventListener("load", function() {
            alert("Captured captions XHR: "+ url);
            alert("Response (first 200 chars): "+ this.responseText.slice(0,200));
          });
        }
        return origOpen.call(this, method, url, ...rest);
      };
      alert("✅ XHR hook installed");
    })();
  `;
  document.documentElement.appendChild(script);
  script.remove();
})();
} catch (e) {alert("Error: " + e);}
