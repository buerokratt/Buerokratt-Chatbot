const abortQueue = [];
const timeouts = new Map();

function addToLogoutQueue(id, timeout = 10, callback) {
    if (timeouts.has(id)) {
        clearTimeout(timeouts.get(id));
    }

    const handle = setTimeout(async () => {
        const aborts = spliceAborts(id);
        timeouts.delete(id);

        if (aborts.length === 0) {
            try {
                await callback();
            } catch (_) { }
        }
    }, timeout * 1000);

    timeouts.set(id, handle);
}

function removeFromLogoutQueue(id) {
    abortQueue.push({id, at: Date.now()});
}

function spliceAborts(id) {
    const abortIndex = abortQueue.findIndex((x) => x.id === id && 5000 > (Date.now() - x.at));
    if (abortIndex === -1) {
        return [];
    }
    return abortQueue.splice(abortIndex, 1);
}

module.exports = {
    addToLogoutQueue,
    removeFromLogoutQueue,
}
