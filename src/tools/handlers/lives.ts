import type { ChzzkClient } from "../../client/chzzk.js";
import { getSize, textResult } from "./shared.js";

export async function handleListLives(client: ChzzkClient, args: unknown) {
  return textResult(await client.listLives(getSize(args)));
}
