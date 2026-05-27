import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const channelArg = {
  channel: {
    type: "string",
    description:
      "Chzzk channel — either a 32-hex channel id or a chzzk.naver.com URL (e.g. https://chzzk.naver.com/live/<id>).",
  },
};

const sizeArg = {
  size: {
    type: "integer",
    minimum: 1,
    maximum: 50,
    default: 20,
    description: "Maximum number of items to return (1-50).",
  },
};

const keywordArg = {
  keyword: {
    type: "string",
    description: "Search keyword.",
    minLength: 1,
  },
};

export const toolDefinitions: Tool[] = [
  {
    name: "get_channel",
    description:
      "Get Chzzk channel metadata: name, image, description, follower count, openLive flag, verified mark.",
    inputSchema: {
      type: "object",
      properties: { ...channelArg },
      required: ["channel"],
    },
  },
  {
    name: "get_live_status",
    description:
      "Get the lightweight live status for a Chzzk channel — whether it is currently broadcasting, title, category, viewer counts, start time.",
    inputSchema: {
      type: "object",
      properties: { ...channelArg },
      required: ["channel"],
    },
  },
  {
    name: "get_live_detail",
    description:
      "Get extended live info including 720p thumbnail URL. Falls back to live status if the channel is offline.",
    inputSchema: {
      type: "object",
      properties: { ...channelArg },
      required: ["channel"],
    },
  },
  {
    name: "search_channels",
    description: "Search Chzzk channels by keyword.",
    inputSchema: {
      type: "object",
      properties: { ...keywordArg, ...sizeArg },
      required: ["keyword"],
    },
  },
  {
    name: "search_videos",
    description: "Search Chzzk videos (VOD) by keyword.",
    inputSchema: {
      type: "object",
      properties: { ...keywordArg, ...sizeArg },
      required: ["keyword"],
    },
  },
  {
    name: "search_lives",
    description: "Search currently live Chzzk broadcasts by keyword.",
    inputSchema: {
      type: "object",
      properties: { ...keywordArg, ...sizeArg },
      required: ["keyword"],
    },
  },
  {
    name: "list_lives",
    description:
      "List currently live Chzzk broadcasts, ordered by the platform's popularity ranking.",
    inputSchema: {
      type: "object",
      properties: { ...sizeArg },
    },
  },
  {
    name: "get_channel_videos",
    description: "List recent VOD (videos) for a specific Chzzk channel.",
    inputSchema: {
      type: "object",
      properties: { ...channelArg, ...sizeArg },
      required: ["channel"],
    },
  },
];
