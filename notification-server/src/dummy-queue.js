// to-do: use opensearch to manage this state instead of the dummy function
function DummyQueueNotForProduction(params) {
  let queue = []; 
  return {
    add: id => {
      queue.push(id)
    },
    remove: id => {
      queue = queue.filter(x => x != id)
    },
    findOrder: id => {
      return queue.findIndex(id) + 1;
    }
  }
}

module.exports = DummyQueueNotForProduction();
