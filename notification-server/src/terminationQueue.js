const terminationQueue = new Map();

function addToTerminationQueue(body) {
  removeFromTerminationQueue(id);

  const timeout = setTimeout(async () => {
    await fetch(`${process.env.RUUTER_URL}/end-chat`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    
    terminationQueue.delete(id);
  }, process.env.CHAT_TERMINATION_DELAY || 5000);

  terminationQueue.set(id, timeout);
}

function removeFromTerminationQueue(id) {
  const timeout = terminationQueue.get(id);
  
  if(timeout) {
    clearTimeout(timeout);
  }  
}

module.exports = {
  addToTerminationQueue,
  removeFromTerminationQueue,
}
