#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { ChzzkApiError, ChzzkClient } from "./client/chzzk.js";
import { toolDefinitions } from "./tools/definitions.js";
import { handleGetChannel } from "./tools/handlers/channel.js";
import { handleGetLiveDetail, handleGetLiveStatus } from "./tools/handlers/live.js";
import { handleListLives } from "./tools/handlers/lives.js";
import {
  handleSearchChannels,
  handleSearchLives,
  handleSearchVideos,
} from "./tools/handlers/search.js";
import { handleGetChannelVideos } from "./tools/handlers/videos.js";

class ChzzkServer {
  private readonly server: Server;
  private readonly client: ChzzkClient;

  constructor() {
    this.client = new ChzzkClient({
      nidAut: process.env.CHZZK_NID_AUT,
      nidSes: process.env.CHZZK_NID_SES,
    });

    this.server = new Server(
      { name: "mcp-chzzk", version: "0.1.0" },
      { capabilities: { tools: {} } },
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: toolDefinitions,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (req) => {
      const { name, arguments: args } = req.params;
      try {
        switch (name) {
          case "get_channel":
            return await handleGetChannel(this.client, args);
          case "get_live_status":
            return await handleGetLiveStatus(this.client, args);
          case "get_live_detail":
            return await handleGetLiveDetail(this.client, args);
          case "search_channels":
            return await handleSearchChannels(this.client, args);
          case "search_videos":
            return await handleSearchVideos(this.client, args);
          case "search_lives":
            return await handleSearchLives(this.client, args);
          case "list_lives":
            return await handleListLives(this.client, args);
          case "get_channel_videos":
            return await handleGetChannelVideos(this.client, args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (err) {
        if (err instanceof McpError) throw err;
        if (err instanceof ChzzkApiError) {
          throw new McpError(ErrorCode.InternalError, `Chzzk API error: ${err.message}`);
        }
        throw err;
      }
    });

    this.server.onerror = (e) => {
      console.error("[mcp-chzzk]", e);
    };
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("[mcp-chzzk] stdio server ready");
  }
}

new ChzzkServer().run().catch((err) => {
  console.error("[mcp-chzzk] fatal:", err);
  process.exit(1);
});
