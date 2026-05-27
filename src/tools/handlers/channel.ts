import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { ChzzkChannelNotFound, type ChzzkClient } from "../../client/chzzk.js";
import { extractChannelId } from "../../utils/format.js";
import { textResult, errorResult } from "./shared.js";

function requireChannelId(args: unknown): string {
  const channel = (args as { channel?: unknown } | null | undefined)?.channel;
  if (typeof channel !== "string") {
    throw new McpError(ErrorCode.InvalidParams, "Missing required arg: channel");
  }
  const id = extractChannelId(channel);
  if (!id) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid channel — expected a 32-hex id or chzzk.naver.com URL, got: ${channel}`,
    );
  }
  return id;
}

export async function handleGetChannel(client: ChzzkClient, args: unknown) {
  const id = requireChannelId(args);
  try {
    return textResult(await client.getChannel(id));
  } catch (err) {
    if (err instanceof ChzzkChannelNotFound) {
      return errorResult(`Channel not found: ${id}`);
    }
    throw err;
  }
}

export { requireChannelId };
