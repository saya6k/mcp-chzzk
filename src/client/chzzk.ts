import { parseKstDate, resolveThumbnail } from "../utils/format.js";

const BASE_URL = "https://api.chzzk.naver.com";

const URLS = {
  channel: (id: string) => `${BASE_URL}/service/v1/channels/${id}`,
  liveStatus: (id: string) => `${BASE_URL}/polling/v2/channels/${id}/live-status`,
  liveDetail: (id: string) => `${BASE_URL}/service/v2/channels/${id}/live-detail`,
  channelVideos: (id: string, size: number) =>
    `${BASE_URL}/service/v1/channels/${id}/videos?size=${size}`,
  searchChannels: (kw: string, size: number) =>
    `${BASE_URL}/service/v1/search/channels?keyword=${encodeURIComponent(kw)}&size=${size}`,
  searchVideos: (kw: string, size: number) =>
    `${BASE_URL}/service/v1/search/videos?keyword=${encodeURIComponent(kw)}&size=${size}`,
  searchLives: (kw: string, size: number) =>
    `${BASE_URL}/service/v1/search/lives?keyword=${encodeURIComponent(kw)}&size=${size}`,
  lives: (size: number) => `${BASE_URL}/service/v1/lives?size=${size}`,
};

const DEFAULT_HEADERS: Record<string, string> = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (mcp-chzzk; +https://github.com/saya6k/mcp-chzzk) mcp-chzzk/0.1",
};

export class ChzzkApiError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "ChzzkApiError";
  }
}

export class ChzzkChannelNotFound extends ChzzkApiError {
  constructor(message: string) {
    super(message);
    this.name = "ChzzkChannelNotFound";
  }
}

export interface ChannelInfo {
  channelId: string;
  channelName: string;
  channelImageUrl: string | null;
  channelDescription: string | null;
  followerCount: number | null;
  openLive: boolean;
  verifiedMark: boolean;
}

export interface LiveStatus {
  isLive: boolean;
  title: string | null;
  categoryType: string | null;
  categoryValue: string | null;
  concurrentUserCount: number | null;
  accumulateCount: number | null;
  openDate: string | null;
  adult: boolean;
  chatChannelId: string | null;
}

export interface LiveDetail extends LiveStatus {
  liveImageUrl: string | null;
  liveId: number | null;
  channel: ChannelInfo | null;
}

export interface ChzzkClientOptions {
  nidAut?: string;
  nidSes?: string;
  timeoutMs?: number;
}

function toInt(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function toStr(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value);
  return s.length === 0 ? null : s;
}

function parseChannelInfo(channelId: string, data: Record<string, unknown>): ChannelInfo {
  return {
    channelId,
    channelName: String(data.channelName ?? ""),
    channelImageUrl: toStr(data.channelImageUrl),
    channelDescription: toStr(data.channelDescription),
    followerCount: toInt(data.followerCount),
    openLive: Boolean(data.openLive),
    verifiedMark: Boolean(data.verifiedMark),
  };
}

function parseLiveStatus(data: Record<string, unknown>): LiveStatus {
  const status = String(data.status ?? "").toUpperCase();
  return {
    isLive: status === "OPEN",
    title: toStr(data.liveTitle),
    categoryType: toStr(data.categoryType),
    categoryValue: toStr(data.liveCategoryValue),
    concurrentUserCount: toInt(data.concurrentUserCount),
    accumulateCount: toInt(data.accumulateCount),
    openDate: parseKstDate(toStr(data.openDate)),
    adult: Boolean(data.adult),
    chatChannelId: toStr(data.chatChannelId),
  };
}

export class ChzzkClient {
  private readonly cookies: Record<string, string>;
  private readonly timeoutMs: number;

  constructor(opts: ChzzkClientOptions = {}) {
    const cookies: Record<string, string> = {};
    if (opts.nidAut) cookies.NID_AUT = opts.nidAut;
    if (opts.nidSes) cookies.NID_SES = opts.nidSes;
    this.cookies = cookies;
    this.timeoutMs = opts.timeoutMs ?? 10_000;
  }

  get authenticated(): boolean {
    return "NID_AUT" in this.cookies && "NID_SES" in this.cookies;
  }

  private async getJson(url: string): Promise<unknown> {
    const headers: Record<string, string> = { ...DEFAULT_HEADERS };
    const cookieEntries = Object.entries(this.cookies);
    if (cookieEntries.length > 0) {
      headers["Cookie"] = cookieEntries.map(([k, v]) => `${k}=${v}`).join("; ");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(url, { headers, signal: controller.signal });
    } catch (err) {
      throw new ChzzkApiError(`HTTP error from ${url}: ${(err as Error).message}`, err);
    } finally {
      clearTimeout(timer);
    }

    if (response.status === 404) {
      throw new ChzzkChannelNotFound(`404 from ${url}`);
    }
    if (!response.ok) {
      throw new ChzzkApiError(`HTTP ${response.status} from ${url}`);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (err) {
      throw new ChzzkApiError(`Invalid JSON from ${url}: ${(err as Error).message}`, err);
    }

    if (!payload || typeof payload !== "object") {
      throw new ChzzkApiError(`Non-object payload from ${url}`);
    }
    const env = payload as { code?: unknown; message?: unknown; content?: unknown };
    if (env.code !== undefined && env.code !== null && env.code !== 200) {
      throw new ChzzkApiError(`${url}: code=${env.code} message=${env.message}`);
    }
    if (env.content === null || env.content === undefined) {
      throw new ChzzkChannelNotFound(`Empty content from ${url}`);
    }
    return env.content;
  }

  async getChannel(channelId: string): Promise<ChannelInfo> {
    const content = (await this.getJson(URLS.channel(channelId))) as Record<string, unknown>;
    return parseChannelInfo(channelId, content);
  }

  async getLiveStatus(channelId: string): Promise<LiveStatus> {
    const content = (await this.getJson(URLS.liveStatus(channelId))) as Record<string, unknown>;
    return parseLiveStatus(content);
  }

  async getLiveDetail(channelId: string): Promise<LiveDetail> {
    let content: Record<string, unknown>;
    try {
      content = (await this.getJson(URLS.liveDetail(channelId))) as Record<string, unknown>;
    } catch (err) {
      if (err instanceof ChzzkChannelNotFound) {
        const status = await this.getLiveStatus(channelId);
        return {
          ...status,
          isLive: false,
          liveImageUrl: null,
          liveId: null,
          channel: null,
        };
      }
      throw err;
    }
    const base = parseLiveStatus(content);
    const channelRaw = content.channel as Record<string, unknown> | undefined;
    return {
      ...base,
      liveImageUrl: resolveThumbnail(toStr(content.liveImageUrl)),
      liveId: toInt(content.liveId),
      channel: channelRaw ? parseChannelInfo(channelId, channelRaw) : null,
    };
  }

  async searchChannels(keyword: string, size = 20): Promise<unknown> {
    return this.getJson(URLS.searchChannels(keyword, size));
  }

  async searchVideos(keyword: string, size = 20): Promise<unknown> {
    return this.getJson(URLS.searchVideos(keyword, size));
  }

  async searchLives(keyword: string, size = 20): Promise<unknown> {
    return this.getJson(URLS.searchLives(keyword, size));
  }

  async listLives(size = 20): Promise<unknown> {
    return this.getJson(URLS.lives(size));
  }

  async getChannelVideos(channelId: string, size = 20): Promise<unknown> {
    return this.getJson(URLS.channelVideos(channelId, size));
  }
}
