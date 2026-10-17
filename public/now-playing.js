// Poll only while the dock is usable. Manual refreshes share any pending request
// so a slow native media provider cannot accumulate concurrent requests.
// Allow the host's 20-second native timeout to finish before retrying a stalled read.
export function createNowPlayingPoller({ load, onChange, isActive, intervalMs = 2000, timeoutMs = 25000 }) {
  let pending = null, controller = null, stopped = false;
  function refresh() {
    if (stopped) return Promise.resolve();
    if (pending) return pending;
    controller = new AbortController();
    const signal = controller.signal;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    pending = Promise.resolve()
      .then(() => load(signal))
      .then((media) => { if (!stopped) onChange(media); })
      .finally(() => { clearTimeout(timeout); pending = null; controller = null; });
    return pending;
  }
  const timer = setInterval(() => {
    if (isActive()) refresh().catch(() => { /* Retry transient failures on the next poll. */ });
  }, intervalMs);
  return {
    refresh,
    stop() { stopped = true; clearInterval(timer); controller?.abort(); },
  };
}
