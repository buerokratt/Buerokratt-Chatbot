const timeouts = new Map();
const terminationDelay = process.env.TERMINATION_TIMEOUT || 10;

function addToTerminationQueue(id, timeout = terminationDelay, callback) {
  if (timeouts.has(id)) {
    clearTimeout(timeouts.get(id));
  }

  const handle = setTimeout(async () => {
    timeouts.delete(id);
    await callback();
  }, timeout * 1000);

  timeouts.set(id, handle);
}

function removeFromTerminationQueue(id) {
  clearTimeout(timeouts.get(id));
  timeouts.delete(id);
}

module.exports = {
  addToTerminationQueue,
  removeFromTerminationQueue,
};
