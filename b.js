const origOpen = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function (method, url, ...rest) {
  this.addEventListener("load", function () {
    try {
      alert("XHR response:\n" + this.responseText.slice(0, 100));
    } catch (e) {
      alert("Error: " + e);
    }
  });
  return origOpen.call(this, method, url, ...rest);
};
