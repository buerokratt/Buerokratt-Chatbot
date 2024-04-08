const abortQueue = [];
const TIMEOUT = process.env.CHAT_TERMINATION_DELAY || 5000;

function addToTerminationQueue(id, callback) {
  setTimeout(async () => {
    const aborts = spliceAborts(id);
    if(aborts.length === 0)
      await callback();
  }, TIMEOUT);
}

function removeFromTerminationQueue(id) {
  abortQueue.push({ id, at: Date.now() });
}

function spliceAborts(id) {
  const abortIndex = abortQueue.findIndex((x) => x.id === id && 5000 > (Date.now() - x.at));
  if(abortIndex === -1) {
    return [];
  }
  return abortQueue.splice(abortIndex, 1);
}

module.exports = {
  addToTerminationQueue,
  removeFromTerminationQueue,
}
