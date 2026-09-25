const activeConnections = new Map();
const stoppedChannels = new Set();

/**
 * Register an AbortController for an in-flight upstream request belonging to a
 * connection, so it can be cancelled when the browser disconnects.
 * @param {string} connectionId
 * @param {AbortController} controller
 */
function registerAbortController(connectionId, controller) {
  const connData = activeConnections.get(connectionId);
  if (!connData) return;
  if (!connData.abortControllers) {
    connData.abortControllers = new Set();
  }
  connData.abortControllers.add(controller);
}

/**
 * Remove a previously registered AbortController (upstream request finished).
 * @param {string} connectionId
 * @param {AbortController} controller
 */
function unregisterAbortController(connectionId, controller) {
  const connData = activeConnections.get(connectionId);
  connData?.abortControllers?.delete(controller);
}

/**
 * Abort every in-flight upstream request for a connection. Called when the
 * browser goes away, so we stop paying for generation nobody will read.
 * @param {string} connectionId
 */
function abortConnectionRequests(connectionId) {
  const connData = activeConnections.get(connectionId);
  if (!connData?.abortControllers) return;

  for (const controller of connData.abortControllers) {
    try {
      controller.abort();
    } catch (error) {
      console.error(`Failed to abort upstream request for ${connectionId}:`, error);
    }
  }
  connData.abortControllers.clear();
}

module.exports = {
  activeConnections,
  stoppedChannels,
  registerAbortController,
  unregisterAbortController,
  abortConnectionRequests,
};
