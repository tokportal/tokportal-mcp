#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  TOKPORTAL_BASE_URL,
  TOOLS,
  discoverAiAvailability,
  isToolFeatureEnabled,
  type McpToolDefinition,
} from "./generated.js";

const TOKPORTAL_MCP_VERSION = "1.18.0";
const TOKPORTAL_CLIENT_HEADER = `tokportal-mcp/${TOKPORTAL_MCP_VERSION}`;

const apiKey = process.env.TOKPORTAL_API_KEY;
const baseUrl = (process.env.TOKPORTAL_BASE_URL || TOKPORTAL_BASE_URL).replace(
  /\/+$/,
  "",
);

function headerInt(headers: Headers, name: string): number | undefined {
  const value = headers.get(name);
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function apiDiagnostics(response: Response) {
  const rateLimit = {
    limit: headerInt(response.headers, "x-ratelimit-limit"),
    remaining: headerInt(response.headers, "x-ratelimit-remaining"),
    reset: headerInt(response.headers, "x-ratelimit-reset"),
  };
  const hasRateLimit = Object.values(rateLimit).some(
    (value) => value !== undefined,
  );

  return {
    request_id:
      response.headers.get("x-tokportal-request-id") ||
      response.headers.get("x-request-id") ||
      response.headers.get("request-id") ||
      response.headers.get("x-vercel-id") ||
      undefined,
    retry_after_seconds: headerInt(response.headers, "retry-after"),
    ...(hasRateLimit ? { rate_limit: rateLimit } : {}),
  };
}

function parsePayload(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw_body: text };
  }
}

function textContent(text: string) {
  return {
    content: [{ type: "text" as const, text }],
  };
}

async function toolList() {
  const aiEnabled = await discoverAiAvailability(baseUrl, apiKey || "");
  return {
    tools: TOOLS.filter((tool) => isToolFeatureEnabled(tool, aiEnabled)).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: tool.annotations,
    })),
  };
}

function fillPath(path: string, args: Record<string, unknown>) {
  return path.replace(/\{([^}]+)\}/g, (_match, name) => {
    const value = args[name];
    // Path params may be strings (uuids) or numbers (e.g. video/account slot
    // `position`). Reject only missing/empty values; coerce everything else.
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.length === 0)
    ) {
      throw new Error(`Missing required path parameter: ${name}`);
    }
    return encodeURIComponent(String(value));
  });
}

function multipartInputName(fieldName: string) {
  return fieldName === "file" ? "file_path" : `${fieldName}_path`;
}

function buildMultipartBody(
  tool: McpToolDefinition,
  args: Record<string, unknown>,
) {
  const form = new FormData();

  for (const field of tool.multipartFields) {
    if (field.binary) {
      const inputName = multipartInputName(field.name);
      const filePath = args[inputName];
      if (typeof filePath !== "string" || filePath.length === 0) {
        if (field.required)
          throw new Error(`Missing required multipart file path: ${inputName}`);
        continue;
      }
      const bytes = new Uint8Array(fs.readFileSync(filePath));
      form.append(field.name, new Blob([bytes]), path.basename(filePath));
      continue;
    }

    const value = args[field.name];
    if (value === undefined || value === null) {
      if (field.required)
        throw new Error(`Missing required multipart field: ${field.name}`);
      continue;
    }
    form.append(field.name, String(value));
  }

  return form;
}

function jsonBodyArgumentNames(tool: McpToolDefinition): Set<string> {
  if (tool.requestContentType !== "application/json") return new Set();
  const inputProperties = (
    tool.inputSchema as {
      properties?: Record<string, { properties?: Record<string, unknown> }>;
    }
  ).properties;
  return new Set(Object.keys(inputProperties?.body?.properties || {}));
}

/**
 * Top-level argument names the generated inputSchema declares: the path params,
 * the query params, `body`, `idempotency_key`, and `dry_run`.
 */
function declaredArgumentNames(tool: McpToolDefinition): Set<string> {
  const properties = (tool.inputSchema as { properties?: Record<string, unknown> })
    .properties;
  return new Set(Object.keys(properties || {}));
}

/** Keep dry-run coercion identical to the remote MCP server. */
function parseDryRunArg(value: unknown): boolean {
  if (value === undefined || value === null || value === false) return false;
  if (value === true) return true;
  if (value === 1) return true;
  if (value === 0) return false;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no", ""].includes(normalized)) return false;
  }
  throw new Error(
    `dry_run must be a boolean, got ${JSON.stringify(value)}. Pass dry_run: true ` +
      "to simulate the call or omit it to execute for real. The call was NOT executed: " +
      "an ambiguous value must never silently turn a simulation into a real, credit-debiting call.",
  );
}

function splitArgs(tool: McpToolDefinition, args: Record<string, unknown>) {
  const pathParamNames = [...tool.path.matchAll(/\{([^}]+)\}/g)].map(
    (match) => match[1],
  );
  const multipartArgNames = new Set(
    tool.multipartFields.flatMap((field) =>
      field.binary ? [multipartInputName(field.name)] : [field.name],
    ),
  );
  const bodyArgNames = jsonBodyArgumentNames(tool);
  const flatBody = Object.fromEntries(
    [...bodyArgNames]
      .filter((name) => args[name] !== undefined)
      .map((name) => [name, args[name]]),
  );
  // Prefer the canonical nested `body`, but accept body fields at the top
  // level too. Some MCP clients flatten object arguments before tools/call.
  const body =
    args.body !== undefined
      ? args.body
      : Object.keys(flatBody).length > 0
        ? flatBody
        : undefined;
  const query: Record<string, string> = {};

  // Kept identical to app/api/_lib/mcp-server.ts::splitArgs. This loop used to
  // turn EVERY leftover argument into a query-string parameter, so an
  // unrecognised or misspelled top-level argument was appended to the URL of a
  // POST/PUT, ignored by the handler, and answered 200. Enforce the
  // `additionalProperties: false` the tool already publishes.
  const declared = declaredArgumentNames(tool);
  const unknownArgs: string[] = [];

  for (const [key, value] of Object.entries(args)) {
    if (
      key === "body" ||
      key === "idempotency_key" ||
      // Control arguments are transported as headers, never query parameters.
      key === "dry_run" ||
      pathParamNames.includes(key) ||
      multipartArgNames.has(key) ||
      bodyArgNames.has(key)
    )
      continue;
    if (!declared.has(key)) {
      unknownArgs.push(key);
      continue;
    }
    if (value !== undefined && value !== null) query[key] = String(value);
  }

  if (unknownArgs.length > 0) {
    const accepted = [...declared].sort().join(", ") || "(none)";
    throw new Error(
      `Tool "${tool.name}" does not accept the argument(s): ` +
        `${unknownArgs.join(", ")}. Accepted top-level arguments: ${accepted}. ` +
        (bodyArgNames.size > 0
          ? "Request fields belong inside the `body` object — check the spelling against the tool's inputSchema and re-send. "
          : "") +
        "TokPortal refuses unknown arguments rather than dropping them, because a dropped field on a full-replace write erases the value it was meant to set.",
    );
  }

  return {
    pathParams: Object.fromEntries(
      pathParamNames.map((name) => [name, args[name]]),
    ),
    body,
    query,
    idempotencyKey:
      typeof args.idempotency_key === "string"
        ? args.idempotency_key
        : undefined,
    dryRun: parseDryRunArg(args.dry_run),
  };
}

async function callTool(name: string, args: Record<string, unknown>) {
  if (!apiKey) {
    throw new Error("TOKPORTAL_API_KEY is required.");
  }

  const tool = TOOLS.find((candidate) => candidate.name === name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  if (tool.requiredFeature === "ai" && !await discoverAiAvailability(baseUrl, apiKey, true)) {
    return { ...textContent("AI is not available for this workspace. No generation or payment was attempted. Existing TokPortal account tools remain available."), isError: true };
  }

  const split = splitArgs(tool, args);
  const url = new URL(`${baseUrl}${fillPath(tool.path, split.pathParams)}`);
  for (const [key, value] of Object.entries(split.query))
    url.searchParams.set(key, value);
  const requestBody =
    tool.requestContentType === "multipart/form-data"
      ? buildMultipartBody(tool, args)
      : split.body === undefined
        ? undefined
        : JSON.stringify(split.body);

  const response = await fetch(url, {
    method: tool.method,
    headers: {
      Accept: "application/json",
      "X-API-Key": apiKey,
      "X-TokPortal-Client": TOKPORTAL_CLIENT_HEADER,
      ...(tool.requestContentType === "application/json" &&
      split.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...(split.idempotencyKey
        ? { "Idempotency-Key": split.idempotencyKey }
        : {}),
      ...(split.dryRun ? { "X-TokPortal-Dry-Run": "true" } : {}),
    },
    body: requestBody,
  });

  const text = await response.text();
  const payload = parsePayload(text);

  if (!response.ok) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            { payload, diagnostics: apiDiagnostics(response) },
            null,
            2,
          ),
        },
      ],
      isError: true,
    };
  }

  return textContent(JSON.stringify(payload, null, 2));
}

const server = new Server(
  {
    name: "tokportal",
    version: TOKPORTAL_MCP_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => toolList());

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    throw new Error("tools/call params.arguments must be an object.");
  }

  return callTool(name, args as Record<string, unknown>);
});

const transport = new StdioServerTransport();
await server.connect(transport);
