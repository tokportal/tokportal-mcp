# tokportal-mcp

[![npm](https://img.shields.io/npm/v/tokportal-mcp.svg)](https://www.npmjs.com/package/tokportal-mcp)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

TokPortal is the managed social infrastructure API: real TikTok and Instagram brand accounts created, warmed and operated by human account managers in 16+ countries, exposed as a REST API and an MCP server. Run geo-sharding across markets without connecting every social account through OAuth. YouTube bundle creation is not available through this API.

**Upgrade before using the sandbox:** local `tokportal-mcp` requires **1.15.1 or newer** for `dry_run`. Version 1.15.0 advertised the argument but did not send the sandbox header, so a preview could execute a real operation. Update your local server or use the [remote connector](https://developers.tokportal.com/mcp/remote/).

Docs https://developers.tokportal.com · API base https://app.tokportal.com/api/ext · OpenAPI https://developers.tokportal.com/openapi.json · MCP remote https://app.tokportal.com/api/ext/mcp · Get an API key https://app.tokportal.com/developer/api-keys?utm_source=npm&utm_medium=readme&utm_campaign=tokportal-mcp · llms.txt https://developers.tokportal.com/llms.txt

---

`tokportal-mcp` is the official [Model Context Protocol](https://modelcontextprotocol.io) server for the TokPortal API. Its 99 core tools remain available to Claude, Cursor, VS Code, Windsurf, Codex, Gemini CLI and other MCP clients. When AI is enabled for your workspace, seven additional curated tools cover model discovery, quoted generation, media management and the separate AI USD wallet. Model-specific schemas are fetched on demand, not exposed as hundreds of tools.

Two ways to use it:

| Mode | Transport | When to use |
| --- | --- | --- |
| **Local** (`npx tokportal-mcp`) | stdio | Desktop clients, local agents, file uploads from disk |
| **Remote** (`https://app.tokportal.com/api/ext/mcp`) | Streamable HTTP | Hosted agents, no install; same tool catalogue |

Requires Node.js 20 or newer. The local server runs on it directly. Get an API key at https://app.tokportal.com/developer/api-keys?utm_source=npm&utm_medium=readme&utm_campaign=tokportal-mcp (format `sk_` + 64 hex chars).

## 30-second quickstart

```bash
npm install -g tokportal-mcp@1.19.0
TOKPORTAL_API_KEY=sk_your_key_here tokportal-mcp
```

The server speaks MCP over stdio. Point any MCP client at it and ask, for example:

> "Read the available countries, credit prices and my balance. Preview a TikTok account-only bundle in the USA with dry_run: true. Show me the immediate and recurring costs, and wait for my GO before any live purchase."

The preview calls `tokportal_create_bundle` with `{ "dry_run": true, "body": { "bundle_type": "account_only", "platform": "tiktok", "country": "USA" } }`. It validates the request and returns `credits_would_charge` with `credits_charged: 0`, without creating work. Creation in live mode is charged immediately. Preview IDs are synthetic and must never be reused in live requests. After GO, create the real resources and use their live IDs. See the [sandbox contract](https://developers.tokportal.com/sandbox/).

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

const { tools } = await client.listTools(); // 99 core tools, plus 7 when AI is enabled
const me = await client.callTool({ name: "tokportal_get_current_user", arguments: {} });
console.log(tools.length, me.content[0].text);
```

## AI generation (staged availability)

AI discovery calls authenticated `GET /ai/status`. If unavailable, only the existing catalogue is shown; no provider fallback or automatic payment is attempted. Local AI support requires `1.16.0` or newer and server-side availability. Installing this package does not enable generation, grant spending permissions or activate billing. Version `1.15.1` retains the existing account-management tools without AI discovery. Remote availability is controlled server-side.


Generation requires `body: { quote_id, max_cost_usd }` and `idempotency_key`. Reuse the same key after an uncertain response. Quotes expire within 15 minutes; use the returned expiry. The AI dollar wallet is independent of account-management credits. AI tools do not accept the legacy `dry_run` contract; use the quote operation, which does not start paid provider work. Cancellation is best effort, not a refund guarantee. Creation does not publish: review the returned assets, then use existing TokPortal scheduling tools.

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
- Every tool carries `title`, `readOnlyHint`, `destructiveHint`, `idempotentHint` and `openWorldHint`. Read the annotations on each tool: paid operations and irreversible actions can be destructive even when they do not delete anything.
- Every non-GET tool accepts top-level `dry_run: true`, sent as `X-TokPortal-Dry-Run: true`. It is never placed in the query or request body. Dry runs consume normal rate limits but do not consume an `idempotency_key`; use the same key for a later live request if its operation supports idempotency.
- Multipart upload tools are generated from OpenAPI too. Binary fields are exposed as local path inputs such as `file_path`, with the remaining form fields exposed by their schema names.
- Mutations accept an optional `idempotency_key` (sent as `Idempotency-Key`) except for secret-bearing operations (credential reveal, verification codes, webhook creation, signed upload URLs, report creation) which are never replayed.

The MCP server sends `X-TokPortal-Client: tokportal-mcp/1.19.0` on API requests for observability and support diagnostics.

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

## Connected analytics (1.18.0)

Use `tokportal_get_analytics_account_insights` with `{ "id": "saved-account-uuid" }` to read Instagram account-period reach/views/engagement and eligible TikTok post watch time/completion/traffic data. Requires Creator or above; existing tiers remain enforced. A disconnected or unverified account returns `available: false` with `connected_analytics: null`. This is read-only and never starts a refresh. Missing metrics are omitted, completion is a 0–1 fraction, traffic/audience splits are 0–100 percentages, and watch times are seconds. The same block appears on `tokportal_get_analytics_account`. [Full contract](https://developers.tokportal.com/analytics/#connected-instagram-and-tiktok-insights).

## Inbox actions and Business setup (1.19.0)

Read scoped received comments and Instagram messages with `tokportal_get_account_inbox`. Reply publicly with `tokportal_create_account_comment_reply` (0 credits, requires a signed reply capability, stable request key, current Coverage and account quota). Check delivery with `tokportal_get_account_comment_reply`; never blindly resend an unknown result.

`tokportal_get_account_business_setup` reads progression; `tokportal_request_account_business_setup` orders the manager task for 5 credits once per Instagram account, after explicit music-limit acknowledgment. New-account creation tools accept `wants_instagram_business` (+5 credits per new Instagram account). TikTok DMs are unavailable. Public metadata webhooks notify connection, incoming activity, reply result and Business task changes. See the Connection & Inbox guide for contracts and limits.

Instagram Inbox reads accept eligible Creator and Business professional accounts,
with messaging permissions and no current restriction. Business conversion is
optional and is not universally required for Creator messaging. DM sends and
private replies are not yet exposed by this package.
