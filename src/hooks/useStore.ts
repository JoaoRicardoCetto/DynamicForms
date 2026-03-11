import { useSyncExternalStore, useRef } from 'react';
import { store } from '@/lib/store';

// Cache snapshot to avoid infinite re-renders with useSyncExternalStore
let cachedSnapshot = store.getSnapshot();
store.subscribe(() => {
  cachedSnapshot = store.getSnapshot();
});

function getSnapshot() {
  return cachedSnapshot;
}

const subscribe = (cb: () => void) => store.subscribe(cb);

export function useStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  return { ...snapshot, store };
}
