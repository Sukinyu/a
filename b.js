new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    if (entry.name.includes("timedtext") || entry.name.includes("texttrack")) {
      alert("Caption request: " entry.name);
    }
  }
}).observe({ entryTypes: ["resource"] });
