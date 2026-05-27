# mcp-chzzk

MCP (Model Context Protocol) server for [Chzzk](https://chzzk.naver.com/), Naver's Korean live-streaming platform.

Exposes Chzzk channel, live, search, and VOD lookups as MCP tools so Claude (or any MCP client) can query them.

> ⚠️ Chzzk does not publish an official public API. This server calls the same undocumented endpoints the web client uses. They may change without notice.

## Tools

| Tool | Description |
|------|-------------|
| `get_channel` | Channel metadata (name, follower count, description, verified mark) |
| `get_live_status` | Live status — is broadcasting, title, category, viewer count, start time |
| `get_live_detail` | Extended live info including 720p thumbnail URL |
| `search_channels` | Search channels by keyword |
| `search_videos` | Search VOD by keyword |
| `search_lives` | Search currently live broadcasts by keyword |
| `list_lives` | List currently live broadcasts (popularity order) |
| `get_channel_videos` | List recent VOD for a channel |

Channel arguments accept either a 32-hex channel id or a `chzzk.naver.com/[live/]<id>` URL.

## Install & Build

```bash
npm install
npm run build
```

## Configuration

All Chzzk endpoints exposed here are public — **no authentication is required**.

For private or restricted content (adult-only channels, subscriber views), provide Naver session cookies via env vars:

```bash
export CHZZK_NID_AUT="..."
export CHZZK_NID_SES="..."
```

You can extract these from your browser's DevTools → Application → Cookies → `naver.com` while logged in.

## Run

Direct:

```bash
node build/index.js
```

With MCP Inspector (browser-based debugger):

```bash
npm run inspect
```

## Use from Claude Code

Add to `~/.claude/settings.json` or `.mcp.json`:

```json
{
  "mcpServers": {
    "chzzk": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-chzzk/build/index.js"],
      "env": {
        "CHZZK_NID_AUT": "",
        "CHZZK_NID_SES": ""
      }
    }
  }
}
```

Then in Claude Code, run `/mcp` to confirm the `chzzk` server appears and the tools are listed.

## References

- [hacs-chzzk](https://github.com/saya6k/hacs-chzzk) — Home Assistant integration with the verified Chzzk endpoints this server is built on.
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- [twitch-mcp-server](https://github.com/mtane0412/twitch-mcp-server) — structural reference.

## License

MIT
