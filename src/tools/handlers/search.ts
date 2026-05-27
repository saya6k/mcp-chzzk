import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import type { ChzzkClient } from "../../client/chzzk.js";
import { getKeyword, getSize, textResult } from "./shared.js";

function getArgs(args: unknown): { keyword: string; size: number } {
  try {
    return { keyword: getKeyword(args), size: getSize(args) };
  } catch (err) {
    throw new McpError(ErrorCode.InvalidParams, (err as Error).message);
  }
}

export async function handleSearchChannels(client: ChzzkClient, args: unknown) {
  const { keyword, size } = getArgs(args);
  return textResult(await client.searchChannels(keyword, size));
}

export async function handleSearchVideos(client: ChzzkClient, args: unknown) {
  const { keyword, size } = getArgs(args);
  return textResult(await client.searchVideos(keyword, size));
}

export async function handleSearchLives(client: ChzzkClient, args: unknown) {
  const { keyword, size } = getArgs(args);
  return textResult(await client.searchLives(keyword, size));
}
