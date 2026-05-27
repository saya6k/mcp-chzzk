import { ChzzkChannelNotFound, type ChzzkClient } from "../../client/chzzk.js";
import { requireChannelId } from "./channel.js";
import { textResult, errorResult } from "./shared.js";

export async function handleGetLiveStatus(client: ChzzkClient, args: unknown) {
  const id = requireChannelId(args);
  try {
    return textResult(await client.getLiveStatus(id));
  } catch (err) {
    if (err instanceof ChzzkChannelNotFound) {
      return errorResult(`Channel not found or no live data: ${id}`);
    }
    throw err;
  }
}

export async function handleGetLiveDetail(client: ChzzkClient, args: unknown) {
  const id = requireChannelId(args);
  try {
    return textResult(await client.getLiveDetail(id));
  } catch (err) {
    if (err instanceof ChzzkChannelNotFound) {
      return errorResult(`Channel not found: ${id}`);
    }
    throw err;
  }
}
