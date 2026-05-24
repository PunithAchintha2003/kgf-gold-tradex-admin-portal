import api from './api';

export type BackupScope = 'platform' | 'merchant';

function parseFilename(contentDisposition: string | undefined, fallback: string): string {
  if (!contentDisposition) return fallback;
  const match = /filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i.exec(contentDisposition);
  return match?.[1]?.trim() || fallback;
}

function triggerBlobDownload(blob: Blob, contentDisposition: string | undefined, fallback: string) {
  if (blob.size === 0) {
    throw new Error('Backup file is empty or invalid');
  }

  const filename = parseFilename(contentDisposition, fallback);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return { filename };
}

async function downloadBackupFromPath(
  path: string,
  fallbackPrefix: string
): Promise<{ filename: string }> {
  const response = await api.get<Blob>(path, {
    responseType: 'blob',
    timeout: 300_000,
    headers: { Accept: 'application/zip' },
  });

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const fallback = `${fallbackPrefix}_${stamp}.zip`;

  return triggerBlobDownload(
    response.data,
    response.headers['content-disposition'] as string | undefined,
    fallback
  );
}

/** Full platform backup (super admin). */
export async function downloadPlatformBackup(): Promise<{ filename: string }> {
  return downloadBackupFromPath('/admin/backup', 'kgf-gold-tradex-backup');
}

/** Merchant-scoped backup (own catalog, sales, auctions, messages). */
export async function downloadMerchantBackup(): Promise<{ filename: string }> {
  return downloadBackupFromPath('/merchant/backup', 'kgf-merchant-backup');
}

export function downloadBackupForScope(scope: BackupScope): Promise<{ filename: string }> {
  return scope === 'merchant' ? downloadMerchantBackup() : downloadPlatformBackup();
}
