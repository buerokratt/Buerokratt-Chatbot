const terminationQueue = new Map();

function addToTerminationQueue(id, callback) {
  const timeout = setTimeout(async () => {
    if(!isAborted(id))
      await callback();
    
    cleanUp(id);
  }, process.env.CHAT_TERMINATION_DELAY || 5000);

  terminationQueue.set(`${id}-timeout`, timeout);
}

function removeFromTerminationQueue(id) {
  terminationQueue.set(`${id}-abort`, true);
}

function isAborted(id) {
  return terminationQueue.get(`${id}-abort`)
}

function cleanUp(id) {
  terminationQueue.delete(`${id}-timeout`);
  terminationQueue.delete(`${id}-abort`);
}

module.exports = {
  addToTerminationQueue,
  removeFromTerminationQueue,
}
