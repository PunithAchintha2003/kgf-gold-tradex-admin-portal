import { useState, useCallback } from 'react';
import { BackupScope, downloadBackupForScope } from '../services/backupService';
import { useToast } from '../contexts/ToastContext';

export function useDataBackup(scope: BackupScope = 'platform') {
  const [backingUp, setBackingUp] = useState(false);
  const { showSuccess, showError } = useToast();

  const runBackup = useCallback(async () => {
    setBackingUp(true);
    try {
      const { filename } = await downloadBackupForScope(scope);
      showSuccess('Backup downloaded', {
        description: `Saved ${filename}. Store it securely offline.`,
      });
    } catch (e: unknown) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: Blob | { error?: string } } }).response?.data
          : undefined;
      let description = 'Could not generate the backup. Try again in a few minutes.';
      if (message instanceof Blob) {
        try {
          const text = await message.text();
          const parsed = JSON.parse(text) as { error?: string };
          if (parsed.error) description = parsed.error;
        } catch {
          /* use default */
        }
      } else if (message && typeof message === 'object' && 'error' in message && message.error) {
        description = String(message.error);
      } else if (e instanceof Error && e.message) {
        description = e.message;
      }
      showError('Backup failed', { description });
    } finally {
      setBackingUp(false);
    }
  }, [scope, showSuccess, showError]);

  return { backingUp, runBackup };
}
