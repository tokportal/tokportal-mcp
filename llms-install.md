# Installing the TokPortal MCP server (guide for AI agents)

TokPortal is the managed social infrastructure API: real TikTok, Instagram and YouTube accounts created, warmed and operated by human account managers in 16+ countries — exposed as a REST API and an MCP server.

## Prerequisites
- A TokPortal API key (`sk_...`): the user creates one at https://app.tokportal.com/developer/api-keys (sign-up at https://app.tokportal.com if needed).
- Node.js 18+ (for the local stdio server). No install step is needed: `npx -y tokportal-mcp` downloads and runs the latest version.

## Option A — local stdio server (recommended for Cline / Cursor / Claude Code / Windsurf)
Add this to the MCP settings file of the client (for Cline: `cline_mcp_settings.json`):

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

## Option B — remote server (OAuth 2.1, no key pasting)
URL: `https://app.tokportal.com/api/ext/mcp` (streamable HTTP). Clients that support OAuth (Claude.ai, Claude Code `claude mcp add --transport http tokportal https://app.tokportal.com/api/ext/mcp`, VS Code, Cursor) will open a login page. Clients without OAuth can send `Authorization: Bearer sk_your_key_here`.

## Verify
Call the tool `tokportal_get_current_user` (read-only) — it returns the account and credit balance. Then `tokportal_list_platforms` / `tokportal_list_countries`.

## Notes for agents
- Tools are annotated: `readOnlyHint` (GET), `destructiveHint` (unpublish/cancel/delete/reset), `idempotentHint`.
- Tools that return secrets (`tokportal_reveal_account_credentials`, `tokportal_retrieve_account_verification_code`) follow a two-step 428 confirmation policy: show the policy preview to the human and only continue after explicit confirmation.
- Full docs: https://developers.tokportal.com/mcp · llms.txt: https://developers.tokportal.com/llms.txt
