let ready = false;
const listeners = new Set<() => void>();

export function isStoryReady() {
  return ready;
}

export function markStoryReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((listener) => listener());
  listeners.clear();
}

export function onStoryReady(listener: () => void) {
  if (ready) {
    listener();
    return () => {};
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
