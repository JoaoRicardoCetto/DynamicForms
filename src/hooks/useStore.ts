import { useSyncExternalStore, useCallback } from 'react';
import { store } from '@/lib/store';

export function useStore() {
  const snapshot = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getSnapshot(),
  );
  
  // Force re-render helper
  const getSnapshot = useCallback(() => store.getSnapshot(), []);
  
  return { ...snapshot, store };
}
