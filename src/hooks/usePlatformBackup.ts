import { useDataBackup } from './useDataBackup';

/** @deprecated Use useDataBackup('platform') */
export function usePlatformBackup() {
  return useDataBackup('platform');
}
