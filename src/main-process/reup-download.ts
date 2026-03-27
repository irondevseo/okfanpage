import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import axios from 'axios';

/**
 * Tải file video (URL nguồn reup) về đĩa — kèm Cookie nếu là fbcdn.
 */
export async function downloadVideoToFile(
  url: string,
  destPath: string,
  cookieHeader?: string,
): Promise<void> {
  const res = await axios.get(url, {
    responseType: 'stream',
    headers: cookieHeader?.trim() ? { Cookie: cookieHeader.trim() } : {},
    timeout: 600_000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    validateStatus: () => true,
  });

  if (res.status >= 400) {
    throw new Error(`Tải video thất bại (HTTP ${res.status}).`);
  }

  await pipeline(res.data, createWriteStream(destPath));
}
