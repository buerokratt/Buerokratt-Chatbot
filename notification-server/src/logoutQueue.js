const timeouts = new Map();

function addToLogoutQueue(id, timeout = 10, callback) {
  if (timeouts.has(id)) {
    clearTimeout(timeouts.get(id));
  }

  const handle = setTimeout(async () => {
    timeouts.delete(id);
    try {
      await callback();
    } catch (_) {}
  }, timeout * 1000);

  timeouts.set(id, handle);
}

function removeFromLogoutQueue(id) {
  clearTimeout(timeouts.get(id));
  timeouts.delete(id);
}

module.exports = {
  addToLogoutQueue,
  removeFromLogoutQueue,
};
