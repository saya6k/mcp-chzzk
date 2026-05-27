const CHANNEL_ID_RE = /^[0-9a-fA-F]{32}$/;
const CHANNEL_URL_RE = /chzzk\.naver\.com\/(?:live\/)?([0-9a-fA-F]{32})/;

export function extractChannelId(value: string | undefined | null): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  const urlMatch = trimmed.match(CHANNEL_URL_RE);
  if (urlMatch) return urlMatch[1].toLowerCase();
  if (CHANNEL_ID_RE.test(trimmed)) return trimmed.toLowerCase();
  return null;
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function parseKstDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  const asUtc = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
  return new Date(asUtc - KST_OFFSET_MS).toISOString();
}

export function resolveThumbnail(url: string | null | undefined, size = 720): string | null {
  if (!url) return null;
  return url.replace("{type}", String(size));
}
