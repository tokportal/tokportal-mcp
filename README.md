# tokportal-mcp

[![npm](https://img.shields.io/npm/v/tokportal-mcp.svg)](https://www.npmjs.com/package/tokportal-mcp)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

TokPortal is the managed social infrastructure API: real TikTok, Instagram and YouTube accounts created, warmed and operated by human account managers in 16+ countries — exposed as a REST API and an MCP server. No OAuth per account, no 25-posts/day cap, no app review.

Docs https://developers.tokportal.com · API base https://app.tokportal.com/api/ext · OpenAPI https://developers.tokportal.com/openapi.json · MCP remote https://app.tokportal.com/api/ext/mcp · Get an API key https://app.tokportal.com/developer/api-keys · llms.txt https://developers.tokportal.com/llms.txt

---

`tokportal-mcp` is the official [Model Context Protocol](https://modelcontextprotocol.io) server for the TokPortal API. It exposes every public API operation (91 tools) to Claude, Cursor, VS Code, Windsurf, Codex, Gemini CLI and any other MCP client — create bundles, upload videos, configure and publish accounts, read analytics, manage webhooks.

Two ways to use it:

| Mode | Transport | When to use |
| --- | --- | --- |
| **Local** (`npx tokportal-mcp`) | stdio | Desktop clients, local agents, file uploads from disk |
| **Remote** (`https://app.tokportal.com/api/ext/mcp`) | Streamable HTTP | Hosted agents, no install; same tool catalogue |

Requires Node.js 20 or newer for the local server. Get an API key at https://app.tokportal.com/developer/api-keys (format `sk_` + 64 hex chars).

## 30-second quickstart

```bash
npm install -g tokportal-mcp
TOKPORTAL_API_KEY=sk_your_key_here tokportal-mcp
```

The server speaks MCP over stdio. Point any MCP client at it and ask, for example:

> "Create a TikTok bundle in the USA with 5 videos, upload `./launch.mp4` as video 1 with the caption 'Day 1', then publish the bundle."

That call chain uses `tokportal_create_bundle` → `tokportal_upload_video_direct` → `tokportal_configure_bundle_video` → `tokportal_publish_bundle`.

Programmatic smoke test with the MCP SDK:

```js
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "demo", version: "1.0.0" });
await client.connect(
  new StdioClientTransport({
    command: "npx",
    args: ["-y", "tokportal-mcp"],
    env: { ...process.env, TOKPORTAL_API_KEY: process.env.TOKPORTAL_API_KEY },
  }),
);

const { tools } = await client.listTools(); // 91 tools
const me = await client.callTool({ name: "tokportal_get_current_user", arguments: {} });
console.log(tools.length, me.content[0].text);
```

## Client configuration

Replace `sk_your_key_here` with your key. Every snippet below is the local stdio server; the remote URL variant is listed at the end.

### Cursor

`~/.cursor/mcp.json` (or `.cursor/mcp.json` in a project):

```json
{
  "mcpServers": {
    "tokportal": {
      "command": "npx",
      "args": ["-y", "tokportal-mcp"],
      "env": { "TOKPORTAL_API_KEY": "sk_your_key_here" }
    }
  }
}
```

### Claude Desktop

`claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`):

```json
{
  "mcpServers": {
    "tokportal": {
      "command": "npx",
      "args": ["-y", "tokportal-mcp"],
      "env": { "TOKPORTAL_API_KEY": "sk_your_key_here" }
    }
  }
}
```

### Claude Code

```bash
claude mcp add tokportal -e TOKPORTAL_API_KEY=sk_your_key_here -- npx -y tokportal-mcp
# or the remote server:
claude mcp add --transport http tokportal https://app.tokportal.com/api/ext/mcp --header "X-API-Key: sk_your_key_here"
```

### VS Code (GitHub Copilot agent mode)

`.vscode/mcp.json`:

```json
{
  "servers": {
    "tokportal": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "tokportal-mcp"],
      "env": { "TOKPORTAL_API_KEY": "sk_your_key_here" }
    }
  }
}
```

### Windsurf

`~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "tokportal": {
      "command": "npx",
      "args": ["-y", "tokportal-mcp"],
      "env": { "TOKPORTAL_API_KEY": "sk_your_key_here" }
    }
  }
}
```

### OpenAI Codex CLI

`~/.codex/config.toml`:

```toml
[mcp_servers.tokportal]
command = "npx"
args = ["-y", "tokportal-mcp"]
env = { TOKPORTAL_API_KEY = "sk_your_key_here" }
```

### Gemini CLI

`~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "tokportal": {
      "command": "npx",
      "args": ["-y", "tokportal-mcp"],
      "env": { "TOKPORTAL_API_KEY": "sk_your_key_here" }
    }
  }
}
```

### Remote server (Streamable HTTP)

Any client that supports remote MCP servers can connect to
`https://app.tokportal.com/api/ext/mcp` with either an `X-API-Key: sk_...` header
or `Authorization: Bearer sk_...`. Example for clients using the `url` form:

```json
{
  "mcpServers": {
    "tokportal": {
      "url": "https://app.tokportal.com/api/ext/mcp",
      "headers": { "X-API-Key": "sk_your_key_here" }
    }
  }
}
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `TOKPORTAL_API_KEY` | yes | API key (`sk_` + 64 hex). Only a SHA-256 hash is stored server-side. |
| `TOKPORTAL_BASE_URL` | no | Defaults to `https://app.tokportal.com/api/ext`. |

## How the tools work

The server exposes TokPortal API actions as MCP tools over stdio. It is generated from the public API schema and uses the same `X-API-Key` authentication as the HTTP API.

- Tool names are `tokportal_<operation_id_snake_case>` (`tokportal_create_bundle`, `tokportal_list_accounts`, ...). Path and query parameters are top-level inputs; JSON bodies go in `body`.
- Every tool carries MCP annotations: `title`, `readOnlyHint` (GET), `destructiveHint` (DELETE / cancel / unpublish / reset / unschedule / revoke), `idempotentHint` (GET/PUT/DELETE) and `openWorldHint: false`, so clients can ask for confirmation on destructive calls.
- Multipart upload tools are generated from OpenAPI too. Binary fields are exposed as local path inputs such as `file_path`, with the remaining form fields exposed by their schema names.
- Mutations accept an optional `idempotency_key` (sent as `Idempotency-Key`) except for secret-bearing operations (credential reveal, verification codes, webhook creation, signed upload URLs, report creation) which are never replayed.

The MCP server sends `X-TokPortal-Client: tokportal-mcp/1.12.1` on API requests for observability and support diagnostics.

Failed tool calls return an error result with a `diagnostics` object containing `request_id`, `retry_after_seconds`, and `rate_limit` when those headers are available.

Legacy config using the globally installed binary still works:

```json
{
  "mcpServers": {
    "tokportal": {
      "command": "tokportal-mcp",
      "env": {
        "TOKPORTAL_API_KEY": "sk_your_key_here"
      }
    }
  }
}
```

## Source of truth

This package is generated from the TokPortal public OpenAPI schema
(https://developers.tokportal.com/openapi.json) in the private TokPortal
monorepo. `src/generated.ts` is regenerated on every release — do not edit it by
hand. See [CONTRIBUTING.md](./CONTRIBUTING.md) for what we accept as PRs and
[SECURITY.md](./SECURITY.md) for vulnerability reporting.

## Links

- Documentation: https://developers.tokportal.com
- MCP guide: https://developers.tokportal.com/mcp
- SDKs & CLI: https://developers.tokportal.com/sdks-cli
- API reference (OpenAPI): https://developers.tokportal.com/openapi.json
- Other packages: [`@tokportal/node`](https://www.npmjs.com/package/@tokportal/node) · [`@tokportal/cli`](https://www.npmjs.com/package/@tokportal/cli) · [`tokportal` (PyPI)](https://pypi.org/project/tokportal/) · [`github.com/tokportal/tokportal-go`](https://github.com/tokportal/tokportal-go)

MIT © TokPortal
