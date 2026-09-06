# Installing the TokPortal MCP server (guide for AI agents)

TokPortal creates, warms and operates real TikTok and Instagram brand accounts through human account managers in 16+ countries. Connect your assistant to run geo-sharding across markets, configure posts, read analytics and follow delivery events. YouTube bundle creation is not available through this API, even though a reference price is published.

## Prerequisites
- A TokPortal account. [Sign up](https://app.tokportal.com?utm_source=github&utm_medium=llms-install&utm_campaign=tokportal-mcp) if needed.
- Local stdio needs an API key (`sk_...`) from the [developer dashboard](https://app.tokportal.com/developer/api-keys?utm_source=github&utm_medium=llms-install&utm_campaign=tokportal-mcp). Remote OAuth clients use the TokPortal sign-in instead.
- Node.js 20 or newer for local stdio. No global installation is needed: `npx` downloads and starts the package.
- Sandbox calls require local `tokportal-mcp` version **1.15.1 or newer**, or the remote connector. Local version 1.15.0 advertised `dry_run` but did not transmit the sandbox header, so a preview could execute a real operation. Upgrade and restart older local servers before using write tools for a simulation. If the running local version is unknown, use the remote connector or REST.

## Option A: local stdio server

Add this to the MCP settings file of the client (for Cline: `cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "tokportal": {
      "command": "npx",
      "args": ["-y", "tokportal-mcp@1.15.1"],
      "env": { "TOKPORTAL_API_KEY": "sk_your_key_here" }
    }
  }
}
```

Restart the server after updating an existing configuration. For a global installation, run `npm install --global tokportal-mcp@1.15.1`, then restart the server. Verify that the running local version is 1.15.1 or later before using its write tools.

## Option B: remote server (OAuth, no key pasting)

URL: `https://app.tokportal.com/api/ext/mcp` (Streamable HTTP). Add this URL in a client that supports remote MCP with OAuth and complete the TokPortal sign-in. Choose Full access to preview write tools, or Read-only access for reads. Clients without OAuth can send `Authorization: Bearer sk_your_key_here`.

For Claude Code:

```bash
claude mcp add --transport http tokportal https://app.tokportal.com/api/ext/mcp
```

Then use `/mcp` to authenticate. [Remote setup instructions](https://developers.tokportal.com/mcp/remote/).

## Verify

Call `tokportal_get_current_user`, `tokportal_get_credit_balance`, `tokportal_list_platforms` and `tokportal_list_countries`. These tools are read-only. Use the returned platform and country codes when assembling a request.

## Preview a workflow before spending credits

On local version 1.15.1 or later or the remote MCP connector, pass `dry_run: true` at the top level of a write tool's arguments, with JSON request fields inside `body`. For example, after confirming that `USA` is available, call `tokportal_create_bundle` with:

```json
{
  "dry_run": true,
  "body": {
    "bundle_type": "account_only",
    "platform": "tiktok",
    "country": "USA"
  }
}
```

The preview runs validation and pricing without creating work, debiting credits, notifying an operator or firing webhooks. A successful preview includes `dry_run: true`, `credits_charged: 0` and `credits_would_charge`. Authentication and normal rate limits still apply.

Before a live purchase, read `tokportal_get_credit_costs` and the credit balance. Show the user the accounts, countries, requested work, immediate credit cost and any recurring TokPortal Coverage cost. Wait for the user's explicit GO before spending credits. Creation is charged immediately.

After GO, create the real resources and use the IDs returned by those live calls. Preview IDs start with `00000000-0000-4000-8000-`; they may only be chained into other dry-run calls and must never be reused in live requests. A live request containing one is rejected with `DRY_RUN_ID_IN_LIVE_REQUEST`. A preview does not reserve resources or persist the full workflow state.

Use `idempotency_key` for supported live mutations and reuse the same key and request on a retry. Dry runs do not consume the key. `external_ref` is a correlation reference, not a substitute for idempotency.

[Sandbox contract and REST examples](https://developers.tokportal.com/sandbox/).

## Notes for agents
- Tools carry `title`, `readOnlyHint`, `destructiveHint`, `idempotentHint` and `openWorldHint`. Read each tool's annotations: paid operations and irreversible actions can be destructive even when they do not delete anything.
- Tools that return secrets (`tokportal_reveal_account_credentials`, `tokportal_retrieve_account_verification_code`) follow a two-step 428 confirmation policy: show the policy preview to the human and only continue after explicit confirmation.
- [MCP documentation](https://developers.tokportal.com/mcp/) and [llms.txt](https://developers.tokportal.com/llms.txt) provide the current tools and API contract.
