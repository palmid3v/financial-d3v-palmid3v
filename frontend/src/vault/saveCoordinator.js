export function createSerialQueue() {
  let tail = Promise.resolve();
  return (operation) => {
    const result = tail.then(operation, operation);
    tail = result.then(() => undefined, () => undefined);
    return result;
  };
}

export function isRevisionCurrent(savedRevision, currentRevision) {
  return savedRevision === currentRevision;
}
