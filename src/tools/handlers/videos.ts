import { ChzzkChannelNotFound, type ChzzkClient } from "../../client/chzzk.js";
import { requireChannelId } from "./channel.js";
import { errorResult, getSize, textResult } from "./shared.js";

export async function handleGetChannelVideos(client: ChzzkClient, args: unknown) {
  const id = requireChannelId(args);
  const size = getSize(args);
  try {
    return textResult(await client.getChannelVideos(id, size));
  } catch (err) {
    if (err instanceof ChzzkChannelNotFound) {
      return errorResult(`No videos found for channel: ${id}`);
    }
    throw err;
  }
}
