import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export type ToolResult = CallToolResult;

export function textResult(data: unknown): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function errorResult(message: string): ToolResult {
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}

export function getSize(args: unknown, fallback = 20): number {
  const raw = (args as { size?: unknown } | null | undefined)?.size;
  if (typeof raw === "number" && Number.isInteger(raw) && raw >= 1 && raw <= 50) {
    return raw;
  }
  return fallback;
}

export function getKeyword(args: unknown): string {
  const kw = (args as { keyword?: unknown } | null | undefined)?.keyword;
  if (typeof kw !== "string" || kw.trim().length === 0) {
    throw new Error("Missing required arg: keyword");
  }
  return kw.trim();
}
