// Generated from app/api/_schema/public-openapi.ts.
// Do not edit by hand. Run `node scripts/generate-mcp-tools.mjs`.

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type McpToolDefinition = {
  name: string;
  operationId: string;
  description: string;
  method: HttpMethod;
  path: string;
  requestContentType: 'application/json' | 'multipart/form-data' | null;
  multipartFields: Array<{
    name: string;
    required: boolean;
    binary: boolean;
    schema: Record<string, unknown>;
  }>;
  inputSchema: Record<string, unknown>;
  annotations: McpToolAnnotations;
  requiredFeature?: "ai";
};

// MCP tool annotations (spec 2025-03-26+). Hints only — clients must not rely
// on them for security decisions.
export type McpToolAnnotations = {
  title: string;
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint: boolean;
  openWorldHint: boolean;
};

export const TOKPORTAL_BASE_URL = "https://app.tokportal.com/api/ext";

// A staged feature must not change the legacy catalogue until enabled.
// This is discovery gating only; REST authorization is always authoritative.
export function isToolFeatureEnabled(tool: McpToolDefinition, aiEnabled: boolean): boolean {
  return tool.requiredFeature !== "ai" || aiEnabled;
}

const aiAvailabilityCache = new Map<string, { enabled: boolean; expiresAt: number }>();

/** Authenticated, free first-party discovery. Failure must preserve legacy tools. */
export async function discoverAiAvailability(baseUrl: string, apiKey: string, fresh = false): Promise<boolean> {
  if (!apiKey) return false;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(baseUrl + "\n" + apiKey));
  const cacheKey = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const cached = aiAvailabilityCache.get(cacheKey);
  if (!fresh && cached && cached.expiresAt > Date.now()) return cached.enabled;
  let enabled = false;
  // Retry only this free, read-only discovery request. A cold start or a brief
  // network failure must not hide an invited user's tools for the cache TTL.
  // Never retry the generation/payment request from this helper.
  let confirmed = false;
  for (let attempt = 0; attempt < 2; attempt++) try {
    const response = await fetch(baseUrl.replace(/\/+$/, "") + "/ai/status", {
      method: "GET",
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
      redirect: "error",
    });
    if (response.status >= 500) { await response.body?.cancel(); continue; }
    if (response.ok) {
      const payload = await response.json() as { data?: { enabled?: unknown; availability?: { status?: unknown } } };
      enabled = payload?.data?.enabled === true && payload.data.availability?.status === "available";
    } else if (response.status !== 401 && response.status !== 403) {
      await response.body?.cancel();
      return false;
    }
    confirmed = true;
    break;
  } catch {
    // No provider fallback, leaked token, or log of credential-bearing context.
  }
  if (!confirmed) return false;
  if (aiAvailabilityCache.size >= 256) aiAvailabilityCache.delete(aiAvailabilityCache.keys().next().value!);
  aiAvailabilityCache.set(cacheKey, { enabled, expiresAt: Date.now() + 15_000 });
  return enabled;
}

// prettier-ignore
export const TOOLS: McpToolDefinition[] = [
  {
    "name": "tokportal_get_current_user",
    "operationId": "getCurrentUser",
    "description": "Get authenticated user. Returns the authenticated workspace: profile, role, analytics access tier and live credit balance. Call once at the start of a session to learn what this key can do.",
    "method": "GET",
    "path": "/me",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {},
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get authenticated user",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_update_current_user_settings",
    "operationId": "updateCurrentUserSettings",
    "description": "Update safe workspace settings. Updates client-owned workspace profile fields used by Operator context. Does not expose auth, role, credit, staff, or manager settings.",
    "method": "PATCH",
    "path": "/me",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "properties": {
            "company_name": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 120
            },
            "website": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 300
            },
            "company_niche": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 300
            },
            "organic_strategy": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 500
            }
          },
          "minProperties": 1,
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Update safe workspace settings",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_account_managed_subscription",
    "operationId": "getAccountManagedSubscription",
    "description": "Get TokPortal Coverage status. Returns the effective TokPortal Coverage status, current 30-day period, account-specific rate, unpaid periods, task access, and an exact timestamped reactivation quote for one eligible saved account. At current_period_end, status and task_access change immediately even if recorded_status remains included or active for a few minutes until the renewal worker persists the transition; period_expired makes that boundary explicit. A zero-credit quote is valid. Use its current_period_end and lock_version snapshot for reactivation. An eligible TikTok or Instagram account created before the global Coverage cutoff is grandfathered and has no subscription record. A missing record can also mean the account is not Coverage-eligible or has not reached delivery, so clients must not infer grandfathering from a generic 404. Coverage is independent from bundle completion or closure.",
    "method": "GET",
    "path": "/accounts/{id}/managed-subscription",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get TokPortal Coverage status",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_reactivate_account_managed_subscription",
    "operationId": "reactivateAccountManagedSubscription",
    "description": "Reactivate TokPortal Coverage. Reactivates TokPortal Coverage from an explicit GET snapshot, and debits the projected unpaid 30-day periods — read the quote from getAccountManagedSubscription and confirm the amount with the user first. Reactivation is free while the current billing period is already paid or included. After cancellation, access continues through the current paid period if no overdue Coverage is unpaid. After it expires, account features stay unavailable until Coverage is restored. At and after current_period_end, the endpoint accepts the effective lapsed state even if recorded_status has not yet been updated by the renewal worker, and charges exactly the projected unpaid periods without adding an extra period. The expected credits, period end, and lock version are checked atomically before any debit or task resume. Scheduled videos receive new future dates while preserving their cadence.",
    "method": "POST",
    "path": "/accounts/{id}/managed-subscription/reactivate",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "body": {
          "type": "object",
          "required": [
            "expected_credits",
            "expected_current_period_end",
            "expected_lock_version"
          ],
          "properties": {
            "expected_credits": {
              "type": "integer",
              "minimum": 0,
              "maximum": 2147483647,
              "description": "The exact reactivation_credits value from the latest Coverage snapshot. Zero is valid."
            },
            "expected_current_period_end": {
              "type": "string",
              "format": "date-time",
              "description": "The current_period_end value from the same snapshot."
            },
            "expected_lock_version": {
              "type": "integer",
              "minimum": 0,
              "maximum": 2147483647,
              "description": "The lock_version value from the same snapshot."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Reactivate TokPortal Coverage",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_cancel_account_managed_subscription",
    "operationId": "cancelAccountManagedSubscription",
    "description": "Pause TokPortal Coverage. Stops renewal without refunding payments. Account actions and analytics remain available through the paid/included period if no overdue Coverage is unpaid. Afterwards they are blocked until Coverage is restored; after 30 days of unavailability the API connection is removed. Resuming renewal during the current paid period is free. Otherwise reactivation costs exactly the unpaid 30-day periods shown by the Coverage status endpoint.",
    "method": "POST",
    "path": "/accounts/{id}/managed-subscription/cancel",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Pause TokPortal Coverage",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_countries",
    "operationId": "listCountries",
    "description": "List available countries. Lists the valid `country` values for bundle creation. Most are ISO-3166-1 alpha-2 (FR, DE, BR), but TokPortal's own codes are the authority and two of them are not alpha-2: the United States is `USA` and the United Kingdom is `UK`. Their ISO aliases `US` and `GB` are accepted and resolved to those two, so send a code from this list verbatim and never assume alpha-2. Call before createBundle or createBundlesBulk: `country` is validated against this list, and a full country name such as \"United States\" is rejected. `videos_only_countries` applies only to video orders on an existing account and is never valid for /bundles/bulk.",
    "method": "GET",
    "path": "/countries",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {},
      "additionalProperties": false
    },
    "annotations": {
      "title": "List available countries",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_platforms",
    "operationId": "listPlatforms",
    "description": "List available platforms. Lists the orderable platforms and, per video type, the exact required and optional fields. Call before configuring any slot: TikTok carousels require `tiktok_sound_url`, Instagram posts and reels require `instagram_content_type`, and a story takes exactly one of `video_url` or `story_image_url` and no description. Only TikTok and Instagram can be ordered; YouTube fields exist on the video schema but YouTube bundles are rejected with YOUTUBE_DELAYED.",
    "method": "GET",
    "path": "/platforms",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {},
      "additionalProperties": false
    },
    "annotations": {
      "title": "List available platforms",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_credit_costs",
    "operationId": "getCreditCosts",
    "description": "Get credit pricing. Authoritative live credit prices and workspace cohort. Call it immediately before any purchase and never hard-code or recall a price. Not every key is orderable: `youtube_account_creation` is listed for reference only (YouTube bundles are rejected with YOUTUBE_DELAYED), and `niche_warming` and `deep_warming` are legacy prices published for backward compatibility only — they are not products a caller may choose, and `advanced_warming` (Advanced Niche Warming, priced per niche target) is the only warming TokPortal sells. `managed_account_subscription` (TokPortal Coverage) recurs every 30 days per account after the included first period, so a multi-account quote must include it as a monthly cost. There is no dry-run endpoint: assemble the total from this table (account setup + video slots + Advanced Niche Warming targets + edit slots + paid video options), apply the returned cohort and contract_bundle_allowance, and confirm it with the user before creating anything.",
    "method": "GET",
    "path": "/credit-costs",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {},
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get credit pricing",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_credit_balance",
    "operationId": "getCreditBalance",
    "description": "Get credit balance. Returns the currently spendable credit balance and upcoming expirations. Check it before any purchase: a 402 on a mutation means this was short.",
    "method": "GET",
    "path": "/credits/balance",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {},
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get credit balance",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_credit_transactions",
    "operationId": "listCreditTransactions",
    "description": "List credit transactions. Paginated ledger of every credit debit and refund, newest first. Use it to reconcile what a bundle or batch actually cost, since server-side pricing (workspace cohort, contract allowance) can differ from the list price.",
    "method": "GET",
    "path": "/credits/history",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "page": {
          "type": "integer",
          "minimum": 1,
          "default": 1,
          "description": "Page number."
        },
        "per_page": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 25,
          "description": "Items per page."
        },
        "date_from": {
          "type": "string",
          "format": "date",
          "description": "Filter transactions created on or after this date."
        },
        "date_to": {
          "type": "string",
          "format": "date",
          "description": "Filter transactions created before the day after this date."
        }
      },
      "additionalProperties": false
    },
    "annotations": {
      "title": "List credit transactions",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_bundles",
    "operationId": "listBundles",
    "description": "List bundles. Lists your bundles with their lifecycle status and the computed `next_action` (`configure_account`, `configure_videos`, `publish_bundle`, or null). `next_action` is the recommended way to find what a bundle still needs. Video counters cover all slots and are independent of page/per_page: `videos_quantity` is the recorded slot quantity, `videos_total` counts existing slots, and `videos_configured_count` includes configured, published, accepted, in_review, pending_corrections and finalized slots. Unused slots have status `pending`; with the current status set their count is `videos_total - videos_configured_count`. Configured or finalized slots are not unused capacity. A failed video read returns an error, never zero counters.",
    "method": "GET",
    "path": "/bundles",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "page": {
          "type": "integer",
          "minimum": 1,
          "default": 1,
          "description": "Page number."
        },
        "per_page": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 25,
          "description": "Items per page."
        },
        "status": {
          "type": "string",
          "description": "Filter by bundle status."
        },
        "bundle_type": {
          "type": "string",
          "enum": [
            "account_only",
            "account_and_videos",
            "videos_only"
          ],
          "description": "query parameter bundle_type"
        },
        "platform": {
          "type": "string",
          "enum": [
            "tiktok",
            "instagram"
          ],
          "description": "query parameter platform"
        },
        "external_ref": {
          "type": "string",
          "description": "query parameter external_ref"
        },
        "account_status": {
          "type": "string",
          "description": "query parameter account_status"
        }
      },
      "additionalProperties": false
    },
    "annotations": {
      "title": "List bundles",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_create_bundle",
    "operationId": "createBundle",
    "description": "Create a bundle. Creates and pays an account-only, account-and-videos, or videos-only bundle in one atomic creation checkout. Credits are debited immediately on a successful POST, not when the bundle is published, and THERE IS NO CANCELLATION OR REFUND PATH — read getCreditCosts and getCreditBalance and confirm the total with the user before calling. One bundle produces exactly one account; order several accounts with createBundlesBulk. TikTok and Instagram only: a YouTube bundle is rejected with YOUTUBE_DELAYED even though getCreditCosts lists a YouTube price. Advanced Niche Warming requires wants_advanced_warming: true ALONGSIDE advanced_warming_terms or advanced_warming_terms_count; targets sent without the flag are refused with ADVANCED_WARMING_FLAG_REQUIRED, never charged and dropped. Send the term list or the count, not two quantities that disagree (ADVANCED_WARMING_COUNT_MISMATCH), and send distinct terms — anything removed by cleanup fails the call with ADVANCED_WARMING_TERMS_REJECTED rather than silently reducing what you receive and pay for. Credit cost is calculated server-side from the workspace cohort and any contract_bundle_allowance returned by getCreditCosts. A qualifying allowance slot is consumed in the same transaction as the credit debit; failed requests consume nothing. The exact new-customer and saved-account cutoff is the immutable production PRE-migration instant returned by getCreditCosts. A real TikTok or Instagram saved account created on or after that cutoff receives its first 30 days of TokPortal Coverage included unless the creation response marks it contractually exempt, and Coverage then recurs every 30 days per account at the managed_account_subscription price. For Advanced Niche Warming, pass advanced_warming_terms now, or buy a target count with advanced_warming_terms_count at the effective workspace rate and configure the targets later via PUT /bundles/{id}/warming-terms — one or the other, always with wants_advanced_warming: true. Set the targets BEFORE publishing: publishBundle refuses a bundle whose warming has no targets (ADVANCED_WARMING_NOT_CONFIGURED), and a purchase left unconfigured is not refunded. The bundle is created in pending_setup and still needs configureBundleAccount and publishBundle. Delivered videos are approved automatically unless you send auto_finalize_videos: false — the response echoes the settlement mode as review_mode ('auto' or 'manual'), plus a one-off review_mode_notice when you left the choice to the default. external_ref is a client correlation and duplicate-detection aid, not a retry mechanism; only Idempotency-Key provides exact request replay.",
    "method": "POST",
    "path": "/bundles",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "required": [
            "bundle_type"
          ],
          "properties": {
            "wants_instagram_business": {
              "type": "boolean",
              "default": false,
              "description": "New Instagram accounts only. Adds 5 credits, requests a manager Business setup after creation, and acknowledges restricted commercial music access."
            },
            "bundle_type": {
              "type": "string",
              "enum": [
                "account_only",
                "account_and_videos",
                "videos_only"
              ]
            },
            "platform": {
              "type": "string",
              "enum": [
                "tiktok",
                "instagram"
              ],
              "default": "tiktok",
              "description": "TikTok or Instagram only. YouTube is priced in getCreditCosts but cannot be ordered: a YouTube bundle is rejected with YOUTUBE_DELAYED."
            },
            "country": {
              "type": "string",
              "minLength": 2,
              "maxLength": 5,
              "description": "Country code exactly as returned by listCountries. Most are ISO-3166-1 alpha-2 (FR, DE, BR), but two are not: the United States is \"USA\" and the United Kingdom is \"UK\". The aliases \"US\" and \"GB\" are accepted and resolved to those. A full country name such as \"United States\" is rejected. Required unless bundle_type is videos_only."
            },
            "title": {
              "type": "string",
              "maxLength": 200
            },
            "videos_quantity": {
              "type": "integer",
              "minimum": 0,
              "maximum": 500,
              "default": 0
            },
            "edits_quantity": {
              "type": "integer",
              "minimum": 0,
              "maximum": 500,
              "default": 0
            },
            "wants_niche_warming": {
              "type": "boolean",
              "default": false,
              "deprecated": true,
              "description": "Legacy — kept only for accounts being re-created after a refund; use Advanced Niche Warming (wants_advanced_warming)."
            },
            "wants_deep_warming": {
              "type": "boolean",
              "default": false,
              "deprecated": true,
              "description": "Legacy — kept only for accounts being re-created after a refund; use Advanced Niche Warming (wants_advanced_warming)."
            },
            "wants_advanced_warming": {
              "type": "boolean",
              "default": false,
              "description": "Advanced Niche Warming, the warming product: niche-target (search-term) based warming with recorded proof and a data report. MANDATORY whenever you send advanced_warming_terms or advanced_warming_terms_count — TokPortal never infers it, and sending targets without it is rejected with ADVANCED_WARMING_FLAG_REQUIRED rather than charged and dropped. The standard rate is 5 credits per target (per target, never per day); GET /credit-costs returns the effective rate. TikTok and Instagram only. Provide advanced_warming_terms now, or advanced_warming_terms_count to configure the targets later."
            },
            "advanced_warming_terms": {
              "type": "array",
              "minItems": 3,
              "maxItems": 30,
              "x-item-count-multiple-of": 3,
              "items": {
                "type": "string",
                "minLength": 2,
                "maxLength": 50
              },
              "description": "3-30 niche targets (search terms), count a multiple of 3, each 2-50 characters. REQUIRES wants_advanced_warming: true in the same body (ADVANCED_WARMING_FLAG_REQUIRED otherwise). Every term must survive cleanup intact: entries are trimmed and compared case-insensitively, and if any is dropped as a duplicate or for its length the call fails with ADVANCED_WARMING_TERMS_REJECTED listing what was dropped — TokPortal will not quietly deliver, or bill, fewer targets than you asked for. Send this list OR advanced_warming_terms_count, not both: a count that disagrees with the list length fails with ADVANCED_WARMING_COUNT_MISMATCH."
            },
            "advanced_warming_terms_count": {
              "type": "integer",
              "minimum": 3,
              "maximum": 30,
              "multipleOf": 3,
              "x-value-multiple-of": 3,
              "description": "Number of niche targets to purchase (3-30, multiples of 3; standard rate 5 credits each; GET /credit-costs returns the effective rate); the alternative to advanced_warming_terms when the targets are not decided yet. REQUIRES wants_advanced_warming: true in the same body (ADVANCED_WARMING_FLAG_REQUIRED otherwise). Do not send it alongside advanced_warming_terms unless it equals that list's length — a disagreement fails with ADVANCED_WARMING_COUNT_MISMATCH instead of one quantity silently winning. Configure the targets later via PUT /bundles/{id}/warming-terms — but BEFORE publishing: publishBundle refuses a bundle whose warming has no targets (ADVANCED_WARMING_NOT_CONFIGURED), because a warming that can never start also stops the bundle from ever completing. A purchase left unconfigured is not refunded."
            },
            "niche_warming_instructions": {
              "type": "string",
              "maxLength": 2000,
              "deprecated": true,
              "description": "Legacy — kept only for accounts being re-created after a refund; use Advanced Niche Warming (wants_advanced_warming)."
            },
            "auto_finalize_videos": {
              "type": "boolean",
              "default": true,
              "description": "Defaults to true: delivered videos are approved automatically and count as final. Set false to hold each delivered video for your manual review (approve or request corrections). Changeable later via updateBundle."
            },
            "account_id": {
              "type": "string",
              "format": "uuid",
              "description": "The single delivered account a videos_only bundle posts to. Required for videos_only bundles, forbidden otherwise. One bundle targets exactly one account — to post across several accounts, create one bundle per account."
            },
            "external_ref": {
              "type": "string",
              "maxLength": 200,
              "description": "Optional client correlation reference and duplicate-detection aid for new-account bundles. Reusing it can return DUPLICATE_ACCOUNT_BUNDLE. It does not provide request retry or response replay; use Idempotency-Key for that."
            }
          },
          "dependentRequired": {
            "advanced_warming_terms": [
              "wants_advanced_warming"
            ],
            "advanced_warming_terms_count": [
              "wants_advanced_warming"
            ]
          },
          "not": {
            "required": [
              "wants_niche_warming",
              "wants_advanced_warming"
            ],
            "properties": {
              "wants_niche_warming": {
                "const": true
              },
              "wants_advanced_warming": {
                "const": true
              }
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Create a bundle",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_create_bundles_bulk",
    "operationId": "createBundlesBulk",
    "description": "Create bundles in bulk. Creates and pays several bundles in one atomic creation checkout. Credits are debited immediately on a successful POST, not at publication, and THERE IS NO CANCELLATION OR REFUND PATH — read getCreditCosts and getCreditBalance and confirm the total with the user before calling, because the loss is multiplied by accounts_count and platforms. Each bundle produces exactly one account. Warming targets and credits are charged per account, not per batch. Advanced Niche Warming requires wants_advanced_warming: true ALONGSIDE advanced_warming_terms or advanced_warming_terms_count; targets sent without the flag are refused with ADVANCED_WARMING_FLAG_REQUIRED for the whole batch, never charged and dropped. Send the term list or the count, not two quantities that disagree (ADVANCED_WARMING_COUNT_MISMATCH), and send distinct terms — anything removed by cleanup fails the call with ADVANCED_WARMING_TERMS_REJECTED. The complete batch is checked against rolling workspace capacity and any contract_bundle_allowance returned by getCreditCosts. Qualifying allowance slots are consumed in deterministic bundle-ID order in the same transaction as all debits; if any bundle fails, the entire batch rolls back and consumes nothing, so never split a 429 capacity-cooldown batch into parallel calls. A batch crossing the final allowance slot receives the contract price only for the remaining qualifying bundles. For Advanced Niche Warming, pass advanced_warming_terms, using the same terms for every account, or buy a per-account target count with advanced_warming_terms_count and configure each bundle's targets later via PUT /bundles/{id}/warming-terms — one or the other, always with wants_advanced_warming: true. Every bundle is returned in pending_setup with no username: each one still needs configureBundleAccount and publishBundle before any work starts. Delivered videos are approved automatically for every bundle in the batch unless you send auto_finalize_videos: false — the response echoes review_mode ('auto' or 'manual'), plus a one-off review_mode_notice when you left the choice to the default. external_ref is one optional batch-level reference copied to the resulting bundles, not a unique per-bundle key or a retry mechanism; use returned bundle IDs for identity and Idempotency-Key for exact replay.",
    "method": "POST",
    "path": "/bundles/bulk",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "required": [
            "platforms",
            "country",
            "accounts_count"
          ],
          "properties": {
            "wants_instagram_business": {
              "type": "boolean",
              "default": false,
              "description": "Apply Business setup to every new Instagram account only, adding 5 credits each. Requires Instagram in platforms and acknowledges restricted commercial music access."
            },
            "platforms": {
              "type": "array",
              "minItems": 1,
              "maxItems": 3,
              "uniqueItems": true,
              "items": {
                "type": "string",
                "enum": [
                  "tiktok",
                  "instagram"
                ]
              },
              "description": "TikTok and/or Instagram. accounts_count accounts are created on EACH listed platform, so the batch total is accounts_count x platforms.length. YouTube cannot be ordered (YOUTUBE_DELAYED)."
            },
            "country": {
              "type": "string",
              "minLength": 2,
              "maxLength": 5,
              "description": "Country code exactly as returned by listCountries. Most are ISO-3166-1 alpha-2 (FR, DE, BR), but two are not: the United States is \"USA\" and the United Kingdom is \"UK\". The aliases \"US\" and \"GB\" are accepted and resolved to those. A full country name such as \"United States\" is rejected. videos_only_countries is never valid here."
            },
            "accounts_count": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100,
              "description": "Accounts to create per platform. Each one is a separate bundle with its own account, and every credit below is charged per account."
            },
            "upload_accounts_count": {
              "type": "integer",
              "minimum": 0,
              "maximum": 100,
              "default": 0
            },
            "videos_per_account": {
              "type": "integer",
              "minimum": 0,
              "maximum": 500,
              "default": 0
            },
            "wants_niche_warming": {
              "type": "boolean",
              "default": false,
              "deprecated": true,
              "description": "Legacy — kept only for accounts being re-created after a refund; use Advanced Niche Warming (wants_advanced_warming)."
            },
            "wants_deep_warming": {
              "type": "boolean",
              "default": false,
              "deprecated": true,
              "description": "Legacy — kept only for accounts being re-created after a refund; use Advanced Niche Warming (wants_advanced_warming)."
            },
            "wants_advanced_warming": {
              "type": "boolean",
              "default": false,
              "description": "Advanced Niche Warming, the warming product: niche-target (search-term) based warming with recorded proof and a data report. MANDATORY whenever you send advanced_warming_terms or advanced_warming_terms_count — TokPortal never infers it, and sending targets without it is rejected with ADVANCED_WARMING_FLAG_REQUIRED rather than charged and dropped. The standard rate is 5 credits per target (per target, never per day), charged per account; GET /credit-costs returns the effective rate. TikTok and Instagram only. Provide advanced_warming_terms now, or advanced_warming_terms_count to configure the targets later."
            },
            "advanced_warming_terms": {
              "type": "array",
              "minItems": 3,
              "maxItems": 30,
              "x-item-count-multiple-of": 3,
              "items": {
                "type": "string",
                "minLength": 2,
                "maxLength": 50
              },
              "description": "3-30 niche targets (search terms), count a multiple of 3, each 2-50 characters, applied identically to every account of the batch. REQUIRES wants_advanced_warming: true in the same body (ADVANCED_WARMING_FLAG_REQUIRED otherwise). Every term must survive cleanup intact: entries are trimmed and compared case-insensitively, and if any is dropped as a duplicate or for its length the call fails with ADVANCED_WARMING_TERMS_REJECTED listing what was dropped. Send this list OR advanced_warming_terms_count, not both: a count that disagrees with the list length fails with ADVANCED_WARMING_COUNT_MISMATCH."
            },
            "advanced_warming_terms_count": {
              "type": "integer",
              "minimum": 3,
              "maximum": 30,
              "multipleOf": 3,
              "x-value-multiple-of": 3,
              "description": "Number of niche targets purchased PER ACCOUNT (3-30, multiples of 3; standard rate 5 credits each; GET /credit-costs returns the effective rate); the alternative to advanced_warming_terms when the targets are not decided yet. REQUIRES wants_advanced_warming: true in the same body (ADVANCED_WARMING_FLAG_REQUIRED otherwise). Do not send it alongside advanced_warming_terms unless it equals that list's length — a disagreement fails with ADVANCED_WARMING_COUNT_MISMATCH. Configure each bundle's targets later via PUT /bundles/{id}/warming-terms — but BEFORE publishing: publishBundle refuses a bundle whose warming has no targets (ADVANCED_WARMING_NOT_CONFIGURED). A purchase left unconfigured is not refunded."
            },
            "niche_warming_instructions": {
              "type": "string",
              "maxLength": 2000,
              "deprecated": true,
              "description": "Legacy — kept only for accounts being re-created after a refund; use Advanced Niche Warming (wants_advanced_warming)."
            },
            "auto_finalize_videos": {
              "type": "boolean",
              "default": true,
              "description": "Defaults to true: delivered videos are approved automatically and count as final. Set false to hold each delivered video for your manual review (approve or request corrections). Changeable later via updateBundle."
            },
            "external_ref": {
              "type": "string",
              "maxLength": 200,
              "description": "Optional batch-level client reference copied to every bundle created by this call. It is not unique per resulting bundle and is not an idempotency key. Use the returned bundle IDs for per-bundle identity and Idempotency-Key for retry/replay."
            }
          },
          "dependentRequired": {
            "advanced_warming_terms": [
              "wants_advanced_warming"
            ],
            "advanced_warming_terms_count": [
              "wants_advanced_warming"
            ]
          },
          "not": {
            "required": [
              "wants_niche_warming",
              "wants_advanced_warming"
            ],
            "properties": {
              "wants_niche_warming": {
                "const": true
              },
              "wants_advanced_warming": {
                "const": true
              }
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Create bundles in bulk",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_get_bundle",
    "operationId": "getBundle",
    "description": "Get a bundle. Full state of one bundle: status, account configuration, video slot counts, warming purchase, cancellation and remake history, and `next_action`. A remade bundle keeps the same id while its `saved_account_id` changes. Includes all video slots, including bundles with more than 1,000 slots. For unused capacity, count `videos` with status `pending`; `videos_configured_count` includes slots that have since been published or finalized. Counters have the same meaning as listBundles.",
    "method": "GET",
    "path": "/bundles/{id}",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get a bundle",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_update_bundle",
    "operationId": "updateBundle",
    "description": "Update bundle settings. Updates mutable bundle metadata: title, external_ref, and auto_finalize_videos. auto_finalize_videos true (the default) approves every delivered video automatically — it counts as final on arrival; set it to false to hold each delivered video for your review, approving with finalizeBundleVideo or pushing back with requestBundleVideoCorrections yourself. Note that anything left in review is auto-finalized about 72 hours after entering it either way.",
    "method": "PATCH",
    "path": "/bundles/{id}",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "body": {
          "type": "object",
          "properties": {
            "auto_finalize_videos": {
              "type": "boolean"
            },
            "external_ref": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 200
            },
            "title": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 200
            }
          },
          "minProperties": 1,
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Update bundle settings",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_publish_bundle",
    "operationId": "publishBundle",
    "description": "Publish a bundle. Submits a fully configured bundle to the account-manager marketplace, which is what actually starts the work. Requires status `pending_setup`, a complete account profile, and at least one configured video on an `account_and_videos` bundle — call getBundlePublishReadiness first, it returns every blocker without debiting. A due Coverage period renews here, so this call can debit credits even though the bundle's own cost was charged at creation. Irreversible once a manager accepts: unpublishBundle only works before that, and never refunds. Publish-time date guard: any slot whose target date has already reached today or the past is moved forward to the earliest allowed day (today+1 with a delivered or existing account, today+3 while the account is still being created, in UTC), respecting the 3-videos-per-day-per-bundle cap — an overflowing day spills to the next one. Slots still in the future are NOT moved. This never fails the publish. When something moved, the response carries `adjusted_videos` — one entry per moved slot, `{video_id, position, previous_date, new_date}` — and `adjusted_videos_note`. Read them back instead of assuming the schedule you sent survived. Requires active TokPortal Coverage on the resolved saved account, or permanent grandfathering: a due period renews automatically at the account's stored rate immediately before execution, and nothing starts if it cannot renew. See getAccountManagedSubscription.",
    "method": "POST",
    "path": "/bundles/{id}/publish",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Publish a bundle",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_get_bundle_publish_readiness",
    "operationId": "getBundlePublishReadiness",
    "description": "Check bundle publish readiness. Returns every current publish blocker without mutating the bundle, settling Coverage, or debiting credits. MANAGED_ACCOUNT_TASK_BLOCKED includes details.account_id and details.reason. Fetch GET /accounts/{account_id}/managed-subscription for the authoritative state and exact reactivation quote. A due included or active period can temporarily appear blocked until renewal is settled by cron or an approved mutation.",
    "method": "GET",
    "path": "/bundles/{id}/publish-readiness",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Check bundle publish readiness",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_unpublish_bundle",
    "operationId": "unpublishBundle",
    "description": "Unpublish a bundle. Returns a published bundle to `pending_setup` so its account configuration can be edited again. Only works while the bundle is published and no account manager has accepted it (409 otherwise). Credits are NOT refunded and this is not a cancellation: there is no API path to cancel a bundle or recover its credits.",
    "method": "POST",
    "path": "/bundles/{id}/unpublish",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Unpublish a bundle",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_add_video_slots",
    "operationId": "addVideoSlots",
    "description": "Add video slots to a bundle. Buys additional video slots on an existing bundle and debits credits immediately (see `video_upload` in getCreditCosts). The slots are non-refundable and there is no cancellation path for this purchase; confirm the exact cost with the user before calling. Allowed bundle statuses: `pending_setup`, `published`, `published_priority`, `accepted`. An `account_only` or `completed` bundle cannot receive more slots; create a `videos_only` bundle for the saved account instead, subject to account eligibility. Configure the new positions with configureBundleVideo, then publish them.",
    "method": "POST",
    "path": "/bundles/{id}/add-video-slots",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "body": {
          "type": "object",
          "required": [
            "quantity"
          ],
          "properties": {
            "quantity": {
              "type": "integer",
              "minimum": 1,
              "maximum": 500,
              "description": "How many slots to buy. Charged immediately at the getCreditCosts rate and never refundable — there is no cancellation path for this purchase."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Add video slots to a bundle",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_add_edit_slots",
    "operationId": "addEditSlots",
    "description": "Add VIDEO-editing slots to a bundle. Buys video-editing slots — professional editing of a video by the account manager — and debits credits immediately (see `video_edit` in getCreditCosts). Non-refundable, with no cancellation path; confirm the exact cost with the user before calling. `edits_quantity` cannot exceed the bundle's `videos_quantity`, one video consumes at most one slot, and a slot is only consumed when that video carries `editing_instructions`. This has nothing to do with editing an account profile — use createAccountEditRequest for that.",
    "method": "POST",
    "path": "/bundles/{id}/add-edit-slots",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "body": {
          "type": "object",
          "required": [
            "quantity"
          ],
          "properties": {
            "quantity": {
              "type": "integer",
              "minimum": 1,
              "maximum": 500,
              "description": "How many slots to buy. Charged immediately at the getCreditCosts rate and never refundable — there is no cancellation path for this purchase."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Add VIDEO-editing slots to a bundle",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_bundle_account",
    "operationId": "getBundleAccount",
    "description": "Get bundle account configuration. Returns the current account-profile configuration of a bundle (username, visible name, biography, picture) and its listing status. Read it before configureBundleAccount to see what is already set and whether the profile is still editable.",
    "method": "GET",
    "path": "/bundles/{id}/account",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get bundle account configuration",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_configure_bundle_account",
    "operationId": "configureBundleAccount",
    "description": "Configure bundle account profile. Sets the profile of an account that has NOT been delivered yet: username, visible name, biography, profile picture, and link-in-bio on Instagram bundles. Only valid while the bundle is `pending_setup` or `configured` — unpublish first to edit after publishing, and use createAccountEditRequest for an account that is already delivered. This is a full replacement: any field you omit is written back as null, so re-send the whole profile when you change one part of it. `link_in_bio` is stored on Instagram bundles only. On any other platform it is accepted but not stored, and the response says so explicitly through `_warnings` while echoing `link_in_bio: null` — read both back. For backward compatibility this endpoint also accepts the exact purchased advanced_warming_terms list, but PUT /bundles/{id}/warming-terms is the recommended one-shot deferred-target endpoint because it remains available at any account status. Requires active TokPortal Coverage on the resolved saved account, or permanent grandfathering: a due period renews automatically at the account's stored rate immediately before execution, and nothing starts if it cannot renew. See getAccountManagedSubscription. A new account that has not produced a saved account yet remains configurable before delivery.",
    "method": "PUT",
    "path": "/bundles/{id}/account",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "body": {
          "type": "object",
          "required": [
            "username",
            "visible_name"
          ],
          "properties": {
            "username": {
              "type": "string",
              "minLength": 1,
              "maxLength": 24,
              "pattern": "^[a-zA-Z0-9_.]+$",
              "description": "Requested username. Cannot end with a dot."
            },
            "visible_name": {
              "type": "string",
              "minLength": 1,
              "maxLength": 30,
              "description": "Public display name. Avoid reusing the same wording across accounts of one batch: near-identical profiles raise the risk of mass-ban detection."
            },
            "biography": {
              "type": "string",
              "maxLength": 120,
              "description": "Profile biography. The enforced limit is platform-dependent: 120 characters on Instagram, 80 on every other platform."
            },
            "profile_picture_url": {
              "type": "string",
              "description": "Public image URL, or the storage_path returned by uploadImage / uploadImageDirect / uploadImageFromUrl. Use storage_path, not public_url — public_url is only correct for videos."
            },
            "link_in_bio": {
              "type": "string",
              "format": "uri",
              "description": "Instagram bundles only. On TikTok and every other platform it is accepted, stored as null, and reported back in the response's _warnings array — read _warnings, not just the 200."
            },
            "niche_warming_instructions": {
              "type": "string",
              "maxLength": 2000,
              "deprecated": true,
              "description": "Legacy — kept only for accounts being re-created after a refund; use Advanced Niche Warming (wants_advanced_warming)."
            },
            "advanced_warming_terms": {
              "type": "array",
              "minItems": 3,
              "maxItems": 30,
              "x-item-count-multiple-of": 3,
              "items": {
                "type": "string",
                "minLength": 2,
                "maxLength": 50
              },
              "description": "Backward-compatible account-configuration field for an Advanced Niche Warming purchase made with advanced_warming_terms_count. Prefer PUT /bundles/{id}/warming-terms, which remains available at any account status. Must contain exactly the purchased number of targets and can only be set once."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Configure bundle account profile",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_request_bundle_account_corrections",
    "operationId": "requestBundleAccountCorrections",
    "description": "Request account corrections. Moves an in-review account back to pending corrections with reviewer feedback.",
    "method": "POST",
    "path": "/bundles/{id}/account/corrections",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "body": {
          "type": "object",
          "required": [
            "comment"
          ],
          "properties": {
            "comment": {
              "type": "string",
              "minLength": 1,
              "maxLength": 2000
            },
            "fields": {
              "type": "object",
              "properties": {
                "username": {
                  "type": "boolean"
                },
                "visible_name": {
                  "type": "boolean"
                },
                "biography": {
                  "type": "boolean"
                },
                "profile_picture": {
                  "type": "boolean"
                }
              },
              "additionalProperties": false
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "comment": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000,
          "description": "JSON body field. May be supplied here or inside body.comment."
        },
        "fields": {
          "type": "object",
          "properties": {
            "username": {
              "type": "boolean"
            },
            "visible_name": {
              "type": "boolean"
            },
            "biography": {
              "type": "boolean"
            },
            "profile_picture": {
              "type": "boolean"
            }
          },
          "additionalProperties": false,
          "description": "JSON body field. May be supplied here or inside body.fields."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id"
      ],
      "anyOf": [
        {
          "required": [
            "body"
          ]
        },
        {
          "required": [
            "comment"
          ]
        }
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Request account corrections",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_finalize_bundle_account",
    "operationId": "finalizeBundleAccount",
    "description": "Finalize account review. Approves an in-review account and marks it finalized.",
    "method": "POST",
    "path": "/bundles/{id}/account/finalize",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Finalize account review",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_bundle_videos",
    "operationId": "listBundleVideos",
    "description": "List bundle video slots. Lists every video slot of a bundle with its position, configuration, schedule and review status, including bundles with more than 1,000 slots. Unused slots have status `pending`; configured, scheduled and finalized slots are already allocated. Positions are 1-based and run up to the bundle's `videos_quantity`. Every video carries `platform_signals`, what the platform did with the live post once it exists: `not_recommended` (TikTok Not For Feed / Not Recommended — online but no distribution), `ai_label` (`creator` | `platform`), `sound` (`ok` | `non_commercial` | `removed` | `muted`) with `sound_reason`, and `checked_at`. All fields are null until the post has been checked (~48 h after posting, again at 7 days); `null` means unknown, never 'no'. The same events arrive as `video.not_recommended`, `video.ai_labeled` and `video.sound_restricted` webhooks.",
    "method": "GET",
    "path": "/bundles/{id}/videos",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "List bundle video slots",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_bundle_video",
    "operationId": "getBundleVideo",
    "description": "Get video slot configuration. Returns one video slot's configuration, schedule, review status and post link, plus `platform_signals` (TikTok not-recommended flag, AI label, sound status — null until the live post has been checked). Use it to check whether a slot is still inside its review window before finalizing it, or whether the platform is distributing the post at all.",
    "method": "GET",
    "path": "/bundles/{id}/videos/{position}",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "position": {
          "type": "integer",
          "minimum": 1,
          "description": "1-based video slot position."
        }
      },
      "required": [
        "id",
        "position"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get video slot configuration",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_configure_bundle_video",
    "operationId": "configureBundleVideo",
    "description": "Configure a video slot. Configures one slot as a video, carousel, or story, and schedules it. A story (TikTok/Instagram only) is a single video OR a single image (provide exactly one of video_url or story_image_url), has no description, and is verified by an account-manager screenshot. Platform-specific fields are only stored on their own platform: `tiktok_sound_url` on TikTok, every `instagram_*` field on Instagram, every `youtube_*` field on YouTube. A field belonging to another platform is accepted and not stored, but it is no longer discarded in silence: the response lists those names in `ignored_fields`, next to `platform`, with an `ignored_fields_note` explaining why. Check `ignored_fields` on every 200 — an empty or absent list is the only proof that everything you sent landed. Some options are paid and charged the first time they are set, never refunded: story_repost_url, instant_repost_as_story, and setting either volume field. Scheduling: `target_publish_date` is the FIRST day of a 2-day publishing window, never a fixed date — the end day is derived as that day + 1 and cannot be chosen, so `target_publish_end_date` is refused here with a hint pointing at PATCH. The window that was actually stored comes back as `target_publish_start_date` / `target_publish_end_date`. `auto_publish` is per-video HERE and top-level-only on the batch endpoint. Requires active TokPortal Coverage on the resolved saved account, or permanent grandfathering: a due period renews automatically at the account's stored rate immediately before execution, and nothing starts if it cannot renew. See getAccountManagedSubscription.",
    "method": "PUT",
    "path": "/bundles/{id}/videos/{position}",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "position": {
          "type": "integer",
          "minimum": 1,
          "description": "1-based video slot position."
        },
        "body": {
          "type": "object",
          "required": [
            "video_type",
            "target_publish_date"
          ],
          "properties": {
            "video_type": {
              "type": "string",
              "enum": [
                "video",
                "carousel",
                "story"
              ]
            },
            "description": {
              "type": "string",
              "minLength": 1,
              "maxLength": 2200,
              "description": "Required for 'video' and 'carousel'. Stories have no description."
            },
            "target_publish_date": {
              "type": "string",
              "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
              "description": "YYYY-MM-DD. This is the FIRST day of a 2-day publishing window, not a fixed date: the manager may post on this day or the next. The end day is derived — always this day + 1 — and cannot be chosen here; sending target_publish_end_date is rejected. Every video response returns the resulting window as target_publish_start_date / target_publish_end_date (target_publish_date is an alias of the start). Max 3 videos per day per bundle — a 4th video on the same day is rejected with VIDEOS_PER_DAY_EXCEEDED. Minimum lead time, in UTC: the earliest allowed date is today+3 days while the bundle is still having its account created, and today+1 once that account is delivered or when the bundle runs on an existing account; an earlier date is rejected with INVALID_DATE carrying min_days_ahead and earliest_allowed (YYYY-MM-DD)."
            },
            "name": {
              "type": "string",
              "maxLength": 200
            },
            "video_url": {
              "type": "string",
              "format": "uri",
              "description": "Required for video_type 'video'. Use the public_url returned by uploadVideo / uploadVideoDirect (videos use public_url; images use storage_path)."
            },
            "carousel_images": {
              "type": "array",
              "minItems": 1,
              "maxItems": 20,
              "items": {
                "type": "string",
                "format": "uri"
              },
              "description": "Required for video_type 'carousel'. Use the storage_path returned by the image upload tools, NOT public_url (public_url is only correct for videos)."
            },
            "carousel_title": {
              "type": "string",
              "maxLength": 200
            },
            "story_image_url": {
              "type": "string",
              "format": "uri",
              "description": "Story image (TikTok/Instagram). Provide exactly one of video_url or story_image_url for a story."
            },
            "story_repost_url": {
              "type": "string",
              "format": "uri",
              "description": "Optional. Make the story repost an existing post from the SAME platform (TikTok story → tiktok.com, Instagram story → instagram.com). Costs +1 credit."
            },
            "tiktok_sound_url": {
              "type": "string",
              "format": "uri",
              "description": "TikTok bundles only. On any other platform it is accepted but not stored, and comes back in the response's ignored_fields. REQUIRED for a TikTok carousel (MISSING_FIELD otherwise), optional for a TikTok video."
            },
            "volume_original_sound": {
              "type": [
                "integer",
                "null"
              ],
              "minimum": 0,
              "maximum": 200,
              "description": "Playback volume of the clip's own audio, as a percentage; 100 leaves it unchanged. PAID OPTION: setting either volume field costs +1 credit per video, charged once when it is first set and never refunded."
            },
            "volume_added_sound": {
              "type": [
                "integer",
                "null"
              ],
              "minimum": 0,
              "maximum": 200,
              "description": "Playback volume of the added sound, as a percentage; 100 leaves it unchanged. PAID OPTION: setting either volume field costs +1 credit per video, charged once when it is first set and never refunded."
            },
            "editing_instructions": {
              "type": "string",
              "maxLength": 5000
            },
            "external_ref": {
              "type": "string",
              "maxLength": 200
            },
            "instagram_content_type": {
              "type": "string",
              "enum": [
                "reel",
                "post"
              ],
              "description": "REQUIRED for every Instagram slot that is not a story (MISSING_FIELD otherwise). Instagram bundles only. On any other platform it is accepted but not stored, and comes back in the response's ignored_fields."
            },
            "instagram_location": {
              "type": "string",
              "maxLength": 200,
              "description": "Instagram bundles only. On any other platform it is accepted but not stored, and comes back in the response's ignored_fields."
            },
            "instagram_collaborators": {
              "type": "array",
              "maxItems": 5,
              "items": {
                "type": "string"
              },
              "description": "Instagram bundles only. On any other platform it is accepted but not stored, and comes back in the response's ignored_fields."
            },
            "instagram_audio_name": {
              "type": "string",
              "maxLength": 200,
              "description": "Instagram bundles only. On any other platform it is accepted but not stored, and comes back in the response's ignored_fields."
            },
            "instagram_add_to_story": {
              "type": "boolean",
              "description": "Instagram bundles only. On any other platform it is accepted but not stored, and comes back in the response's ignored_fields."
            },
            "ai_content_disclaimer": {
              "type": "boolean",
              "description": "AI content notice (free). If true, the manager will enable the platform's AI-generated content label when posting."
            },
            "disclose_as_ads": {
              "type": "boolean",
              "description": "Disclose as ad (free). If true, the manager will enable branded-content/paid-partnership disclosure (or add #ad) when posting."
            },
            "instant_repost_as_story": {
              "type": "boolean",
              "description": "Instant repost as story (paid, +1 credit charged once when first enabled, no refunds). Right after posting, the manager reposts this video as a story and provides a screenshot proof. Only for video_type 'video' on TikTok/Instagram bundles. Omit to keep the current value."
            },
            "youtube_title": {
              "type": "string",
              "maxLength": 200,
              "description": "YouTube bundles only. On any other platform it is accepted but not stored, and comes back in the response's ignored_fields. YouTube bundles cannot currently be created (YOUTUBE_DELAYED)."
            },
            "youtube_tags": {
              "type": "array",
              "maxItems": 30,
              "items": {
                "type": "string"
              },
              "description": "YouTube bundles only. Elsewhere it is accepted but not stored, and comes back in the response's ignored_fields."
            },
            "youtube_category": {
              "type": "string",
              "maxLength": 100,
              "description": "YouTube bundles only. Elsewhere it is accepted but not stored, and comes back in the response's ignored_fields."
            },
            "youtube_visibility": {
              "type": "string",
              "enum": [
                "public",
                "unlisted",
                "private"
              ],
              "description": "YouTube bundles only. Elsewhere it is accepted but not stored, and comes back in the response's ignored_fields."
            },
            "youtube_sound_url": {
              "type": "string",
              "format": "uri",
              "description": "YouTube bundles only. Elsewhere it is accepted but not stored, and comes back in the response's ignored_fields."
            },
            "auto_publish": {
              "type": "boolean",
              "default": false,
              "description": "PER-VIDEO on this single-slot endpoint: it publishes this one slot in the same call. On the batch endpoint the same flag exists only at the ROOT of the body and covers every video in the call — it is not accepted inside videos[]. A publish failure never fails the configuration: the response carries auto_publish.published and auto_publish.blockers, so read them instead of assuming the slot went live. If publishing moved a stale target date forward, auto_publish.adjusted_videos lists {video_id, position, previous_date, new_date} — read it back rather than assuming the schedule you sent survived."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "position",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Configure a video slot",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": true,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_patch_bundle_video",
    "operationId": "patchBundleVideo",
    "description": "Patch video metadata or schedule. Changes a configured slot's name, description, external reference or schedule without re-sending its media. Rescheduling obeys the maximum of 3 videos per day per bundle AND — enforced since 2026-08-26, where before only the per-day cap ran — the same minimum publish lead time as configuration: today+1 with a delivered or existing account, today+3 while the account is still being created, in UTC. Today and any past date are rejected with `INVALID_DATE` carrying `min_days_ahead` and `earliest_allowed` (YYYY-MM-DD), the same shape the configure PUT returns. Send either target_publish_date (a 2-day window whose end is derived as that day + 1) or the target_publish_start_date/target_publish_end_date pair, never both — this is the ONLY endpoint where the window's end can be chosen, and it must fall strictly after the start. Cannot be used once the video is finalized. Requires active TokPortal Coverage on the resolved saved account, or permanent grandfathering: a due period renews automatically at the account's stored rate immediately before execution, and nothing starts if it cannot renew. See getAccountManagedSubscription.",
    "method": "PATCH",
    "path": "/bundles/{id}/videos/{position}",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "position": {
          "type": "integer",
          "minimum": 1,
          "description": "1-based video slot position."
        },
        "body": {
          "type": "object",
          "properties": {
            "external_ref": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 200
            },
            "name": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 200
            },
            "description": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 2200
            },
            "target_publish_date": {
              "type": [
                "string",
                "null"
              ],
              "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
              "description": "YYYY-MM-DD. Shorthand for a 2-day window: the end day is derived as this day + 1. Max 3 videos per day per bundle — a 4th video on the same day is rejected with VIDEOS_PER_DAY_EXCEEDED. Minimum lead time, in UTC: the earliest allowed date is today+3 days while the bundle is still having its account created, and today+1 once that account is delivered or when the bundle runs on an existing account; an earlier date is rejected with INVALID_DATE carrying min_days_ahead and earliest_allowed (YYYY-MM-DD). Cannot be combined with target_publish_start_date / target_publish_end_date."
            },
            "target_publish_start_date": {
              "type": [
                "string",
                "null"
              ],
              "format": "date-time",
              "description": "Start of the publication window as an ISO 8601 date-time; only its UTC calendar day is kept. The window is always the same 2-day window as everywhere else: that day at 00:00 UTC and the next day — the end is derived and can never be shortened or extended (any time-of-day or caller-supplied end is normalized away; the response returns the stored window). Prefer target_publish_date (YYYY-MM-DD); never send both. Since 2026-08-26 it obeys the same minimum lead time as configuration (today+1 with a delivered or existing account, today+3 while the account is still being created, in UTC); an earlier value is rejected with INVALID_DATE carrying min_days_ahead and earliest_allowed."
            },
            "target_publish_end_date": {
              "type": [
                "string",
                "null"
              ],
              "format": "date-time",
              "description": "Accepted for backward compatibility only. Must be strictly after target_publish_start_date and sent together with it — never alongside target_publish_date, and never on the configuration or CSV endpoints, where this field is refused. It does not choose the window: the end day is always the start day + 1 (2026-09-05), and the response returns the stored window."
            }
          },
          "minProperties": 1,
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "position",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Patch video metadata or schedule",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_batch_configure_bundle_videos",
    "operationId": "batchConfigureBundleVideos",
    "description": "Configure video slots in bulk. Configures many video slots in one call after a single account-level Coverage preflight. Partial success: this call returns HTTP 200 even when some or all rows are rejected. Read `configured`, `results` and `errors[]` and never infer success from the status code — rows breaking the 3-videos-per-day cap or the minimum lead time fail individually while the rest succeed, and the paid options they carry are only charged for the rows that succeeded. An `auto_publish` failure never fails the request; inspect `auto_publish.blockers`. TOP-LEVEL ONLY on this endpoint: one publish attempt per call, applying to every video in it. auto_publish inside videos[] is rejected with a hint telling you to move it out — it is per-video only on the single-slot PUT /bundles/{id}/videos/{position}. Each row's `target_publish_date` is the first day of a 2-day window whose end is derived (that day + 1); `target_publish_end_date` is refused on this endpoint. Publish-time date guard: any slot whose target date has already reached today or the past is moved forward to the earliest allowed day (today+1 with a delivered or existing account, today+3 while the account is still being created, in UTC), respecting the 3-videos-per-day-per-bundle cap — an overflowing day spills to the next one. Slots still in the future are NOT moved. This never fails the publish. When something moved, the response carries `adjusted_videos` — one entry per moved slot, `{video_id, position, previous_date, new_date}` — and `adjusted_videos_note`. Read them back instead of assuming the schedule you sent survived. Requires active TokPortal Coverage on the resolved saved account, or permanent grandfathering: a due period renews automatically at the account's stored rate immediately before execution, and nothing starts if it cannot renew. See getAccountManagedSubscription.",
    "method": "PUT",
    "path": "/bundles/{id}/videos/batch",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "body": {
          "type": "object",
          "required": [
            "videos"
          ],
          "properties": {
            "videos": {
              "type": "array",
              "minItems": 1,
              "maxItems": 500,
              "description": "Slots to configure. Each entry is validated and applied independently: the call answers HTTP 200 even when some or all entries fail, so read configured, results and errors[] rather than the status code.",
              "items": {
                "type": "object",
                "required": [
                  "video_type",
                  "target_publish_date",
                  "position"
                ],
                "properties": {
                  "video_type": {
                    "type": "string",
                    "enum": [
                      "video",
                      "carousel",
                      "story"
                    ]
                  },
                  "description": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 2200,
                    "description": "Required for 'video' and 'carousel'. Stories have no description."
                  },
                  "target_publish_date": {
                    "type": "string",
                    "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
                    "description": "YYYY-MM-DD. This is the FIRST day of a 2-day publishing window, not a fixed date: the manager may post on this day or the next. The end day is derived — always this day + 1 — and cannot be chosen here; sending target_publish_end_date is rejected. Every video response returns the resulting window as target_publish_start_date / target_publish_end_date (target_publish_date is an alias of the start). Max 3 videos per day per bundle — a 4th video on the same day is rejected with VIDEOS_PER_DAY_EXCEEDED. Minimum lead time, in UTC: the earliest allowed date is today+3 days while the bundle is still having its account created, and today+1 once that account is delivered or when the bundle runs on an existing account; an earlier date is rejected with INVALID_DATE carrying min_days_ahead and earliest_allowed (YYYY-MM-DD)."
                  },
                  "name": {
                    "type": "string",
                    "maxLength": 200
                  },
                  "video_url": {
                    "type": "string",
                    "format": "uri",
                    "description": "Required for video_type 'video'. Use the public_url returned by uploadVideo / uploadVideoDirect (videos use public_url; images use storage_path)."
                  },
                  "carousel_images": {
                    "type": "array",
                    "minItems": 1,
                    "maxItems": 20,
                    "items": {
                      "type": "string",
                      "format": "uri"
                    },
                    "description": "Required for video_type 'carousel'. Use the storage_path returned by the image upload tools, NOT public_url (public_url is only correct for videos)."
                  },
                  "carousel_title": {
                    "type": "string",
                    "maxLength": 200
                  },
                  "story_image_url": {
                    "type": "string",
                    "format": "uri",
                    "description": "Story image (TikTok/Instagram). Provide exactly one of video_url or story_image_url for a story."
                  },
                  "story_repost_url": {
                    "type": "string",
                    "format": "uri",
                    "description": "Optional. Make the story repost an existing post from the SAME platform (TikTok story → tiktok.com, Instagram story → instagram.com). Costs +1 credit."
                  },
                  "tiktok_sound_url": {
                    "type": "string",
                    "format": "uri",
                    "description": "TikTok bundles only. On any other platform it is accepted but not stored, and comes back in the response's ignored_fields. REQUIRED for a TikTok carousel (MISSING_FIELD otherwise), optional for a TikTok video."
                  },
                  "volume_original_sound": {
                    "type": [
                      "integer",
                      "null"
                    ],
                    "minimum": 0,
                    "maximum": 200,
                    "description": "Playback volume of the clip's own audio, as a percentage; 100 leaves it unchanged. PAID OPTION: setting either volume field costs +1 credit per video, charged once when it is first set and never refunded."
                  },
                  "volume_added_sound": {
                    "type": [
                      "integer",
                      "null"
                    ],
                    "minimum": 0,
                    "maximum": 200,
                    "description": "Playback volume of the added sound, as a percentage; 100 leaves it unchanged. PAID OPTION: setting either volume field costs +1 credit per video, charged once when it is first set and never refunded."
                  },
                  "editing_instructions": {
                    "type": "string",
                    "maxLength": 5000
                  },
                  "external_ref": {
                    "type": "string",
                    "maxLength": 200
                  },
                  "instagram_content_type": {
                    "type": "string",
                    "enum": [
                      "reel",
                      "post"
                    ],
                    "description": "REQUIRED for every Instagram slot that is not a story (MISSING_FIELD otherwise). Instagram bundles only. On any other platform it is accepted but not stored, and comes back in the response's ignored_fields."
                  },
                  "instagram_location": {
                    "type": "string",
                    "maxLength": 200,
                    "description": "Instagram bundles only. On any other platform it is accepted but not stored, and comes back in the response's ignored_fields."
                  },
                  "instagram_collaborators": {
                    "type": "array",
                    "maxItems": 5,
                    "items": {
                      "type": "string"
                    },
                    "description": "Instagram bundles only. On any other platform it is accepted but not stored, and comes back in the response's ignored_fields."
                  },
                  "instagram_audio_name": {
                    "type": "string",
                    "maxLength": 200,
                    "description": "Instagram bundles only. On any other platform it is accepted but not stored, and comes back in the response's ignored_fields."
                  },
                  "instagram_add_to_story": {
                    "type": "boolean",
                    "description": "Instagram bundles only. On any other platform it is accepted but not stored, and comes back in the response's ignored_fields."
                  },
                  "ai_content_disclaimer": {
                    "type": "boolean",
                    "description": "AI content notice (free). If true, the manager will enable the platform's AI-generated content label when posting."
                  },
                  "disclose_as_ads": {
                    "type": "boolean",
                    "description": "Disclose as ad (free). If true, the manager will enable branded-content/paid-partnership disclosure (or add #ad) when posting."
                  },
                  "instant_repost_as_story": {
                    "type": "boolean",
                    "description": "Instant repost as story (paid, +1 credit charged once when first enabled, no refunds). Right after posting, the manager reposts this video as a story and provides a screenshot proof. Only for video_type 'video' on TikTok/Instagram bundles. Omit to keep the current value."
                  },
                  "youtube_title": {
                    "type": "string",
                    "maxLength": 200,
                    "description": "YouTube bundles only. On any other platform it is accepted but not stored, and comes back in the response's ignored_fields. YouTube bundles cannot currently be created (YOUTUBE_DELAYED)."
                  },
                  "youtube_tags": {
                    "type": "array",
                    "maxItems": 30,
                    "items": {
                      "type": "string"
                    },
                    "description": "YouTube bundles only. Elsewhere it is accepted but not stored, and comes back in the response's ignored_fields."
                  },
                  "youtube_category": {
                    "type": "string",
                    "maxLength": 100,
                    "description": "YouTube bundles only. Elsewhere it is accepted but not stored, and comes back in the response's ignored_fields."
                  },
                  "youtube_visibility": {
                    "type": "string",
                    "enum": [
                      "public",
                      "unlisted",
                      "private"
                    ],
                    "description": "YouTube bundles only. Elsewhere it is accepted but not stored, and comes back in the response's ignored_fields."
                  },
                  "youtube_sound_url": {
                    "type": "string",
                    "format": "uri",
                    "description": "YouTube bundles only. Elsewhere it is accepted but not stored, and comes back in the response's ignored_fields."
                  },
                  "position": {
                    "type": "integer",
                    "minimum": 1,
                    "description": "1-based slot position on the bundle. Required on every entry."
                  }
                },
                "additionalProperties": false
              }
            },
            "auto_publish": {
              "type": "boolean",
              "default": false,
              "description": "Publish the bundle in the same call once at least one row has been configured. TOP-LEVEL ONLY on this endpoint: one publish attempt per call, applying to every video in it. auto_publish inside videos[] is rejected with a hint telling you to move it out — it is per-video only on the single-slot PUT /bundles/{id}/videos/{position}. A publish failure never fails the configuration: read auto_publish.published and auto_publish.blockers. If publishing moved stale target dates forward, auto_publish.adjusted_videos lists {video_id, position, previous_date, new_date}."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Configure video slots in bulk",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": true,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_publish_all_bundle_videos",
    "operationId": "publishAllBundleVideos",
    "description": "Publish all configured videos on an active bundle. Hands every configured, unpublished slot on an active bundle to the account manager for posting. Publishing is irreversible once a manager has posted; call unscheduleBundleVideo beforehand to hold a slot back. Slots whose target date has already reached today or the past are moved forward to the earliest allowed day, respecting the 3-videos-per-day-per-bundle cap (an overflowing day spills to the next); slots still in the future are left alone, and the publish never fails because of it. When something moved, the response carries `dates_adjusted` (how many), `adjusted_videos` (one `{video_id, position, previous_date, new_date}` per moved slot) and `hint`. There is no `earliest_allowed_date` field on this response — it was documented but never returned, and `adjusted_videos` replaces it with the per-slot dates. Read them back instead of assuming the original schedule survived. Requires active TokPortal Coverage on the resolved saved account, or permanent grandfathering: a due period renews automatically at the account's stored rate immediately before execution, and nothing starts if it cannot renew. See getAccountManagedSubscription.",
    "method": "POST",
    "path": "/bundles/{id}/videos/publish-all",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Publish all configured videos on an active bundle",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_import_bundle_videos_csv",
    "operationId": "importBundleVideosCsv",
    "description": "Import video slots from CSV. Uploads a CSV file, downloads the referenced media, and configures the available video slots. Partial success: this call returns HTTP 200 even when some or all rows are rejected. Read `imported`, `results` and `errors[]` and never infer success from the status code — rows breaking the 3-videos-per-day cap or the minimum lead time fail individually while the rest succeed. An `auto_publish` failure never fails the request; inspect `auto_publish.blockers`, and `auto_publish.adjusted_videos` when a stale date was moved forward at publish time. The date column is `target_publish_start_date` (note the name: the JSON endpoints call the same value `target_publish_date`) and it is the FIRST day of a 2-day window — the end is derived as that day + 1, so a `target_publish_end_date` column is refused with CSV_PARSE_ERROR rather than dropped. `auto_publish` is a form field on the multipart body and covers the whole import. Coverage is checked before TokPortal fetches or stores any referenced media. Requires active TokPortal Coverage on the resolved saved account, or permanent grandfathering: a due period renews automatically at the account's stored rate immediately before execution, and nothing starts if it cannot renew. See getAccountManagedSubscription.",
    "method": "POST",
    "path": "/bundles/{id}/videos/import-csv",
    "requestContentType": "multipart/form-data",
    "multipartFields": [
      {
        "name": "file",
        "required": true,
        "binary": true,
        "schema": {
          "type": "string",
          "format": "binary"
        }
      },
      {
        "name": "auto_publish",
        "required": false,
        "binary": false,
        "schema": {
          "type": "boolean",
          "default": false,
          "description": "Publish the bundle once the import has configured at least one row. Covers the whole import — there is one publish attempt per call. A publish failure never fails the import: read auto_publish.published, auto_publish.blockers and auto_publish.adjusted_videos."
        }
      }
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "file_path": {
          "type": "string",
          "description": "Local path to upload for multipart field file."
        },
        "auto_publish": {
          "type": "boolean",
          "default": false,
          "description": "Multipart form field auto_publish."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "file_path"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Import video slots from CSV",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_publish_bundle_video",
    "operationId": "publishBundleVideo",
    "description": "Publish one video slot. Hands one configured slot to the account manager for posting on its target date. Irreversible once the manager has posted. If that target date has already reached today or the past it is moved forward to the earliest allowed day rather than published as instantly-due work, and the response then carries `date_adjusted: true`, `original_date`, `new_date` (both YYYY-MM-DD) and `hint`. Those four fields were documented long before they were real: until 2026-08-26 the RPC never returned them, and the slot published on its stale date. Requires active TokPortal Coverage on the resolved saved account, or permanent grandfathering: a due period renews automatically at the account's stored rate immediately before execution, and nothing starts if it cannot renew. See getAccountManagedSubscription.",
    "method": "POST",
    "path": "/bundles/{id}/videos/{position}/publish",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "position": {
          "type": "integer",
          "minimum": 1,
          "description": "1-based video slot position."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "position"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Publish one video slot",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_reset_bundle_video",
    "operationId": "resetBundleVideo",
    "description": "Reset one video slot. Clears a slot's configuration so it can be configured again. Only works from `pending` or `configured`: to clear a published or accepted slot call unscheduleBundleVideo first, then reset. The slot's credits are not refunded and any paid option already charged on it stays charged. Requires active TokPortal Coverage on the resolved saved account, or permanent grandfathering: a due period renews automatically at the account's stored rate immediately before execution, and nothing starts if it cannot renew. See getAccountManagedSubscription.",
    "method": "POST",
    "path": "/bundles/{id}/videos/{position}/reset",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "position": {
          "type": "integer",
          "minimum": 1,
          "description": "1-based video slot position."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "position"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Reset one video slot",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_unschedule_bundle_video",
    "operationId": "unscheduleBundleVideo",
    "description": "Unschedule one video slot. Pulls a published slot back out of the account-manager queue and returns it to `configured`, so it can be rescheduled or reset. Does not refund the slot. Requires active TokPortal Coverage on the resolved saved account, or permanent grandfathering: a due period renews automatically at the account's stored rate immediately before execution, and nothing starts if it cannot renew. See getAccountManagedSubscription.",
    "method": "POST",
    "path": "/bundles/{id}/videos/{position}/unschedule",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "position": {
          "type": "integer",
          "minimum": 1,
          "description": "1-based video slot position."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "position"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Unschedule one video slot",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_finalize_bundle_video",
    "operationId": "finalizeBundleVideo",
    "description": "Finalize video review. Approves a delivered video and releases the account manager's payout — the review window cannot be reopened afterwards. Only valid while the slot is `in_review`. Any slot left in review is auto-finalized about 72 hours after entering it, so act inside that window. Requires active TokPortal Coverage on the resolved saved account, or permanent grandfathering: a due period renews automatically at the account's stored rate immediately before execution, and nothing starts if it cannot renew. See getAccountManagedSubscription.",
    "method": "POST",
    "path": "/bundles/{id}/videos/{position}/finalize",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "position": {
          "type": "integer",
          "minimum": 1,
          "description": "1-based video slot position."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "position"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Finalize video review",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_request_bundle_video_corrections",
    "operationId": "requestBundleVideoCorrections",
    "description": "Request video corrections. Sends a delivered video back to the account manager with written feedback instead of approving it. Only valid while the slot is `in_review`, i.e. inside the ~72-hour window before it auto-finalizes. The response does not echo `fields`, so keep your own record of what you flagged. Requires active TokPortal Coverage on the resolved saved account, or permanent grandfathering: a due period renews automatically at the account's stored rate immediately before execution, and nothing starts if it cannot renew. See getAccountManagedSubscription.",
    "method": "POST",
    "path": "/bundles/{id}/videos/{position}/corrections",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "position": {
          "type": "integer",
          "minimum": 1,
          "description": "1-based video slot position."
        },
        "body": {
          "type": "object",
          "required": [
            "comment"
          ],
          "properties": {
            "comment": {
              "type": "string",
              "minLength": 1,
              "maxLength": 2000
            },
            "fields": {
              "type": "object",
              "properties": {
                "video_content": {
                  "type": "boolean"
                },
                "description": {
                  "type": "boolean"
                },
                "video_editing": {
                  "type": "boolean"
                },
                "sound": {
                  "type": "boolean"
                }
              },
              "additionalProperties": false
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "comment": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000,
          "description": "JSON body field. May be supplied here or inside body.comment."
        },
        "fields": {
          "type": "object",
          "properties": {
            "video_content": {
              "type": "boolean"
            },
            "description": {
              "type": "boolean"
            },
            "video_editing": {
              "type": "boolean"
            },
            "sound": {
              "type": "boolean"
            }
          },
          "additionalProperties": false,
          "description": "JSON body field. May be supplied here or inside body.fields."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "position"
      ],
      "anyOf": [
        {
          "required": [
            "body"
          ]
        },
        {
          "required": [
            "comment"
          ]
        }
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Request video corrections",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_fix_bundle_video_download",
    "operationId": "fixBundleVideoDownload",
    "description": "Fix a broken video download. Replaces a manager-flagged broken video or carousel download URL and clears the download-issue flag. Requires active TokPortal Coverage on the resolved saved account, or permanent grandfathering: a due period renews automatically at the account's stored rate immediately before execution, and nothing starts if it cannot renew. See getAccountManagedSubscription.",
    "method": "POST",
    "path": "/bundles/{id}/videos/{position}/fix-download",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "position": {
          "type": "integer",
          "minimum": 1,
          "description": "1-based video slot position."
        },
        "body": {
          "type": "object",
          "properties": {
            "video_url": {
              "type": "string",
              "format": "uri"
            },
            "carousel_images": {
              "type": "array",
              "minItems": 1,
              "maxItems": 20,
              "items": {
                "type": "string",
                "format": "uri"
              }
            }
          },
          "anyOf": [
            {
              "required": [
                "video_url"
              ]
            },
            {
              "required": [
                "carousel_images"
              ]
            }
          ],
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "position",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Fix a broken video download",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_accounts",
    "operationId": "listAccounts",
    "description": "List delivered accounts. Lists delivered saved accounts (real accounts that exist on the platform). Note the product has two ids: the account *listing* id carried by a bundle is stable across remakes, while the `saved_account_id` returned here is replaced every time an account is remade.",
    "method": "GET",
    "path": "/accounts",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "page": {
          "type": "integer",
          "minimum": 1,
          "default": 1,
          "description": "Page number."
        },
        "per_page": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 25,
          "description": "Items per page."
        },
        "platform": {
          "type": "string",
          "enum": [
            "tiktok",
            "instagram"
          ],
          "description": "Filter by platform."
        },
        "country": {
          "type": "string",
          "description": "Filter by country code or country alias."
        },
        "banned": {
          "type": "string",
          "enum": [
            "true",
            "false"
          ],
          "description": "Filter by ban state. true returns only banned accounts (staff-validated or park-scan detected, matching the `banned` response field); false returns only non-banned accounts."
        }
      },
      "additionalProperties": false
    },
    "annotations": {
      "title": "List delivered accounts",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_account_bans",
    "operationId": "listAccountBans",
    "description": "List ban reports and appeals. Pollable list of validated ban reports for the caller's delivered accounts, covering the whole lifecycle: appeal_pending (platform appeal filed, account unavailable but NOT yet banned), appeal_accepted (account survived), appeal_refused / no_appeal_banned (confirmed ban), and the staff commercial resolution (refund / remake / no_remake with a machine-readable reason_code such as tos_ban). While a report is appeal_pending, do NOT order a replacement account: a duplicate can trigger a ban-evasion strike on the platform, which is why TokPortal itself waits for the appeal. Key your reports on bundle_id — account_id can be null after a staff reset. A resolution of refund returns setup, warming and unused video slots, but not work already delivered and not the Coverage period, and the restored credits expire 60 days after restoration (see the credits.restored event in listWebhookEvents). This is the REST counterpart of the account.banned, account.ban_appeal.submitted, account.ban_appeal.resolved and account.ban_resolution.decided webhook events. Only staff/CM-validated bans appear here — detections from TokPortal's internal health scan are never listed. Poll with the since parameter (updated_at watermark) to pick up new reports and status changes.",
    "method": "GET",
    "path": "/account-bans",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "page": {
          "type": "integer",
          "minimum": 1,
          "default": 1,
          "description": "Page number."
        },
        "per_page": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 25,
          "description": "Items per page."
        },
        "status": {
          "type": "string",
          "enum": [
            "appeal_pending",
            "appeal_accepted",
            "appeal_refused",
            "no_appeal_banned"
          ],
          "description": "Filter by appeal lifecycle status."
        },
        "resolution": {
          "type": "string",
          "enum": [
            "refund",
            "remake",
            "no_remake",
            "pending"
          ],
          "description": "Filter by staff commercial resolution. 'pending' selects confirmed bans still awaiting the staff decision."
        },
        "account_id": {
          "type": "string",
          "format": "uuid",
          "description": "Filter by saved account ID."
        },
        "since": {
          "type": "string",
          "format": "date-time",
          "description": "Only reports updated at or after this ISO 8601 timestamp. Use the highest updated_at you have seen as a polling watermark."
        },
        "include_screenshots": {
          "type": "string",
          "enum": [
            "true",
            "false"
          ],
          "description": "When true, each report includes a signed 7-day URL of the ban-evidence screenshot when one exists."
        }
      },
      "additionalProperties": false
    },
    "annotations": {
      "title": "List ban reports and appeals",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_account",
    "operationId": "getAccount",
    "description": "Get a delivered account. Returns one delivered account: handle, platform, Coverage state, ban state and warming summary. A `saved_account_id` invalidated by a remake returns 404 — re-read the bundle to get the new one.",
    "method": "GET",
    "path": "/accounts/{id}",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get a delivered account",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_account_connection",
    "operationId": "getAccountConnection",
    "description": "Check the API connection of an account. Returns the current API connection state, checked_at, recovery action and separate feature eligibility. Ownership and current expected identity are checked. A fresh server check may be reused for up to 60 seconds and is invalidated by a newer disconnection event. An unavailable provider returns state checking, never a false disconnection. Messaging configuration eligible is not proof of an open reply window or successful send. This read does not create tasks or charge credits.",
    "method": "GET",
    "path": "/accounts/{id}/connection",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Check the API connection of an account",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_account_inbox",
    "operationId": "getAccountInbox",
    "description": "Read account messages or comments. Read-only inbox for one owned account with active API connection and eligible TokPortal Coverage. Posts/comments work for eligible Instagram and TikTok connections; conversations/messages currently require an eligible Instagram Business setup. First list posts or conversations, then pass the returned opaque reference for comments or messages. To read comment replies, keep the post reference and pass the comment's reference as reply_reference. References and pagination cursors expire after one hour and are bound to the account, connection and resource. Refresh the parent list on inbox_reference_expired_or_invalid. Messages are newest first; reading never marks them as read. Comments may be cached upstream for 10 minutes. Replayed Instagram DM history is limited to the latest 500 conversations and 500 messages per conversation. This endpoint does not send, reply, moderate, create automations or charge credits. The separate /comments routes are paid human commenting tasks. Subscribe to inbox.comment.received and inbox.message.received for metadata notifications, then fetch this scoped endpoint. Public replies use POST /accounts/{id}/inbox/replies with reply_action_reference; this GET remains read-only.",
    "method": "GET",
    "path": "/accounts/{id}/inbox",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "kind": {
          "type": "string",
          "enum": [
            "posts",
            "comments",
            "conversations",
            "messages"
          ],
          "default": "posts",
          "description": "Which inbox resource to read."
        },
        "reference": {
          "type": "string",
          "maxLength": 16000,
          "description": "Opaque reference from a listed post or conversation. Required for comments and messages."
        },
        "reply_reference": {
          "type": "string",
          "maxLength": 16000,
          "description": "Opaque comment reference for reading its replies. Only for kind=comments, with the original post reference."
        },
        "cursor": {
          "type": "string",
          "maxLength": 16000,
          "description": "Pass pagination.next_cursor verbatim with the same kind and references."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 50,
          "default": 20,
          "description": "Page size."
        },
        "min_comments": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1,
          "description": "For kind=posts: 1 hides posts with no comments, 0 includes them (default). Filtering is applied after pagination: keep following next_cursor even on empty pages. Keep the same filter when paging."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Read account messages or comments",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_create_account_comment_reply",
    "operationId": "createAccountCommentReply",
    "description": "Reply to a received comment. Reply publicly to one received comment on an owned Instagram or TikTok post. Costs 0 credits and never renews Coverage. Requires active Coverage, verified connection and can_reply=true. Fetch posts, then comments; pass the post reference and the comment reply_action_reference. The body request_key UUID must remain identical on an exact retry. Account leases and provider quotas apply; honor Retry-After. A succeeded operation has a reply_id. pending/unknown means delivery is unconfirmed: fetch operation status and the comment thread, never blindly resend. Dry-run validates without sending. TikTok max 150 characters, Instagram max 2200.",
    "method": "POST",
    "path": "/accounts/{id}/inbox/replies",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "body": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "post_reference",
            "comment_reference",
            "text",
            "request_key"
          ],
          "properties": {
            "post_reference": {
              "type": "string",
              "maxLength": 16000
            },
            "comment_reference": {
              "type": "string",
              "maxLength": 16000
            },
            "text": {
              "type": "string",
              "minLength": 1,
              "maxLength": 2200
            },
            "request_key": {
              "type": "string",
              "format": "uuid"
            }
          },
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Reply to a received comment",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_get_account_comment_reply",
    "operationId": "getAccountCommentReply",
    "description": "Read a comment reply result. Owner-scoped durable delivery state: pending, succeeded, failed, rate_limited or unknown. No reply text or private credentials returned. Never automatically resend an unknown outcome.",
    "method": "GET",
    "path": "/accounts/{id}/inbox/replies/{replyId}",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "replyId": {
          "type": "string",
          "format": "uuid",
          "description": "Reply operation ID."
        }
      },
      "required": [
        "id",
        "replyId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Read a comment reply result",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_account_business_setup",
    "operationId": "getAccountBusinessSetup",
    "description": "Read Instagram Business setup progress. Client task status and 5-credit price. Manager compensation and private diagnostics are never returned. Completion verifies account identity, Business status, fresh authorization and messaging permissions; it does not prove that every recipient can receive a message.",
    "method": "GET",
    "path": "/accounts/{id}/business-setup",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Read Instagram Business setup progress",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_request_account_business_setup",
    "operationId": "requestAccountBusinessSetup",
    "description": "Order Instagram Business setup. Requests a manager conversion and fresh connection for 5 credits, once per saved account. Requires write scope, active Coverage and current manager. Existing requests replay without a second debit; accounts already Business are not charged. Explicitly acknowledge restricted commercial music access. Manager payout is separate. Dry-run validates without charging or assigning a task.",
    "method": "POST",
    "path": "/accounts/{id}/business-setup",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "body": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "music_limitations_acknowledged"
          ],
          "properties": {
            "music_limitations_acknowledged": {
              "type": "boolean",
              "const": true
            }
          },
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Order Instagram Business setup",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": true,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_update_account_commenting_profile",
    "operationId": "updateAccountCommentingProfile",
    "description": "Update account commenting profile. Sets the internal commenting-autopilot metadata (niche, persona, goal, language, tracked handles) that TokPortal uses to draft comments for this account. It NEVER changes the account's public profile — use createAccountEditRequest to change a delivered account's username, visible name, biography, picture or link. The account must belong to the API key owner and must have active TokPortal Coverage, unless it is permanently grandfathered. Revealed/detached, banned, paused, lapsed and unrecoverable accounts are read-only.",
    "method": "PATCH",
    "path": "/accounts/{id}/commenting-profile",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "body": {
          "type": "object",
          "properties": {
            "niche": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 500
            },
            "persona": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 500
            },
            "goal": {
              "type": [
                "string",
                "null"
              ],
              "enum": [
                "promotion",
                "awareness",
                "product",
                null
              ]
            },
            "language": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 80
            },
            "tracked_handles": {
              "type": [
                "array",
                "null"
              ],
              "maxItems": 50,
              "items": {
                "type": "string",
                "minLength": 1,
                "maxLength": 120
              }
            },
            "daily_tracking_enabled": {
              "type": [
                "boolean",
                "null"
              ]
            }
          },
          "minProperties": 1,
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Update account commenting profile",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_account_bundles",
    "operationId": "listAccountBundles",
    "description": "List bundles for a delivered account. Lists every bundle attached to one delivered account, including cancelled ones. Use it to see an account's full order history before ordering more work on it.",
    "method": "GET",
    "path": "/accounts/{id}/bundles",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "page": {
          "type": "integer",
          "minimum": 1,
          "default": 1,
          "description": "Page number."
        },
        "per_page": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 25,
          "description": "Items per page."
        },
        "status": {
          "type": "string",
          "description": "Filter by bundle status."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "List bundles for a delivered account",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_retrieve_account_verification_code",
    "operationId": "retrieveAccountVerificationCode",
    "description": "Retrieve latest account verification code. Retrieving a verification code is the same irreversible first-access event as revealing credentials. Its policy is determined by this saved account's created_at timestamp against the immutable managed_pricing_new_customer_cutover_at value, never by the workspace action-pricing cohort or August 14 grace deadline. A saved account created before the cutoff permanently keeps the prior API contract: 0 credits, no new versioned acknowledgment body required, no TokPortal detachment, existing task access remains available, and support plus ban coverage end after access. A saved account created at or after the cutoff follows the managed policy: normally 150 credits, or the stored $10 legacy / $15 new per-30-day rate when Account Owning is already admin-approved. Managed access permanently detaches the account, makes it read-only, and ends TokPortal Coverage, task access, analytics updates, support, ban protection, replacement, refunds, compensation and credit restoration. For a new-policy account, missing explicit acceptance fails with 428 and returns the exact account-specific terms, price and policy version. A changed quote returns 409 before any debit or reveal. Reaching the Account Owning eligibility threshold only submits an admin review request; it never activates the agreement automatically. While approval is pending, reveal remains available for 150 credits on a post-cutoff account. Do not send Idempotency-Key: this response contains a verification secret and is never stored in the replay ledger. A request that includes the header is rejected before any ledger claim, reveal, debit, or inbox access with IDEMPOTENCY_KEY_NOT_ALLOWED_FOR_SENSITIVE_RESPONSE (400). After an uncertain transport result, fetch the safe account state before deciding whether to call this endpoint again without the header.",
    "method": "POST",
    "path": "/accounts/{id}/verification-code",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "body": {
          "type": "object",
          "required": [
            "acknowledge_support_forfeit",
            "policy_version"
          ],
          "description": "JSON request body.",
          "properties": {
            "acknowledge_support_forfeit": {
              "type": "boolean",
              "enum": [
                true
              ],
              "description": "Set to true to confirm, on behalf of the account owner, acceptance of the exact disclosure identified by policy_version. Required on first credential or verification-code access and ignored after the account has already been revealed."
            },
            "policy_version": {
              "type": "string",
              "minLength": 1,
              "maxLength": 120,
              "description": "The exact current policy version returned in error.details.policy_version by HTTP 428 or 409. A missing version returns 428. A supplied non-empty stale or mismatched version returns CREDENTIAL_REVEAL_QUOTE_CHANGED (409), with the current disclosure and expected_credit_cost, before any debit or reveal."
            }
          },
          "additionalProperties": false
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Retrieve latest account verification code",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_reveal_account_credentials",
    "operationId": "revealAccountCredentials",
    "description": "Reveal delivered account credentials. The first credential or verification-code access is priced from this saved account's created_at timestamp against the immutable managed_pricing_new_customer_cutover_at value, never from the workspace action-pricing cohort or August 14 grace deadline. A saved account created before the cutoff permanently keeps the prior API contract: the reveal costs 0 credits, requires no new versioned acknowledgment body, and is irreversible; support and ban coverage end, but the account is not detached and existing TokPortal task access remains available. A saved account created at or after the cutoff follows the managed policy and requires the explicit versioned acknowledgment handshake: normally 150 credits, or the stored $10 legacy / $15 new per-30-day rate when Account Owning is already admin-approved. Crossing the Account Owning eligibility threshold only submits an admin review request and never activates it automatically. While approval is pending, reveal remains available for 150 credits on a post-cutoff account. Under the managed policy the charge is final and non-refundable, and reveal permanently detaches the account, makes it read-only, and ends TokPortal Coverage, all task access, analytics updates, support, ban protection, replacement, refunds, compensation and credit restoration. TokPortal is not responsible for later access, performance, reach, security, restrictions or bans. The debit or Account Owning activation, reveal marker and Coverage shutdown commit atomically. Previously revealed accounts are not charged a second time. Do not send Idempotency-Key: this response contains credentials and is never stored in the replay ledger. A request that includes the header is rejected before any ledger claim, reveal, debit, or secret access with IDEMPOTENCY_KEY_NOT_ALLOWED_FOR_SENSITIVE_RESPONSE (400). After an uncertain transport result, fetch the safe account state before deciding whether to call this endpoint again without the header.",
    "method": "POST",
    "path": "/accounts/{id}/reveal-credentials",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "body": {
          "type": "object",
          "required": [
            "acknowledge_support_forfeit",
            "policy_version"
          ],
          "description": "JSON request body.",
          "properties": {
            "acknowledge_support_forfeit": {
              "type": "boolean",
              "enum": [
                true
              ],
              "description": "Set to true to confirm, on behalf of the account owner, acceptance of the exact disclosure identified by policy_version. Required on first credential or verification-code access and ignored after the account has already been revealed."
            },
            "policy_version": {
              "type": "string",
              "minLength": 1,
              "maxLength": 120,
              "description": "The exact current policy version returned in error.details.policy_version by HTTP 428 or 409. A missing version returns 428. A supplied non-empty stale or mismatched version returns CREDENTIAL_REVEAL_QUOTE_CHANGED (409), with the current disclosure and expected_credit_cost, before any debit or reveal."
            }
          },
          "additionalProperties": false
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Reveal delivered account credentials",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_can_refresh_account_analytics",
    "operationId": "canRefreshAccountAnalytics",
    "description": "Check analytics refresh availability. Reports whether a manual analytics refresh is currently allowed and when the next one will be. Call it before refreshAccountAnalytics / refreshAnalyticsAccount to avoid a 429 cooldown (6 h for connected accounts, 24 h for the public fallback).",
    "method": "GET",
    "path": "/accounts/{id}/analytics/can-refresh",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Check analytics refresh availability",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_refresh_account_analytics",
    "operationId": "refreshAccountAnalytics",
    "description": "Refresh account analytics. Legacy account-analytics refresh path, kept for older integrations; new code should call refreshAnalyticsAccount. Comment collection is gated on three conditions: includeComments only runs when force is true, includePosts is not false, and the workspace holds the full analytics tier. The two you control are refusals, not silence — includeComments without force, or with includePosts false, fails with INVALID_FIELD for MCP callers and is reported for direct REST callers. The one you cannot control, the analytics tier, comes back on the response as applied.include_comments plus applied.include_comments_dropped_reason. The call can still return 200 with deduped: true and skippedReason: \"recent_snapshot\", which means nothing was refreshed. Check canRefreshAccountAnalytics first: a forced retry consumes the manual-refresh cooldown slot and the next one is rejected with 429. Refresh is blocked for revealed/detached, banned or inactive-Coverage accounts; permanently grandfathered accounts remain eligible.",
    "method": "POST",
    "path": "/accounts/{id}/analytics/refresh",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "body": {
          "type": "object",
          "properties": {
            "force": {
              "type": "boolean",
              "default": false,
              "description": "Bypass the recent-snapshot dedup. Without it the call can return 200 with deduped: true and skippedReason: \"recent_snapshot\", meaning nothing was refreshed. A forced refresh consumes the manual-refresh cooldown slot (6 h connected / 24 h public); check canRefreshAccountAnalytics first."
            },
            "includePosts": {
              "type": "boolean",
              "default": true
            },
            "includeComments": {
              "type": "boolean",
              "default": false,
              "description": "Only takes effect when force is true AND includePosts is not false AND the workspace holds the full analytics tier. The two conditions you control are enforced: sending it without force, or with includePosts false, fails with INVALID_FIELD for MCP callers and is reported for direct REST callers. The tier condition, which you cannot control, is reported on the response as applied.include_comments with applied.include_comments_dropped_reason and applied.analytics_tier. Read applied rather than assuming a 200 means comments were imported."
            },
            "forcePosts": {
              "type": "boolean",
              "default": false
            },
            "bootstrapPosts": {
              "type": "boolean",
              "default": false
            },
            "postLimit": {
              "type": "integer",
              "minimum": 1,
              "maximum": 60,
              "default": 20
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Refresh account analytics",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_account_edit_request",
    "operationId": "getAccountEditRequest",
    "description": "Get active account edit request. Returns the account's profile edit requests, newest first, with their status and credit cost. Only one request can be open per account at a time, so check here before calling createAccountEditRequest.",
    "method": "GET",
    "path": "/accounts/{id}/edit-request",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get active account edit request",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_create_account_edit_request",
    "operationId": "createAccountEditRequest",
    "description": "Request profile edits for a delivered account. Requests profile changes on an account that is already delivered and debits 8 credits. This is the ONLY way to change a delivered account's public username, visible name, biography, picture or link-in-bio: addEditSlots is unrelated (it buys video-editing slots) and configureBundleAccount only works before the account is delivered. Besides the username and visible name, supply at least one of requested_biography, requested_profile_picture_url or requested_link_in_bio — a request that changes nothing else is rejected. Only one request can be open per account at a time (409 otherwise); check getAccountEditRequest first. Active TokPortal Coverage and a routable active account manager are required. TokPortal uses the account's current active manager, then its still-active manager relationship, then eligible non-cancelled order history. Completed bundles remain eligible without a delivery-age limit; cancelled orders are never restored. Assignment, debit, and task creation are atomic, so an unavailable manager never costs credits. The task appears directly in that manager's calendar.",
    "method": "POST",
    "path": "/accounts/{id}/edit-request",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "body": {
          "type": "object",
          "required": [
            "requested_username",
            "requested_visible_name"
          ],
          "properties": {
            "requested_username": {
              "type": "string",
              "minLength": 1,
              "maxLength": 24,
              "description": "Requested username. Always required, even when it is unchanged."
            },
            "requested_visible_name": {
              "type": "string",
              "minLength": 1,
              "maxLength": 30,
              "description": "Requested display name. Always required, even when it is unchanged."
            },
            "requested_biography": {
              "type": "string",
              "maxLength": 150,
              "description": "Requested biography. The enforced limit is platform-dependent: 150 characters on Instagram, 80 on every other platform."
            },
            "requested_profile_picture_url": {
              "type": "string",
              "description": "Public image URL, or the storage_path returned by the image upload tools (not public_url)."
            },
            "requested_link_in_bio": {
              "type": "string",
              "format": "uri"
            }
          },
          "anyOf": [
            {
              "required": [
                "requested_biography"
              ]
            },
            {
              "required": [
                "requested_profile_picture_url"
              ]
            },
            {
              "required": [
                "requested_link_in_bio"
              ]
            }
          ],
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Request profile edits for a delivered account",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_rewarm_account",
    "operationId": "rewarmAccount",
    "description": "Order Advanced Niche Warming (rewarm) on a delivered account. Starts an Advanced Niche Warming session on a saved account that is already delivered: for each provided term the manager screen-records a session that opens on the account profile (handle visible), searches the term on the account's platform, watches videos from the results, engages with them (likes/saves) and leaves a comment. Every recording is verified before completion. The standard rate is 5 credits per term, charged per target and never per day (3-30 terms, multiples of 3), with a 15-credit minimum; GET /credit-costs returns the effective rate. Once the session has tasks it is NEVER refunded, so confirm the total with the user before calling. Call listAccountWarmingSessions first: only one session can be active per account and a second one is rejected with 409 REWARM_ALREADY_ACTIVE. Requires active TokPortal Coverage, a routable active account manager backed by a non-cancelled support order, TikTok or Instagram, and no already-active warming session. A completed bundle remains eligible. Terms are split evenly over 3 calendar days in the manager's timezone; earlier-day tasks remain available until completed and sessions with tasks do not expire.",
    "method": "POST",
    "path": "/accounts/{id}/rewarm",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "body": {
          "type": "object",
          "required": [
            "search_terms"
          ],
          "properties": {
            "search_terms": {
              "type": "array",
              "minItems": 3,
              "maxItems": 30,
              "x-item-count-multiple-of": 3,
              "items": {
                "type": "string",
                "minLength": 2,
                "maxLength": 50
              },
              "description": "3-30 search terms, and the count MUST be a multiple of 3 (3, 6, 9 … 30), each 2-50 characters. The standard rate is 5 credits per term (per target, never per day); GET /credit-costs returns the effective rate. For each term the manager screen-records a session that opens on the account profile, searches the term, watches videos from the results, engages with them (likes/saves) and leaves a comment. Every recording is verified before the manager is paid."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Order Advanced Niche Warming (rewarm) on a delivered account",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_configure_bundle_warming_terms",
    "operationId": "configureBundleWarmingTerms",
    "description": "Configure the niche targets of a count-only Advanced Niche Warming purchase. Only for a bundle created with advanced_warming_terms_count (deferred targets). To warm an account that is already delivered, use rewarmAccount instead; this endpoint answers 404 WARMING_SESSION_NOT_FOUND when there is no count-only purchase to configure. Must provide EXACTLY the purchased number of targets. One-shot: once configured the targets cannot be changed. Unlike PUT /bundles/{id}/account, this stays available at any account status after the manager accepted the mission or submitted the account, in which case the warming session starts immediately. Requires active TokPortal Coverage on the resolved saved account, or permanent grandfathering: a due period renews automatically at the account's stored rate immediately before execution, and nothing starts if it cannot renew. See getAccountManagedSubscription. A new account that has not produced a saved account yet remains configurable before delivery.",
    "method": "PUT",
    "path": "/bundles/{id}/warming-terms",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Bundle ID."
        },
        "body": {
          "type": "object",
          "required": [
            "advanced_warming_terms"
          ],
          "properties": {
            "advanced_warming_terms": {
              "type": "array",
              "minItems": 3,
              "maxItems": 30,
              "x-item-count-multiple-of": 3,
              "items": {
                "type": "string",
                "minLength": 2,
                "maxLength": 50
              },
              "description": "The niche targets for a count-only Advanced Niche Warming purchase. Must contain EXACTLY the purchased number of targets (advanced_warming_terms_count at creation), each 2-50 characters. One-shot: once set they cannot be changed. This works at any account status, and the warming session starts immediately when the manager already holds the order."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Configure the niche targets of a count-only Advanced Niche Warming purchase",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_account_warming_sessions",
    "operationId": "listAccountWarmingSessions",
    "description": "List Advanced Niche Warming sessions for an account. Lists Advanced Niche Warming sessions (newest first) for a saved account you own, including per-term tasks, per-term reports, proof links, and the aggregated session report when completed. Tasks unlock over 3 calendar days in the manager's timezone and, once created, do not expire.",
    "method": "GET",
    "path": "/accounts/{id}/warming-sessions",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "List Advanced Niche Warming sessions for an account",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_warming_session",
    "operationId": "getWarmingSession",
    "description": "Get an Advanced Niche Warming session. Returns one Advanced Niche Warming session you own: status, per-term tasks (with 3-calendar-day dispatch in the manager's timezone, verification status, client report and proof video link), and the aggregated report on completion. Created tasks remain open until completed; they do not expire.",
    "method": "GET",
    "path": "/warming-sessions/{id}",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Warming session ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get an Advanced Niche Warming session",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_generate_warming_terms",
    "operationId": "generateWarmingTerms",
    "description": "Generate Advanced Niche Warming search terms. Generates platform-appropriate Advanced Niche Warming search terms (niche targets) from a free-text niche description (max 1000 characters). This is free and no credits are charged. Call it before buying warming rather than inventing terms: pass the result to advanced_warming_terms (bundle creation or PUT /bundles/{id}/warming-terms deferred configuration) or to search_terms (rewarmAccount).",
    "method": "POST",
    "path": "/warming/generate-terms",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "required": [
            "text",
            "platform",
            "count"
          ],
          "properties": {
            "text": {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000,
              "description": "Free-text description of the account's niche/brand (max 1000 characters). Terms are generated in the same language."
            },
            "platform": {
              "type": "string",
              "enum": [
                "tiktok",
                "instagram"
              ],
              "description": "Platform the terms will be searched on."
            },
            "count": {
              "type": "integer",
              "minimum": 3,
              "maximum": 30,
              "multipleOf": 3,
              "x-value-multiple-of": 3,
              "description": "Desired number of terms: 3-30, must be a multiple of 3."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Generate Advanced Niche Warming search terms",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_webhook_events",
    "operationId": "listWebhookEvents",
    "description": "List webhook event catalog. Returns the supported webhook event types with, for each one, its description, exact trigger condition, payload schema and an example payload, plus the delivery envelope and signature scheme. Read it before subscribing: several names are counter-intuitive — account.published fires when you publish the order, not when the account is delivered (that is account.in_review), and warming.session_started is not emitted for warming whose terms were set at bundle creation. This endpoint is public so teams can inspect webhook contracts before creating an API key.",
    "method": "GET",
    "path": "/webhooks/events",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {},
      "additionalProperties": false
    },
    "annotations": {
      "title": "List webhook event catalog",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_webhook_endpoints",
    "operationId": "listWebhookEndpoints",
    "description": "List webhook endpoints. Lists your webhook endpoints with their subscribed events and enabled state. Signing secrets are never returned here — only once, at creation.",
    "method": "GET",
    "path": "/webhooks",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "page": {
          "type": "integer",
          "minimum": 1,
          "default": 1,
          "description": "Page number."
        },
        "per_page": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 25,
          "description": "Items per page."
        },
        "enabled": {
          "type": "boolean",
          "description": "Filter by enabled state."
        },
        "event": {
          "type": "string",
          "description": "Filter endpoints subscribed to an event."
        }
      },
      "additionalProperties": false
    },
    "annotations": {
      "title": "List webhook endpoints",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_create_webhook_endpoint",
    "operationId": "createWebhookEndpoint",
    "description": "Create a webhook endpoint. Creates a webhook endpoint and returns its signing secret once — store it, because a lost secret can only be replaced by deleting the endpoint and creating a new one. Call listWebhookEvents before choosing `events`: it returns the description, trigger condition and payload schema of each event, and several names are counter-intuitive. In particular account.published fires when YOU publish the order, not when the account is delivered — the delivery signal is account.in_review, and account.finalized fires when the account review is approved. Do not send Idempotency-Key. The successful response contains a secret and is never stored in the replay ledger. A request with the header is rejected with IDEMPOTENCY_KEY_NOT_ALLOWED_FOR_SENSITIVE_RESPONSE (400) before any ledger claim or operation execution.",
    "method": "POST",
    "path": "/webhooks",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "required": [
            "url",
            "events"
          ],
          "properties": {
            "url": {
              "type": "string",
              "format": "uri",
              "maxLength": 2000
            },
            "events": {
              "type": "array",
              "minItems": 1,
              "maxItems": 50,
              "items": {
                "type": "string",
                "enum": [
                  "webhook.test",
                  "account.connection.connected",
                  "account.connection.disconnected",
                  "account.connection.removed",
                  "account.business_setup.requested",
                  "account.business_setup.updated",
                  "account.business_setup.completed",
                  "inbox.comment.received",
                  "inbox.message.received",
                  "inbox.comment.reply.updated",
                  "bundle.created",
                  "bundle.published",
                  "bundle.cancelled",
                  "bundle.archived",
                  "account.configured",
                  "account.published",
                  "account.in_review",
                  "account.pending_corrections",
                  "account.finalized",
                  "account.remade",
                  "account.banned",
                  "account.ban_appeal.submitted",
                  "account.ban_appeal.resolved",
                  "account.ban_resolution.decided",
                  "video.configured",
                  "video.in_review",
                  "video.published",
                  "video.pending_corrections",
                  "video.finalized",
                  "video.not_recommended",
                  "video.ai_labeled",
                  "video.sound_restricted",
                  "account.distribution_warning",
                  "warming.session_started",
                  "warming.term_verified",
                  "warming.session_completed",
                  "subscription.renewed",
                  "subscription.lapsed",
                  "subscription.cancelled",
                  "subscription.reactivated",
                  "subscription.ended",
                  "account.revealed",
                  "credits.restored"
                ]
              },
              "description": "Call listWebhookEvents for the description, trigger condition and payload schema of every event. Note in particular: account.published fires when YOU publish the order, NOT when the account is delivered — the delivery signal is account.in_review, and account.finalized fires when the account review is approved. warming.session_started is not emitted for warming whose terms were set at bundle creation."
            },
            "description": {
              "type": "string",
              "maxLength": 500
            },
            "enabled": {
              "type": "boolean",
              "default": true
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Create a webhook endpoint",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_webhook_endpoint",
    "operationId": "getWebhookEndpoint",
    "description": "Get a webhook endpoint. Returns one webhook endpoint's URL, subscribed events and enabled state. The signing secret is not returned; if you lost it, delete this endpoint and create a replacement.",
    "method": "GET",
    "path": "/webhooks/{id}",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Webhook endpoint ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get a webhook endpoint",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_update_webhook_endpoint",
    "operationId": "updateWebhookEndpoint",
    "description": "Update a webhook endpoint. Changes an endpoint's URL, subscribed events, description or enabled state. The signing secret is unchanged and is never re-returned. Call listWebhookEvents for the meaning, trigger condition and payload of each event type before changing the subscription list.",
    "method": "PATCH",
    "path": "/webhooks/{id}",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Webhook endpoint ID."
        },
        "body": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "format": "uri",
              "maxLength": 2000
            },
            "events": {
              "type": "array",
              "minItems": 1,
              "maxItems": 50,
              "items": {
                "type": "string",
                "enum": [
                  "webhook.test",
                  "account.connection.connected",
                  "account.connection.disconnected",
                  "account.connection.removed",
                  "account.business_setup.requested",
                  "account.business_setup.updated",
                  "account.business_setup.completed",
                  "inbox.comment.received",
                  "inbox.message.received",
                  "inbox.comment.reply.updated",
                  "bundle.created",
                  "bundle.published",
                  "bundle.cancelled",
                  "bundle.archived",
                  "account.configured",
                  "account.published",
                  "account.in_review",
                  "account.pending_corrections",
                  "account.finalized",
                  "account.remade",
                  "account.banned",
                  "account.ban_appeal.submitted",
                  "account.ban_appeal.resolved",
                  "account.ban_resolution.decided",
                  "video.configured",
                  "video.in_review",
                  "video.published",
                  "video.pending_corrections",
                  "video.finalized",
                  "video.not_recommended",
                  "video.ai_labeled",
                  "video.sound_restricted",
                  "account.distribution_warning",
                  "warming.session_started",
                  "warming.term_verified",
                  "warming.session_completed",
                  "subscription.renewed",
                  "subscription.lapsed",
                  "subscription.cancelled",
                  "subscription.reactivated",
                  "subscription.ended",
                  "account.revealed",
                  "credits.restored"
                ]
              }
            },
            "description": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 500
            },
            "enabled": {
              "type": "boolean"
            }
          },
          "minProperties": 1,
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Update a webhook endpoint",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_delete_webhook_endpoint",
    "operationId": "deleteWebhookEndpoint",
    "description": "Delete a webhook endpoint. Permanently deletes a webhook endpoint and invalidates its signing secret. Events that could not be delivered are not queued for a replacement endpoint.",
    "method": "DELETE",
    "path": "/webhooks/{id}",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Webhook endpoint ID."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Delete a webhook endpoint",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_webhook_deliveries",
    "operationId": "listWebhookDeliveries",
    "description": "List webhook deliveries. Lists delivery attempts for one endpoint with the response status and body. Deliveries are at-least-once and retries reuse the same `TokPortal-Event-Id` — deduplicate on that id, not on the delivery id.",
    "method": "GET",
    "path": "/webhooks/{id}/deliveries",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Webhook endpoint ID."
        },
        "page": {
          "type": "integer",
          "minimum": 1,
          "default": 1,
          "description": "Page number."
        },
        "per_page": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 25,
          "description": "Items per page."
        },
        "event_type": {
          "type": "string",
          "description": "Filter by event type."
        },
        "success": {
          "type": "boolean",
          "description": "Filter by delivery success."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "List webhook deliveries",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_retry_webhook_delivery",
    "operationId": "retryWebhookDelivery",
    "description": "Retry a webhook delivery. Resends the stored webhook payload to the endpoint's current URL with a fresh TokPortal-Signature header. The event ID is preserved so receivers can keep idempotent processing.",
    "method": "POST",
    "path": "/webhooks/{id}/deliveries/{delivery_id}/retry",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Webhook endpoint ID."
        },
        "delivery_id": {
          "type": "string",
          "format": "uuid",
          "description": "Webhook delivery ID."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "delivery_id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Retry a webhook delivery",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_test_webhook_endpoint",
    "operationId": "testWebhookEndpoint",
    "description": "Send a test webhook. Sends a signed webhook.test event to the endpoint and records the delivery result.",
    "method": "POST",
    "path": "/webhooks/{id}/test",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Webhook endpoint ID."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Send a test webhook",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_upload_video",
    "operationId": "uploadVideo",
    "description": "Create a video upload URL. Returns a short-lived presigned upload capability for a video file. The `public_url` it returns is what goes into `video_url` on configureBundleVideo — images are the opposite and require the upload response's `storage_path`. Do not send Idempotency-Key. The successful response contains a secret and is never stored in the replay ledger. A request with the header is rejected with IDEMPOTENCY_KEY_NOT_ALLOWED_FOR_SENSITIVE_RESPONSE (400) before any ledger claim or operation execution.",
    "method": "POST",
    "path": "/upload/video",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "required": [
            "filename",
            "bundle_id"
          ],
          "properties": {
            "filename": {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            "content_type": {
              "type": "string",
              "default": "video/mp4"
            },
            "bundle_id": {
              "type": "string",
              "format": "uuid"
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Create a video upload URL",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_upload_video_direct",
    "operationId": "uploadVideoDirect",
    "description": "Upload a video file directly. Uploads multipart/form-data directly through TokPortal and returns the public video URL, which goes straight into `video_url` on configureBundleVideo.",
    "method": "POST",
    "path": "/upload/video/direct",
    "requestContentType": "multipart/form-data",
    "multipartFields": [
      {
        "name": "file",
        "required": true,
        "binary": true,
        "schema": {
          "type": "string",
          "format": "binary"
        }
      },
      {
        "name": "bundle_id",
        "required": true,
        "binary": false,
        "schema": {
          "type": "string",
          "format": "uuid"
        }
      }
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "file_path": {
          "type": "string",
          "description": "Local path to upload for multipart field file."
        },
        "bundle_id": {
          "type": "string",
          "format": "uuid",
          "description": "Multipart form field bundle_id."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "file_path",
        "bundle_id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Upload a video file directly",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_upload_image",
    "operationId": "uploadImage",
    "description": "Create an image upload URL. Returns a short-lived signed upload URL and upload token for an image. Use the returned `storage_path` — NOT `public_url` — for `carousel_images` and `profile_picture_url`; videos are the opposite, uploadVideo returns a `public_url` that goes straight into `video_url`. The stored object's extension comes from the declared `content_type` (image/png stores a .png), and only falls back to the extension in `filename` when the content type is unknown, so send the content type that matches the bytes you are about to PUT. `storage_path` on the response is the key the object is actually stored under — read it rather than rebuilding it from `filename`. Do not send Idempotency-Key. The successful response contains a secret and is never stored in the replay ledger. A request with the header is rejected with IDEMPOTENCY_KEY_NOT_ALLOWED_FOR_SENSITIVE_RESPONSE (400) before any ledger claim or operation execution.",
    "method": "POST",
    "path": "/upload/image",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "required": [
            "filename",
            "content_type",
            "bundle_id"
          ],
          "properties": {
            "filename": {
              "type": "string",
              "minLength": 1,
              "maxLength": 200,
              "example": "profile.png",
              "description": "Original file name. Used only as a fallback for the stored object's extension when content_type is not a recognised image type; content_type is what normally names the object. The response's storage_path is the authoritative key."
            },
            "content_type": {
              "type": "string",
              "pattern": "^image/(jpeg|jpg|png|webp|gif)$",
              "example": "image/png",
              "description": "Allowed image MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif. This value determines the stored object's extension (image/png stores a .png); filename is only the fallback when the type is unrecognised. Send the type that matches the bytes you are about to PUT, and use it as the Content-Type of that PUT. Read storage_path on the response for the key the object actually landed under."
            },
            "bundle_id": {
              "type": "string",
              "format": "uuid"
            },
            "purpose": {
              "type": "string",
              "enum": [
                "carousel",
                "profile_picture"
              ],
              "default": "carousel",
              "description": "Which bucket the image is stored in. Use the response's storage_path (not public_url) for carousel_images and profile_picture_url."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Create an image upload URL",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_upload_image_direct",
    "operationId": "uploadImageDirect",
    "description": "Upload an image file directly. Uploads multipart/form-data directly through TokPortal and returns storage details. Use the returned `storage_path` — NOT `public_url` — for `carousel_images` and `profile_picture_url`. HEIF/HEIC may be converted to JPEG. `purpose` is validated like it is on the JSON upload endpoints: an explicit value other than `carousel` or `profile_picture` is refused with INVALID_FIELD for MCP callers and reported in `meta.ignored_fields` for direct REST callers — it is no longer quietly rounded down to `carousel`. Omitting `purpose` still means `carousel`, which is the documented default. Confirm the destination with the returned `bucket`.",
    "method": "POST",
    "path": "/upload/image/direct",
    "requestContentType": "multipart/form-data",
    "multipartFields": [
      {
        "name": "file",
        "required": true,
        "binary": true,
        "schema": {
          "type": "string",
          "format": "binary"
        }
      },
      {
        "name": "bundle_id",
        "required": true,
        "binary": false,
        "schema": {
          "type": "string",
          "format": "uuid"
        }
      },
      {
        "name": "purpose",
        "required": false,
        "binary": false,
        "schema": {
          "type": "string",
          "enum": [
            "carousel",
            "profile_picture"
          ],
          "default": "carousel"
        }
      }
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "file_path": {
          "type": "string",
          "description": "Local path to upload for multipart field file."
        },
        "bundle_id": {
          "type": "string",
          "format": "uuid",
          "description": "Multipart form field bundle_id."
        },
        "purpose": {
          "type": "string",
          "enum": [
            "carousel",
            "profile_picture"
          ],
          "default": "carousel",
          "description": "Multipart form field purpose."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "file_path",
        "bundle_id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Upload an image file directly",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_upload_image_from_url",
    "operationId": "uploadImageFromUrl",
    "description": "Import an image from URL. Fetches a public direct image URL and stores it permanently in TokPortal storage. Use the returned `storage_path` — NOT `public_url` — for `carousel_images` and `profile_picture_url`.",
    "method": "POST",
    "path": "/upload/image/from-url",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "required": [
            "url",
            "bundle_id"
          ],
          "properties": {
            "url": {
              "type": "string",
              "format": "uri",
              "description": "Public direct image URL."
            },
            "bundle_id": {
              "type": "string",
              "format": "uuid"
            },
            "purpose": {
              "type": "string",
              "enum": [
                "carousel",
                "profile_picture"
              ],
              "default": "carousel"
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Import an image from URL",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_analytics_dashboard",
    "operationId": "getAnalyticsDashboard",
    "description": "Get analytics dashboard. Portfolio-level analytics across your accounts for a date range. Call getAnalyticsContract before interpreting these numbers: top-line values are lifetime per-post totals, connected-account values are rolling windows, the two intentionally do not mirror each other, and your access tier may redact metrics — a missing field means unavailable, never zero.",
    "method": "GET",
    "path": "/analytics",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "workspace": {
          "type": "string",
          "format": "uuid",
          "description": "query parameter workspace"
        },
        "platform": {
          "type": "string",
          "enum": [
            "tiktok",
            "instagram"
          ],
          "description": "Repeatable platform filter."
        },
        "country": {
          "type": "string",
          "description": "Repeatable country filter."
        },
        "account": {
          "type": "string",
          "description": "Repeatable account filter."
        },
        "from": {
          "type": "string",
          "format": "date",
          "description": "query parameter from"
        },
        "to": {
          "type": "string",
          "format": "date",
          "description": "query parameter to"
        }
      },
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get analytics dashboard",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_analytics_contract",
    "operationId": "getAnalyticsContract",
    "description": "Get analytics data contract. Returns the Analytics v2 contract, current access payload, metric semantics, freshness targets, and redaction rules.",
    "method": "GET",
    "path": "/analytics/contract",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {},
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get analytics data contract",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_export_analytics_videos",
    "operationId": "exportAnalyticsVideos",
    "description": "Export analytics videos CSV. CSV export of post-level analytics for the selected accounts and date range. Requires the Creator tier or above. Call getAnalyticsContract before interpreting these numbers: top-line values are lifetime per-post totals, connected-account values are rolling windows, the two intentionally do not mirror each other, and your access tier may redact metrics — a missing field means unavailable, never zero.",
    "method": "GET",
    "path": "/analytics/export/videos",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "account": {
          "type": "string",
          "description": "Repeatable account filter."
        },
        "workspace": {
          "type": "string",
          "format": "uuid",
          "description": "query parameter workspace"
        },
        "platform": {
          "type": "string",
          "enum": [
            "tiktok",
            "instagram"
          ],
          "description": "Repeatable platform filter."
        },
        "country": {
          "type": "string",
          "description": "Repeatable country filter."
        },
        "q": {
          "type": "string",
          "description": "Search query."
        },
        "from": {
          "type": "string",
          "format": "date",
          "description": "query parameter from"
        },
        "to": {
          "type": "string",
          "format": "date",
          "description": "query parameter to"
        }
      },
      "additionalProperties": false
    },
    "annotations": {
      "title": "Export analytics videos CSV",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_create_analytics_report",
    "operationId": "createAnalyticsReport",
    "description": "Create analytics web report. Creates a shareable Analytics v2 web report and returns its bearer-like access token and URL. The body is validated before anything is rendered, so a malformed request fails with INVALID_FIELD instead of quietly producing a wrong report for your end client. `from` and `to` are calendar dates in YYYY-MM-DD; a full ISO timestamp is accepted and truncated to its date, and anything else is refused rather than treated as \"no filter\" (which used to widen the report to the account's entire history). An inverted window (`from` after `to`) is refused too. `template` is a published enum — executive, agency, creator, minimal, growth, board — and an unknown value is refused instead of becoming executive. `brandAccent` must be #rrggbb (#rgb is expanded); named colours, rgb() and 8-digit hex are refused instead of being replaced by the TokPortal default. White-labelling still depends on entitlement: `brandName` and `brandAccent` only apply on the full analytics tier with a Farmer plan, and are otherwise reset. The response carries `applied` — the template, brand name, brand accent and the exact date window the report covers — plus `canBrand`, so read those back instead of inspecting the rendered report. Do not send Idempotency-Key. The successful response contains a secret and is never stored in the replay ledger. A request with the header is rejected with IDEMPOTENCY_KEY_NOT_ALLOWED_FOR_SENSITIVE_RESPONSE (400) before any ledger claim or operation execution.",
    "method": "POST",
    "path": "/analytics/export/reports",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "properties": {
            "title": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 120,
              "description": "Report title. 120 characters, the real stored limit."
            },
            "template": {
              "type": [
                "string",
                "null"
              ],
              "enum": [
                "executive",
                "agency",
                "creator",
                "minimal",
                "growth",
                "board",
                null
              ],
              "description": "Report layout. Any other value is rejected with INVALID_FIELD rather than silently becoming executive. The applied template is echoed as applied.template on the JSON response and as X-TokPortal-Report-Template on the HTML export."
            },
            "brandName": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 80,
              "description": "White-label brand name (80 characters, the real stored limit). Applied only on the full analytics tier with a Farmer plan; on every other plan it is reset to TokPortal, and the response says so through applied.brand_name and canBrand — check them before promising a client a white-labelled document."
            },
            "brandAccent": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 40,
              "description": "White-label accent colour, #rrggbb (a #rgb short form is expanded). Named colours, rgb() and 8-digit hex are rejected with INVALID_FIELD instead of silently becoming the TokPortal default. Like brandName it only applies on a Farmer plan at the full tier; read applied.brand_accent back."
            },
            "accountIds": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "uuid"
              }
            },
            "workspaceId": {
              "type": [
                "string",
                "null"
              ],
              "format": "uuid"
            },
            "platforms": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "tiktok",
                  "instagram"
                ]
              }
            },
            "countries": {
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 2,
                "maxLength": 5
              }
            },
            "query": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 120,
              "description": "Free-text filter. 120 characters, the real stored limit."
            },
            "from": {
              "type": [
                "string",
                "null"
              ],
              "format": "date",
              "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
              "description": "Inclusive start date, YYYY-MM-DD. A full ISO timestamp is accepted and truncated to its date; anything else is rejected with INVALID_FIELD rather than silently treated as no filter (which used to widen the report to the account's entire history). Must not be after `to`. The window actually applied comes back as applied.filters.from."
            },
            "to": {
              "type": [
                "string",
                "null"
              ],
              "format": "date",
              "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
              "description": "Inclusive end date, YYYY-MM-DD, same parsing as `from`. Echoed as applied.filters.to."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Create analytics web report",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_export_analytics_report_html",
    "operationId": "exportAnalyticsReportHtml",
    "description": "Export analytics report HTML. Creates a standalone downloadable HTML analytics report from the same body as createAnalyticsReport, and validates it identically: `from` and `to` are YYYY-MM-DD (a full ISO timestamp is truncated to its date, anything else is refused with INVALID_FIELD rather than treated as no filter), an inverted window is refused, `template` is the published enum (executive, agency, creator, minimal, growth, board) and an unknown value is refused instead of becoming executive, and `brandAccent` must be #rrggbb or #rgb. The body of the response is the HTML document itself, so what was applied travels in headers: X-TokPortal-Report-Template, X-TokPortal-Report-Can-Brand, X-TokPortal-Report-Brand-Name, X-TokPortal-Report-From, X-TokPortal-Report-To, alongside X-TokPortal-Export-Rows and X-TokPortal-Export-Accounts. Read those headers to confirm the window and the branding actually used.",
    "method": "POST",
    "path": "/analytics/export/reports/html",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "properties": {
            "title": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 120,
              "description": "Report title. 120 characters, the real stored limit."
            },
            "template": {
              "type": [
                "string",
                "null"
              ],
              "enum": [
                "executive",
                "agency",
                "creator",
                "minimal",
                "growth",
                "board",
                null
              ],
              "description": "Report layout. Any other value is rejected with INVALID_FIELD rather than silently becoming executive. The applied template is echoed as applied.template on the JSON response and as X-TokPortal-Report-Template on the HTML export."
            },
            "brandName": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 80,
              "description": "White-label brand name (80 characters, the real stored limit). Applied only on the full analytics tier with a Farmer plan; on every other plan it is reset to TokPortal, and the response says so through applied.brand_name and canBrand — check them before promising a client a white-labelled document."
            },
            "brandAccent": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 40,
              "description": "White-label accent colour, #rrggbb (a #rgb short form is expanded). Named colours, rgb() and 8-digit hex are rejected with INVALID_FIELD instead of silently becoming the TokPortal default. Like brandName it only applies on a Farmer plan at the full tier; read applied.brand_accent back."
            },
            "accountIds": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "uuid"
              }
            },
            "workspaceId": {
              "type": [
                "string",
                "null"
              ],
              "format": "uuid"
            },
            "platforms": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "tiktok",
                  "instagram"
                ]
              }
            },
            "countries": {
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 2,
                "maxLength": 5
              }
            },
            "query": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 120,
              "description": "Free-text filter. 120 characters, the real stored limit."
            },
            "from": {
              "type": [
                "string",
                "null"
              ],
              "format": "date",
              "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
              "description": "Inclusive start date, YYYY-MM-DD. A full ISO timestamp is accepted and truncated to its date; anything else is rejected with INVALID_FIELD rather than silently treated as no filter (which used to widen the report to the account's entire history). Must not be after `to`. The window actually applied comes back as applied.filters.from."
            },
            "to": {
              "type": [
                "string",
                "null"
              ],
              "format": "date",
              "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
              "description": "Inclusive end date, YYYY-MM-DD, same parsing as `from`. Echoed as applied.filters.to."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Export analytics report HTML",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_analytics_series",
    "operationId": "getAnalyticsSeries",
    "description": "Get analytics time series. Daily or weekly time series for one metric, built from stored snapshots and date-scoped rollups — never a live fetch. `mode` selects cumulative totals, per-period gains, or raw snapshot values. Series are excluded on the Starter tier. Call getAnalyticsContract before interpreting these numbers: top-line values are lifetime per-post totals, connected-account values are rolling windows, the two intentionally do not mirror each other, and your access tier may redact metrics — a missing field means unavailable, never zero.",
    "method": "GET",
    "path": "/analytics/series",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "metric": {
          "type": "string",
          "enum": [
            "views",
            "likes",
            "comments",
            "shares",
            "followers"
          ],
          "default": "views",
          "description": "query parameter metric"
        },
        "granularity": {
          "type": "string",
          "enum": [
            "day",
            "week"
          ],
          "default": "day",
          "description": "query parameter granularity"
        },
        "mode": {
          "type": "string",
          "enum": [
            "cumulative",
            "gained",
            "snapshot"
          ],
          "default": "cumulative",
          "description": "query parameter mode"
        },
        "account": {
          "type": "string",
          "description": "Repeatable account filter."
        },
        "from": {
          "type": "string",
          "format": "date",
          "description": "query parameter from"
        },
        "to": {
          "type": "string",
          "format": "date",
          "description": "query parameter to"
        }
      },
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get analytics time series",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_analytics_account_insights",
    "operationId": "getAnalyticsAccountInsights",
    "description": "Get connected Instagram or TikTok insights. Read stored account-period insights, daily follower/reach history and per-post watch time, completion, traffic and audience data. Requires Creator or above; fields remain tier-aware. available=false and connected_analytics=null when no recently verified active Zernio connection exists, including after disconnection. Never starts a provider refresh. Account metrics use the explicit period; post metrics are lifetime observations. Missing metrics are omitted, not zero; completion_rate is 0..1, traffic_sources and audience_types are 0..100 percentages, watch times are seconds. Instagram demographics need an eligible audience (normally 100+ followers). Detailed metrics may lag 24–48 hours. The same connected_analytics block appears on getAnalyticsAccount.",
    "method": "GET",
    "path": "/analytics/accounts/{id}/insights",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get connected Instagram or TikTok insights",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_analytics_account",
    "operationId": "getAnalyticsAccount",
    "description": "Get account analytics drilldown. Analytics v2 drilldown for one account: current metrics, top posts and demographics. Includes optional connected_analytics with account-period insights and post depth only while a Zernio connection has recent active identity proof; absent for disconnected accounts and Starter plans. getAnalyticsAccountInsights returns this block alone. This is the current endpoint; getAccountAnalytics is the older compatibility shape. Call getAnalyticsContract before interpreting numbers: top-line values are lifetime per-post totals, connected-account values are rolling windows, and your access tier may redact metrics. Missing fields mean unavailable, never zero.",
    "method": "GET",
    "path": "/analytics/accounts/{id}",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get account analytics drilldown",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_refresh_analytics_account",
    "operationId": "refreshAnalyticsAccount",
    "description": "Refresh analytics account. Refreshes an owner-scoped account through Analytics v2. Comment collection is gated on three conditions: includeComments only runs when force is true, includePosts is not false, and the workspace holds the full analytics tier. The two you control are refusals, not silence — includeComments without force, or with includePosts false, fails with INVALID_FIELD for MCP callers and is reported for direct REST callers. The one you cannot control, the analytics tier, comes back on the response as applied.include_comments plus applied.include_comments_dropped_reason. The call can still return 200 with deduped: true and skippedReason: \"recent_snapshot\", which means nothing was refreshed. Check canRefreshAccountAnalytics first: a forced retry consumes the manual-refresh cooldown slot and the next one is rejected with 429. Refresh is blocked for revealed/detached, banned or inactive-Coverage accounts; permanently grandfathered accounts remain eligible.",
    "method": "POST",
    "path": "/analytics/accounts/{id}/refresh",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "body": {
          "type": "object",
          "properties": {
            "force": {
              "type": "boolean",
              "default": false,
              "description": "Bypass the recent-snapshot dedup. Without it the call can return 200 with deduped: true and skippedReason: \"recent_snapshot\", meaning nothing was refreshed. A forced refresh consumes the manual-refresh cooldown slot (6 h connected / 24 h public); check canRefreshAccountAnalytics first."
            },
            "includePosts": {
              "type": "boolean",
              "default": true
            },
            "includeComments": {
              "type": "boolean",
              "default": false,
              "description": "Only takes effect when force is true AND includePosts is not false AND the workspace holds the full analytics tier. The two conditions you control are enforced: sending it without force, or with includePosts false, fails with INVALID_FIELD for MCP callers and is reported for direct REST callers. The tier condition, which you cannot control, is reported on the response as applied.include_comments with applied.include_comments_dropped_reason and applied.analytics_tier. Read applied rather than assuming a 200 means comments were imported."
            },
            "forcePosts": {
              "type": "boolean",
              "default": false
            },
            "bootstrapPosts": {
              "type": "boolean",
              "default": false
            },
            "postLimit": {
              "type": "integer",
              "minimum": 1,
              "maximum": 60,
              "default": 20
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Refresh analytics account",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_analytics_account_raw_snapshots",
    "operationId": "listAnalyticsAccountRawSnapshots",
    "description": "List raw account analytics snapshots. Returns owner-scoped stored raw analytics payloads for a saved account. Full analytics tier only.",
    "method": "GET",
    "path": "/analytics/accounts/{id}/raw",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "source": {
          "type": "string",
          "enum": [
            "bundle_social",
            "apify",
            "manual"
          ],
          "description": "query parameter source"
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 30,
          "default": 5,
          "description": "query parameter limit"
        },
        "from": {
          "type": "string",
          "format": "date-time",
          "description": "query parameter from"
        },
        "to": {
          "type": "string",
          "format": "date-time",
          "description": "query parameter to"
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "List raw account analytics snapshots",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_account_analytics",
    "operationId": "getAccountAnalytics",
    "description": "Get account analytics compatibility view. Legacy compatibility view of one account's analytics, kept for older integrations. New code should call getAnalyticsAccount instead. Call getAnalyticsContract before interpreting these numbers: top-line values are lifetime per-post totals, connected-account values are rolling windows, the two intentionally do not mirror each other, and your access tier may redact metrics — a missing field means unavailable, never zero.",
    "method": "GET",
    "path": "/accounts/{id}/analytics",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get account analytics compatibility view",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_account_video_analytics",
    "operationId": "listAccountVideoAnalytics",
    "description": "List post analytics for an account. Post-level analytics for one account, sortable by views, likes, engagement rate or upload date. Values are lifetime per-post totals. Call getAnalyticsContract before interpreting these numbers: top-line values are lifetime per-post totals, connected-account values are rolling windows, the two intentionally do not mirror each other, and your access tier may redact metrics — a missing field means unavailable, never zero.",
    "method": "GET",
    "path": "/accounts/{id}/analytics/videos",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "page": {
          "type": "integer",
          "minimum": 1,
          "default": 1,
          "description": "Page number."
        },
        "per_page": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 25,
          "description": "Items per page."
        },
        "sort_by": {
          "type": "string",
          "enum": [
            "views",
            "likes",
            "engagement_rate",
            "upload_date"
          ],
          "default": "upload_date",
          "description": "query parameter sort_by"
        },
        "sort_order": {
          "type": "string",
          "enum": [
            "asc",
            "desc"
          ],
          "default": "desc",
          "description": "query parameter sort_order"
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "List post analytics for an account",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_video_analytics",
    "operationId": "getVideoAnalytics",
    "description": "Get single video analytics. Lifetime metrics for one tracked post. Interpret them with getAnalyticsContract: these are lifetime per-post totals and deliberately do not match the rolling-window figures shown for a connected account. Also returns `platform_signals` (not recommended, AI label, sound) and `signal_insights` (followers gained, audience split, impression sources, retention curve — Creator tier and above).",
    "method": "GET",
    "path": "/videos/{id}/analytics",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Video ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get single video analytics",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_create_video_ad_code_request",
    "operationId": "createVideoAdCodeRequest",
    "description": "Request an ad code (TikTok Spark Code / Instagram Partner Code) for a finalized video. Requests an ad code (TikTok Spark Code or Instagram Partner Code) for one finalized video and debits 7 credits, which are not refundable. The platform is resolved from the video itself and cannot be chosen. The video must be finalized on TikTok or Instagram with a live post link. Active TokPortal Coverage and a routable active account manager are required. TokPortal uses the account's current active manager, then its still-active manager relationship, then eligible non-cancelled order history. Completed bundles remain eligible without a delivery-age limit; cancelled orders are never restored. Assignment, debit, and task creation are atomic. Only one open request per video is allowed, so a request made on the wrong video cannot be replaced until it closes. Poll the GET endpoint to retrieve the code once the manager submits it.",
    "method": "POST",
    "path": "/videos/{id}/ad-code-request",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Video ID."
        },
        "body": {
          "type": "object",
          "properties": {
            "note": {
              "type": "string",
              "maxLength": 500,
              "description": "Optional note to your manager (e.g. the campaign this ad code is for)."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Request an ad code (TikTok Spark Code / Instagram Partner Code) for a finalized video",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_video_ad_code_request",
    "operationId": "getVideoAdCodeRequest",
    "description": "Get / poll the ad code for a video. Returns the latest ad code request for the video. The `code` field is null until the manager submits it (status `in_review`) or it is delivered (status `finalized`).",
    "method": "GET",
    "path": "/videos/{id}/ad-code-request",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Video ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get / poll the ad code for a video",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_comment_pulse",
    "operationId": "getCommentPulse",
    "description": "Get comment pulse analytics. Aggregated comment sentiment and themes across your posts, served from the analytics comment cache — never a live fetch. Full analytics tier only. Filters are not combinable: when `post` is supplied it takes precedence and `platform`, `country`, `account`, `workspace`, `from` and `to` are all ignored, and at most 12 post ids are sampled.",
    "method": "GET",
    "path": "/analytics/comments",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "platform": {
          "type": "string",
          "description": "query parameter platform"
        },
        "country": {
          "type": "string",
          "description": "query parameter country"
        },
        "account": {
          "type": "string",
          "description": "query parameter account"
        },
        "post": {
          "type": "string",
          "description": "query parameter post"
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 40,
          "default": 24,
          "description": "query parameter limit"
        },
        "postLimit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 10,
          "default": 6,
          "description": "query parameter postLimit"
        },
        "from": {
          "type": "string",
          "format": "date",
          "description": "query parameter from"
        },
        "to": {
          "type": "string",
          "format": "date",
          "description": "query parameter to"
        }
      },
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get comment pulse analytics",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_analytics_account_comments",
    "operationId": "listAnalyticsAccountComments",
    "description": "List comments for an account post. Returns cached comment text for one tracked post of an account. Full analytics tier only; this read never calls the platform live.",
    "method": "GET",
    "path": "/analytics/accounts/{id}/comments",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Saved account ID."
        },
        "trackedPostId": {
          "type": "string",
          "description": "query parameter trackedPostId"
        },
        "postId": {
          "type": "string",
          "description": "query parameter postId"
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 50,
          "default": 20,
          "description": "query parameter limit"
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "List comments for an account post",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_analytics_post_raw_snapshots",
    "operationId": "listAnalyticsPostRawSnapshots",
    "description": "List raw post analytics snapshots. Returns owner-scoped stored raw analytics payloads for a tracked post. Full analytics tier only.",
    "method": "GET",
    "path": "/analytics/posts/{id}/raw",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Tracked post ID."
        },
        "source": {
          "type": "string",
          "enum": [
            "bundle_social",
            "apify",
            "manual"
          ],
          "description": "query parameter source"
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 30,
          "default": 5,
          "description": "query parameter limit"
        },
        "from": {
          "type": "string",
          "format": "date-time",
          "description": "query parameter from"
        },
        "to": {
          "type": "string",
          "format": "date-time",
          "description": "query parameter to"
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "List raw post analytics snapshots",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_analytics_signals",
    "operationId": "listAnalyticsSignals",
    "description": "List posts flagged by the platform. Owner-scoped list of posted videos carrying a platform signal, newest first: TikTok `not_recommended` (Not For Feed / Not Recommended — the post stays online but is excluded from For You and typically sits at 0 views), `ai_label` (`creator` = declared at posting, `platform` = applied by TikTok moderation) and `sound_status` (`non_commercial` = cannot be promoted, `removed` = pulled for copyright, `muted` = Instagram). Each row carries `platform_signals` (the same object returned on every video by GET /bundles/{id}/videos) and, from the Creator tier, `signal_insights` (followers gained, new vs returning viewers, impression sources, retention curve). Signals are observed by a public check about 48 hours after posting and again after 7 days; `null` means not checked yet, never 'no'. Available on every analytics tier.",
    "method": "GET",
    "path": "/analytics/signals",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "signal": {
          "type": "string",
          "enum": [
            "not_recommended",
            "ai_label",
            "sound_status"
          ],
          "description": "Only posts carrying this signal. Omit for any signal."
        },
        "account": {
          "type": "string",
          "format": "uuid",
          "description": "Repeatable saved account filter."
        },
        "from": {
          "type": "string",
          "format": "date-time",
          "description": "Only signals updated after this instant."
        },
        "to": {
          "type": "string",
          "format": "date-time",
          "description": "Only signals updated before this instant."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 200,
          "default": 50,
          "description": "query parameter limit"
        },
        "offset": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "query parameter offset"
        }
      },
      "additionalProperties": false
    },
    "annotations": {
      "title": "List posts flagged by the platform",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_comment_tasks",
    "operationId": "listCommentTasks",
    "description": "List comment tasks. Lists owned comment tasks. execution_blocked and execution_block_reason identify tasks paused by inactive TokPortal Coverage; reads remain available while execution is paused.",
    "method": "GET",
    "path": "/comments",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "page": {
          "type": "integer",
          "minimum": 1,
          "default": 1,
          "description": "Page number."
        },
        "per_page": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 25,
          "description": "Items per page."
        },
        "status": {
          "type": "string",
          "description": "Filter by one status or a comma-separated list of statuses."
        },
        "saved_account_id": {
          "type": "string",
          "format": "uuid",
          "description": "Filter by a user-owned saved account ID."
        }
      },
      "additionalProperties": false
    },
    "annotations": {
      "title": "List comment tasks",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_create_comment_tasks",
    "operationId": "createCommentTasks",
    "description": "Create comment tasks. Creates one comment task or a partial-success batch of up to 200. Each accepted task costs 1 credit. The target is any public TikTok or Instagram video, including a third party's — that is the intended use — while the posting account must be one of your own delivered accounts and its platform must match the target's (COMMENT_PLATFORM_MISMATCH otherwise). Deduplicate locally on (saved_account_id, target URL, comment_text): two different Idempotency-Keys carrying the same comment bill twice. The saved account must be client-owned, manager-assigned, and allowed to execute tasks by TokPortal Coverage, unless it is permanently grandfathered. TokPortal locks and revalidates the account and Coverage before the accepted-task debit and all accepted inserts commit in one transaction. Rejected rows are never charged. Read credits_charged instead of calculating it from the request, and read meta.rejected_count and each row's reason rather than inferring success from the 201. Send an Idempotency-Key and reuse the same key, method, path, and body after an uncertain transport result so the completed response is replayed without a second charge.",
    "method": "POST",
    "path": "/comments",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "description": "JSON request body.",
          "oneOf": [
            {
              "type": "object",
              "required": [
                "saved_account_id",
                "comment_text"
              ],
              "properties": {
                "saved_account_id": {
                  "type": "string",
                  "format": "uuid",
                  "description": "Client-owned saved account that will post the comment. TokPortal Coverage must currently allow tasks, unless the account is permanently grandfathered."
                },
                "target_type": {
                  "type": "string",
                  "enum": [
                    "video",
                    "comment"
                  ],
                  "description": "Target type. 'video' (default) posts a comment under a video; 'comment' replies to a specific comment (TikTok only)."
                },
                "target_video_url": {
                  "type": "string",
                  "minLength": 1,
                  "description": "Required when target_type is 'video' (or omitted). Any public TikTok/Instagram video URL, including a third party's — that is the intended use. Its platform must match the posting account's platform (COMMENT_PLATFORM_MISMATCH otherwise)."
                },
                "target_comment_url": {
                  "type": "string",
                  "minLength": 1,
                  "description": "Required when target_type is 'comment'. TikTok comment deep-link (Share comment → Copy link); short or full form."
                },
                "comment_text": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 10000,
                  "description": "Exact text to post. The effective limit is 150 characters for TikTok and 2,200 for Instagram. Deduplicate locally on (saved_account_id, target URL, comment_text): two calls carrying the same comment under different Idempotency-Keys create two tasks and bill twice."
                },
                "brief_id": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "format": "uuid",
                  "description": "Optional comment brief owned by the same client."
                }
              },
              "additionalProperties": false
            },
            {
              "type": "object",
              "required": [
                "tasks"
              ],
              "properties": {
                "tasks": {
                  "type": "array",
                  "minItems": 1,
                  "maxItems": 200,
                  "items": {
                    "type": "object",
                    "required": [
                      "saved_account_id",
                      "comment_text"
                    ],
                    "properties": {
                      "saved_account_id": {
                        "type": "string",
                        "format": "uuid",
                        "description": "Client-owned saved account that will post the comment. TokPortal Coverage must currently allow tasks, unless the account is permanently grandfathered."
                      },
                      "target_type": {
                        "type": "string",
                        "enum": [
                          "video",
                          "comment"
                        ],
                        "description": "Target type. 'video' (default) posts a comment under a video; 'comment' replies to a specific comment (TikTok only)."
                      },
                      "target_video_url": {
                        "type": "string",
                        "minLength": 1,
                        "description": "Required when target_type is 'video' (or omitted). Any public TikTok/Instagram video URL, including a third party's — that is the intended use. Its platform must match the posting account's platform (COMMENT_PLATFORM_MISMATCH otherwise)."
                      },
                      "target_comment_url": {
                        "type": "string",
                        "minLength": 1,
                        "description": "Required when target_type is 'comment'. TikTok comment deep-link (Share comment → Copy link); short or full form."
                      },
                      "comment_text": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 10000,
                        "description": "Exact text to post. The effective limit is 150 characters for TikTok and 2,200 for Instagram. Deduplicate locally on (saved_account_id, target URL, comment_text): two calls carrying the same comment under different Idempotency-Keys create two tasks and bill twice."
                      },
                      "brief_id": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "format": "uuid",
                        "description": "Optional comment brief owned by the same client."
                      }
                    },
                    "additionalProperties": false
                  }
                }
              },
              "additionalProperties": false
            }
          ]
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Create comment tasks",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_get_comment_task",
    "operationId": "getCommentTask",
    "description": "Get a comment task. Returns one owned comment task, including whether inactive TokPortal Coverage currently blocks manager execution and the stable block reason.",
    "method": "GET",
    "path": "/comments/{id}",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Comment task ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Get a comment task",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_delete_comment_task",
    "operationId": "deleteCommentTask",
    "description": "Cancel a pending comment task. Cancels an owned task only while its status is pending. The terminal transition and refund of the task's exact stored credit cost commit atomically and are idempotent. Current tasks refund 1 credit; credits_refunded remains authoritative for historical tasks. Cancellation remains available when Coverage is paused because it stops pending work rather than executing it. Reuse the same Idempotency-Key after an uncertain transport result.",
    "method": "DELETE",
    "path": "/comments/{id}",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Comment task ID."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Cancel a pending comment task",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_approve_comment_task",
    "operationId": "approveCommentTask",
    "description": "Approve a manually confirmed comment task. Approves and finalizes an owned manually_confirmed task. Execution is blocked while TokPortal Coverage is inactive; inspect MANAGED_ACCOUNT_TASK_BLOCKED and reactivate a recoverable account first.",
    "method": "POST",
    "path": "/comments/{id}/approve",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Comment task ID."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Approve a manually confirmed comment task",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": true
    }
  },
  {
    "name": "tokportal_dispute_comment_task",
    "operationId": "disputeCommentTask",
    "description": "Dispute a manually confirmed comment task. Returns an owned manually_confirmed task to pending corrections. Execution is blocked while TokPortal Coverage is inactive; inspect MANAGED_ACCOUNT_TASK_BLOCKED and reactivate a recoverable account first.",
    "method": "POST",
    "path": "/comments/{id}/dispute",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Comment task ID."
        },
        "body": {
          "type": "object",
          "required": [
            "reason"
          ],
          "properties": {
            "reason": {
              "type": "string",
              "minLength": 3,
              "maxLength": 500
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        },
        "dry_run": {
          "type": "boolean",
          "description": "Simulate this call: full validation and the real price, but nothing is created, no credits are debited, and no Idempotency-Key is consumed. Returned identifiers are synthetic and only usable in other dry-run calls."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Dispute a manually confirmed comment task",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_comment_task_verifications",
    "operationId": "listCommentTaskVerifications",
    "description": "List comment task verification events. Lists verifier attempts for one owned task. This read remains available while TokPortal Coverage pauses task execution.",
    "method": "GET",
    "path": "/comments/{id}/verifications",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Comment task ID."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "List comment task verification events",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_ai_catalog",
    "operationId": "aiCatalog",
    "description": "Discover AI models and capabilities. Lists public model aliases and availability. A blocked capability is not usable. Fetch the chosen model schema before quoting; never infer support from a model name.",
    "method": "GET",
    "path": "/ai/models",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "capability": {
          "type": "string",
          "description": "query parameter capability"
        },
        "cursor": {
          "type": "string",
          "description": "query parameter cursor"
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 20,
          "description": "query parameter limit"
        }
      },
      "additionalProperties": false
    },
    "annotations": {
      "title": "Discover AI models and capabilities",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    },
    "requiredFeature": "ai"
  },
  {
    "name": "tokportal_ai_model_schema",
    "operationId": "aiModelSchema",
    "description": "Read a model's current input schema and capabilities.",
    "method": "GET",
    "path": "/ai/models/{model_id}",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "model_id": {
          "type": "string",
          "minLength": 1,
          "description": "path parameter model_id"
        },
        "operation": {
          "type": "string",
          "description": "query parameter operation"
        }
      },
      "required": [
        "model_id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Read a model's current input schema and capabilities",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    },
    "requiredFeature": "ai"
  },
  {
    "name": "tokportal_ai_generate",
    "operationId": "aiGenerate",
    "description": "Generate media with automatic AI wallet billing. Send model, prompt and model-specific controls directly. The server prices and reserves funds automatically within the key's approved per-job and monthly limits. Optional max_cost_usd sets a lower request cap. A separate quote is not required; quote_id plus max_cost_usd remains supported for explicit cost previews. Requires AI spending permission, wallet balance and Idempotency-Key. Reuse the same key and body after uncertainty. Does not publish. Poll with ai_inspect resource jobs. For video drafts, propose 480p (lower cost), 720p for a balance, or 1080p for final quality; respect the user's choice.",
    "method": "POST",
    "path": "/ai/generations",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "properties": {
            "model": {
              "type": "string",
              "minLength": 1,
              "description": "Public model alias from GET /ai/models. Fetch its current schema first."
            },
            "operation": {
              "type": "string",
              "minLength": 1,
              "description": "Model operation/capability from its schema, including image, video, audio, chat, analysis, or verification where available."
            },
            "prompt": {
              "type": "string"
            },
            "assets": {
              "type": "object",
              "additionalProperties": true
            },
            "controls": {
              "type": "object",
              "additionalProperties": true
            },
            "options": {
              "type": "object",
              "additionalProperties": true,
              "description": "Documented advanced options for the selected capability. No arbitrary provider URL, credentials, or HTTP route is accepted."
            },
            "quote_id": {
              "type": "string",
              "format": "uuid",
              "description": "Opaque TokPortal resource ID. Never a provider task ID."
            },
            "max_cost_usd": {
              "type": "string",
              "pattern": "^(0|[1-9][0-9]*)(\\.[0-9]{1,6})?$",
              "example": "2.500000",
              "description": "Non-negative USD decimal string, up to six fractional digits. Never a credit count or binary floating-point amount."
            }
          },
          "required": [],
          "additionalProperties": false,
          "oneOf": [
            {
              "required": [
                "model"
              ],
              "not": {
                "required": [
                  "quote_id"
                ]
              }
            },
            {
              "required": [
                "quote_id",
                "max_cost_usd"
              ],
              "not": {
                "anyOf": [
                  {
                    "required": [
                      "model"
                    ]
                  },
                  {
                    "required": [
                      "operation"
                    ]
                  },
                  {
                    "required": [
                      "prompt"
                    ]
                  },
                  {
                    "required": [
                      "assets"
                    ]
                  },
                  {
                    "required": [
                      "controls"
                    ]
                  },
                  {
                    "required": [
                      "options"
                    ]
                  }
                ]
              }
            }
          ],
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Required Idempotency-Key. Reuse with the identical request after an uncertain result; never issue a new key to retry spending."
        }
      },
      "required": [
        "body",
        "idempotency_key"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Generate media with automatic AI wallet billing",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": true
    },
    "requiredFeature": "ai"
  },
  {
    "name": "tokportal_ai_topup",
    "operationId": "aiTopup",
    "description": "Create an explicitly approved AI wallet top-up checkout. Billing action, never an implied prerequisite to generation. Only call after the user explicitly approves the displayed USD amount. Return the payment URL for the user to complete; never claim the wallet was credited merely because checkout was created.",
    "method": "POST",
    "path": "/ai/wallet/topups",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "properties": {
            "amount_usd": {
              "type": "string",
              "pattern": "^(0|[1-9][0-9]*)(\\.[0-9]{1,6})?$",
              "example": "2.500000",
              "description": "Non-negative USD decimal string, up to six fractional digits. Never a credit count or binary floating-point amount."
            },
            "billing_consent": {
              "const": true
            },
            "auto_topup": {
              "type": "object",
              "properties": {
                "threshold_usd": {
                  "type": "string",
                  "pattern": "^(0|[1-9][0-9]*)(\\.[0-9]{1,6})?$",
                  "example": "2.500000",
                  "description": "Non-negative USD decimal string, up to six fractional digits. Never a credit count or binary floating-point amount."
                },
                "amount_usd": {
                  "type": "string",
                  "pattern": "^(0|[1-9][0-9]*)(\\.[0-9]{1,6})?$",
                  "example": "2.500000",
                  "description": "Non-negative USD decimal string, up to six fractional digits. Never a credit count or binary floating-point amount."
                },
                "monthly_limit_usd": {
                  "type": "string",
                  "pattern": "^(0|[1-9][0-9]*)(\\.[0-9]{1,6})?$",
                  "example": "2.500000",
                  "description": "Non-negative USD decimal string, up to six fractional digits. Never a credit count or binary floating-point amount."
                },
                "approved_api_client_id": {
                  "type": "string",
                  "format": "uuid",
                  "description": "Opaque TokPortal resource ID. Never a provider task ID."
                },
                "billing_consent": {
                  "const": true
                },
                "consent_version": {
                  "const": "ai-auto-topup-v1"
                }
              },
              "required": [
                "threshold_usd",
                "amount_usd",
                "monthly_limit_usd",
                "approved_api_client_id",
                "billing_consent",
                "consent_version"
              ],
              "additionalProperties": false
            }
          },
          "required": [
            "amount_usd",
            "billing_consent"
          ],
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Required Idempotency-Key. Reuse with the identical request after an uncertain result; never issue a new key to retry spending."
        }
      },
      "required": [
        "body",
        "idempotency_key"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Create an explicitly approved AI wallet top-up checkout",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": true
    },
    "requiredFeature": "ai"
  },
  {
    "name": "tokportal_ai_inspect",
    "operationId": "aiInspect",
    "description": "Inspect AI jobs, media, wallet or permissions. Read-only facade over fixed AI resources. Optional id reads one owned job, asset, collection, or verification; omit it to list. wallet, transactions, access, auto_topup and status do not accept a resource ID. No provider work or payment is started.",
    "method": "GET",
    "path": "/ai/inspect",
    "requestContentType": null,
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "resource": {
          "type": "string",
          "enum": [
            "status",
            "jobs",
            "assets",
            "collections",
            "collection_assets",
            "library",
            "verifications",
            "wallet",
            "transactions",
            "access",
            "auto_topup"
          ],
          "description": "query parameter resource"
        },
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "query parameter id"
        },
        "cursor": {
          "type": "string",
          "description": "query parameter cursor"
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 20,
          "description": "query parameter limit"
        },
        "query": {
          "type": "string",
          "maxLength": 300,
          "description": "query parameter query"
        },
        "page_number": {
          "type": "integer",
          "minimum": 1,
          "maximum": 1000000,
          "description": "query parameter page_number"
        },
        "page_size": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "description": "query parameter page_size"
        }
      },
      "required": [
        "resource"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Inspect AI jobs, media, wallet or permissions",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    },
    "requiredFeature": "ai"
  },
  {
    "name": "tokportal_ai_manage",
    "operationId": "aiManage",
    "description": "Manage AI media, collections, cancellations and human verification. A fixed action enum, never an arbitrary HTTP proxy. Review the action before approving: deletion can remove media, cancellation does not guarantee a refund, and verification starts or refreshes an explicitly approved external human-verification session. All actions require Idempotency-Key. Verification is operationally gated until its provider pricing and consent requirements are approved.",
    "method": "POST",
    "path": "/ai/manage",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "properties": {
            "action": {
              "type": "string",
              "enum": [
                "cancel_job",
                "import_asset",
                "create_upload",
                "complete_upload",
                "update_asset",
                "delete_asset",
                "create_collection",
                "update_collection",
                "delete_collection",
                "add_collection_asset",
                "remove_collection_asset",
                "update_collection_asset",
                "refresh_collection_asset",
                "create_verification",
                "refresh_verification"
              ]
            },
            "id": {
              "type": "string",
              "format": "uuid",
              "description": "Opaque TokPortal resource ID. Never a provider task ID."
            },
            "data": {
              "type": "object",
              "additionalProperties": true
            }
          },
          "required": [
            "action"
          ],
          "additionalProperties": false,
          "oneOf": [
            {
              "properties": {
                "action": {
                  "const": "cancel_job"
                }
              },
              "required": [
                "id"
              ]
            },
            {
              "properties": {
                "action": {
                  "const": "import_asset"
                },
                "data": {
                  "type": "object",
                  "properties": {
                    "url": {
                      "type": "string",
                      "format": "uri"
                    },
                    "name": {
                      "type": "string"
                    },
                    "collection_id": {
                      "type": "string",
                      "format": "uuid",
                      "description": "Opaque TokPortal resource ID. Never a provider task ID."
                    }
                  },
                  "required": [
                    "url"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "data"
              ]
            },
            {
              "properties": {
                "action": {
                  "const": "create_upload"
                },
                "data": {
                  "type": "object",
                  "properties": {
                    "filename": {
                      "type": "string"
                    },
                    "content_type": {
                      "type": "string"
                    },
                    "size_bytes": {
                      "type": "integer",
                      "minimum": 1
                    }
                  },
                  "required": [
                    "filename",
                    "content_type",
                    "size_bytes"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "data"
              ]
            },
            {
              "properties": {
                "action": {
                  "const": "complete_upload"
                },
                "data": {
                  "type": "object",
                  "properties": {
                    "upload_id": {
                      "type": "string",
                      "format": "uuid",
                      "description": "Opaque TokPortal resource ID. Never a provider task ID."
                    }
                  },
                  "required": [
                    "upload_id"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "data"
              ]
            },
            {
              "properties": {
                "action": {
                  "const": "update_asset"
                },
                "data": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string"
                    },
                    "metadata": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "required": [],
                  "additionalProperties": false
                }
              },
              "required": [
                "id",
                "data"
              ]
            },
            {
              "properties": {
                "action": {
                  "const": "delete_asset"
                }
              },
              "required": [
                "id"
              ]
            },
            {
              "properties": {
                "action": {
                  "const": "create_collection"
                },
                "data": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 64
                    },
                    "description": {
                      "type": "string",
                      "maxLength": 300
                    }
                  },
                  "required": [
                    "name"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "data"
              ]
            },
            {
              "properties": {
                "action": {
                  "const": "update_collection"
                },
                "data": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 64
                    },
                    "description": {
                      "type": "string",
                      "maxLength": 300
                    }
                  },
                  "required": [
                    "name"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "id",
                "data"
              ]
            },
            {
              "properties": {
                "action": {
                  "const": "delete_collection"
                }
              },
              "required": [
                "id"
              ]
            },
            {
              "properties": {
                "action": {
                  "const": "add_collection_asset"
                },
                "data": {
                  "type": "object",
                  "properties": {
                    "asset_id": {
                      "type": "string",
                      "format": "uuid",
                      "description": "Opaque TokPortal resource ID. Never a provider task ID."
                    }
                  },
                  "required": [
                    "asset_id"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "id",
                "data"
              ]
            },
            {
              "properties": {
                "action": {
                  "const": "remove_collection_asset"
                },
                "data": {
                  "type": "object",
                  "properties": {
                    "asset_id": {
                      "type": "string",
                      "format": "uuid",
                      "description": "Opaque TokPortal resource ID. Never a provider task ID."
                    }
                  },
                  "required": [
                    "asset_id"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "id",
                "data"
              ]
            },
            {
              "properties": {
                "action": {
                  "const": "update_collection_asset"
                },
                "data": {
                  "type": "object",
                  "properties": {
                    "asset_id": {
                      "type": "string",
                      "format": "uuid",
                      "description": "Opaque TokPortal resource ID. Never a provider task ID."
                    },
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 64
                    }
                  },
                  "required": [
                    "asset_id",
                    "name"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "id",
                "data"
              ]
            },
            {
              "properties": {
                "action": {
                  "const": "refresh_collection_asset"
                },
                "data": {
                  "type": "object",
                  "properties": {
                    "asset_id": {
                      "type": "string",
                      "format": "uuid",
                      "description": "Opaque TokPortal resource ID. Never a provider task ID."
                    }
                  },
                  "required": [
                    "asset_id"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "id",
                "data"
              ]
            },
            {
              "properties": {
                "action": {
                  "const": "create_verification"
                },
                "data": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 64
                    },
                    "description": {
                      "type": "string",
                      "maxLength": 300
                    },
                    "consent": {
                      "const": true
                    }
                  },
                  "required": [
                    "name",
                    "consent"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "data"
              ]
            },
            {
              "properties": {
                "action": {
                  "const": "refresh_verification"
                }
              },
              "required": [
                "id"
              ]
            }
          ],
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Required Idempotency-Key. Reuse with the identical request after an uncertain result; never issue a new key to retry spending."
        }
      },
      "required": [
        "body",
        "idempotency_key"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Manage AI media, collections, cancellations and human verification",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": true
    },
    "requiredFeature": "ai"
  },
  {
    "name": "tokportal_ai_configure",
    "operationId": "aiConfigure",
    "description": "Configure AI permissions, budgets or automatic billing. Changes future spending authority. resource selects access or auto_topup. Require explicit user approval for enabling generation/billing or raising limits. Enabling automatic top-ups requires billing_consent:true. Never silently grant a key permissions or turn on recurring payments to make another operation succeed.",
    "method": "PATCH",
    "path": "/ai/configure",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "properties": {
            "resource": {
              "type": "string",
              "enum": [
                "access",
                "auto_topup"
              ]
            },
            "config": {
              "type": "object",
              "additionalProperties": true
            }
          },
          "required": [
            "resource",
            "config"
          ],
          "additionalProperties": false,
          "oneOf": [
            {
              "properties": {
                "resource": {
                  "const": "access"
                },
                "config": {
                  "type": "object",
                  "properties": {
                    "enabled": {
                      "type": "boolean"
                    },
                    "max_job_usd": {
                      "type": "string",
                      "pattern": "^(0|[1-9][0-9]*)(\\.[0-9]{1,6})?$",
                      "example": "2.500000",
                      "description": "Non-negative USD decimal string, up to six fractional digits. Never a credit count or binary floating-point amount."
                    },
                    "monthly_limit_usd": {
                      "type": "string",
                      "pattern": "^(0|[1-9][0-9]*)(\\.[0-9]{1,6})?$",
                      "example": "2.500000",
                      "description": "Non-negative USD decimal string, up to six fractional digits. Never a credit count or binary floating-point amount."
                    },
                    "consent": {
                      "const": true
                    },
                    "consent_version": {
                      "const": "ai-spend-v1"
                    }
                  },
                  "required": [
                    "enabled"
                  ],
                  "additionalProperties": false,
                  "oneOf": [
                    {
                      "properties": {
                        "enabled": {
                          "const": false
                        }
                      }
                    },
                    {
                      "properties": {
                        "enabled": {
                          "const": true
                        }
                      },
                      "required": [
                        "max_job_usd",
                        "monthly_limit_usd",
                        "consent",
                        "consent_version"
                      ]
                    }
                  ]
                }
              }
            },
            {
              "properties": {
                "resource": {
                  "const": "auto_topup"
                },
                "config": {
                  "type": "object",
                  "properties": {
                    "enabled": {
                      "type": "boolean"
                    },
                    "threshold_usd": {
                      "type": "string",
                      "pattern": "^(0|[1-9][0-9]*)(\\.[0-9]{1,6})?$",
                      "example": "2.500000",
                      "description": "Non-negative USD decimal string, up to six fractional digits. Never a credit count or binary floating-point amount."
                    },
                    "amount_usd": {
                      "type": "string",
                      "pattern": "^(0|[1-9][0-9]*)(\\.[0-9]{1,6})?$",
                      "example": "2.500000",
                      "description": "Non-negative USD decimal string, up to six fractional digits. Never a credit count or binary floating-point amount."
                    },
                    "monthly_limit_usd": {
                      "type": "string",
                      "pattern": "^(0|[1-9][0-9]*)(\\.[0-9]{1,6})?$",
                      "example": "2.500000",
                      "description": "Non-negative USD decimal string, up to six fractional digits. Never a credit count or binary floating-point amount."
                    },
                    "billing_consent": {
                      "const": true
                    },
                    "consent_version": {
                      "const": "ai-auto-topup-v1"
                    }
                  },
                  "required": [
                    "enabled"
                  ],
                  "additionalProperties": false,
                  "oneOf": [
                    {
                      "properties": {
                        "enabled": {
                          "const": false
                        }
                      }
                    },
                    {
                      "properties": {
                        "enabled": {
                          "const": true
                        }
                      },
                      "required": [
                        "threshold_usd",
                        "amount_usd",
                        "monthly_limit_usd",
                        "billing_consent",
                        "consent_version"
                      ]
                    }
                  ]
                }
              }
            }
          ],
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Required Idempotency-Key. Reuse with the identical request after an uncertain result; never issue a new key to retry spending."
        }
      },
      "required": [
        "body",
        "idempotency_key"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Configure AI permissions, budgets or automatic billing",
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": true
    },
    "requiredFeature": "ai"
  }
];
