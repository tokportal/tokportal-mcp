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

// prettier-ignore
export const TOOLS: McpToolDefinition[] = [
  {
    "name": "tokportal_get_current_user",
    "operationId": "getCurrentUser",
    "description": "Get authenticated user.",
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
    "description": "Reactivate TokPortal Coverage. Reactivates Coverage from an explicit GET snapshot. Reactivation is free while the current billing period is already paid or included; Coverage benefits and tasks remain paused until reactivation. At and after current_period_end, the endpoint accepts the effective lapsed state even if recorded_status has not yet been updated by the renewal worker, and charges exactly the projected unpaid periods without adding an extra period. The expected credits, period end, and lock version are checked atomically before any debit or task resume. Scheduled videos receive new future dates while preserving their cadence.",
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
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_cancel_account_managed_subscription",
    "operationId": "cancelAccountManagedSubscription",
    "description": "Pause TokPortal Coverage. Immediately blocks new and ongoing TokPortal work for the account. Payments are not refunded. If a paid or included current period remains, reactivation is free until its original end. Otherwise it costs exactly the unpaid 30-day periods at the rate returned by the Coverage status endpoint.",
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
    "description": "List available countries.",
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
    "description": "List available platforms.",
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
    "description": "Get credit pricing.",
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
    "description": "Get credit balance.",
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
    "description": "List credit transactions.",
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
    "description": "List bundles.",
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
    "description": "Create a bundle. Creates and pays an account-only, account-and-videos, or videos-only bundle in one atomic creation checkout. Credits are debited immediately on a successful POST, not when the bundle is published. Credit cost is calculated server-side from the workspace cohort and any contract_bundle_allowance returned by getCreditCosts. A qualifying allowance slot is consumed in the same transaction as the credit debit; failed requests consume nothing. The exact new-customer and saved-account cutoff is the immutable production PRE-migration instant returned by getCreditCosts. A real TikTok or Instagram saved account created on or after that cutoff receives its first 30 days of TokPortal Coverage included unless the creation response marks it contractually exempt. For Advanced Niche Warming, either pass advanced_warming_terms now, or buy a target count with advanced_warming_terms_count at the effective workspace rate and configure the targets later via PUT /bundles/{id}/warming-terms. Count-only purchases that are never configured are auto-cancelled and fully refunded after 14 days. external_ref is a client correlation and duplicate-detection aid, not a retry mechanism; only Idempotency-Key provides exact request replay.",
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
              "default": "tiktok"
            },
            "country": {
              "type": "string",
              "minLength": 2,
              "maxLength": 5,
              "description": "Required unless bundle_type is videos_only."
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
              "description": "Niche warming (7 credits, review-based). Will be deprecated in favor of advanced warming."
            },
            "wants_deep_warming": {
              "type": "boolean",
              "default": false,
              "description": "DISCONTINUED. New orders are rejected with DEEP_WARMING_DEPRECATED. Use wants_advanced_warming instead."
            },
            "wants_advanced_warming": {
              "type": "boolean",
              "default": false,
              "description": "Advanced Niche Warming (recommended): niche-target (search-term) based warming with recorded proof and a data report. The standard rate is 5 credits per target (per target, never per day); GET /credit-costs returns the effective rate. TikTok and Instagram only. Provide advanced_warming_terms now, or advanced_warming_terms_count to configure the targets later."
            },
            "advanced_warming_terms": {
              "type": "array",
              "maxItems": 30,
              "x-item-count-multiple-of": 3,
              "items": {
                "type": "string",
                "minLength": 2,
                "maxLength": 50
              },
              "description": "3-30 search terms, count must be a multiple of 3. Optional when advanced_warming_terms_count is provided instead."
            },
            "advanced_warming_terms_count": {
              "type": "integer",
              "minimum": 3,
              "maximum": 30,
              "x-value-multiple-of": 3,
              "description": "Number of niche targets to purchase (3-30, multiples of 3; standard rate 5 credits each; GET /credit-costs returns the effective rate); alternative to advanced_warming_terms. Configure the terms later via PUT /bundles/{id}/warming-terms. Unconfigured purchases are auto-cancelled and fully refunded after 14 days."
            },
            "niche_warming_instructions": {
              "type": "string",
              "maxLength": 2000
            },
            "auto_finalize_videos": {
              "type": "boolean",
              "default": true
            },
            "account_id": {
              "type": "string",
              "format": "uuid",
              "description": "Required for videos_only bundles."
            },
            "external_ref": {
              "type": "string",
              "maxLength": 200,
              "description": "Optional client correlation reference and duplicate-detection aid for new-account bundles. Reusing it can return DUPLICATE_ACCOUNT_BUNDLE. It does not provide request retry or response replay; use Idempotency-Key for that."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
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
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_create_bundles_bulk",
    "operationId": "createBundlesBulk",
    "description": "Create bundles in bulk. Creates and pays several bundles in one atomic creation checkout. Credits are debited immediately on a successful POST, not at publication. The complete batch is checked against rolling workspace capacity and any contract_bundle_allowance returned by getCreditCosts. Qualifying allowance slots are consumed in deterministic bundle-ID order in the same transaction as all debits; if any bundle fails, the entire batch rolls back and consumes nothing. A batch crossing the final allowance slot receives the contract price only for the remaining qualifying bundles. For Advanced Niche Warming, either pass advanced_warming_terms, using the same terms for every account, or buy a per-account target count with advanced_warming_terms_count and configure each bundle's targets later via PUT /bundles/{id}/warming-terms. external_ref is one optional batch-level reference copied to the resulting bundles, not a unique per-bundle key or a retry mechanism; use returned bundle IDs for identity and Idempotency-Key for exact replay.",
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
              }
            },
            "country": {
              "type": "string",
              "minLength": 2,
              "maxLength": 5
            },
            "accounts_count": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
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
              "description": "Niche warming (7 credits, review-based). Will be deprecated in favor of advanced warming."
            },
            "wants_deep_warming": {
              "type": "boolean",
              "default": false,
              "description": "DISCONTINUED. New orders are rejected with DEEP_WARMING_DEPRECATED. Use wants_advanced_warming instead."
            },
            "wants_advanced_warming": {
              "type": "boolean",
              "default": false,
              "description": "Advanced Niche Warming (recommended): niche-target (search-term) based warming with recorded proof and a data report. The standard rate is 5 credits per target (per target, never per day), charged per account; GET /credit-costs returns the effective rate. TikTok and Instagram only. Provide advanced_warming_terms now, or advanced_warming_terms_count to configure the targets later."
            },
            "advanced_warming_terms": {
              "type": "array",
              "maxItems": 30,
              "x-item-count-multiple-of": 3,
              "items": {
                "type": "string",
                "minLength": 2,
                "maxLength": 50
              },
              "description": "3-30 search terms, count must be a multiple of 3. Optional when advanced_warming_terms_count is provided instead. The same terms apply to every account of the bulk creation."
            },
            "advanced_warming_terms_count": {
              "type": "integer",
              "minimum": 3,
              "maximum": 30,
              "x-value-multiple-of": 3,
              "description": "Number of niche targets purchased PER ACCOUNT (3-30, multiples of 3; standard rate 5 credits each; GET /credit-costs returns the effective rate); alternative to advanced_warming_terms. Configure each bundle's targets later via PUT /bundles/{id}/warming-terms. Unconfigured purchases are auto-cancelled and fully refunded after 14 days."
            },
            "niche_warming_instructions": {
              "type": "string",
              "maxLength": 2000
            },
            "auto_finalize_videos": {
              "type": "boolean",
              "default": true
            },
            "external_ref": {
              "type": "string",
              "maxLength": 200,
              "description": "Optional batch-level client reference copied to every bundle created by this call. It is not unique per resulting bundle and is not an idempotency key. Use the returned bundle IDs for per-bundle identity and Idempotency-Key for retry/replay."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
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
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_bundle",
    "operationId": "getBundle",
    "description": "Get a bundle.",
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
    "description": "Update bundle settings. Updates mutable bundle metadata such as title, external_ref, and auto_finalize_videos.",
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
    "description": "Publish a bundle. Publishes a fully configured bundle. When this bundle resolves to a delivered saved account, the account must have active TokPortal Coverage or be permanently grandfathered. A due active period can renew automatically at the account's stored rate immediately before execution. If Coverage cannot renew, no task or media mutation starts.",
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
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
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
    "description": "Unpublish a bundle.",
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
    "description": "Add video slots to a bundle.",
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
              "maximum": 500
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
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
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_add_edit_slots",
    "operationId": "addEditSlots",
    "description": "Add edit slots to a bundle.",
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
              "maximum": 500
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
        }
      },
      "required": [
        "id",
        "body"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "title": "Add edit slots to a bundle",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_get_bundle_account",
    "operationId": "getBundleAccount",
    "description": "Get bundle account configuration.",
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
    "description": "Configure bundle account profile. Sets the account identity (username, visible name, biography, profile picture). For backward compatibility it can also accept the exact purchased advanced_warming_terms list, but PUT /bundles/{id}/warming-terms is the recommended one-shot deferred-target endpoint because it remains available at any account status. When this bundle resolves to a delivered saved account, the account must have active TokPortal Coverage or be permanently grandfathered. A due active period can renew automatically at the account's stored rate immediately before execution. If Coverage cannot renew, no task or media mutation starts. A new account that has not produced a saved account yet remains configurable before delivery.",
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
              "maxLength": 30
            },
            "biography": {
              "type": "string",
              "maxLength": 120,
              "description": "120 for Instagram, 80 for other platforms."
            },
            "profile_picture_url": {
              "type": "string",
              "description": "Public image URL or TokPortal storage URL/path."
            },
            "link_in_bio": {
              "type": "string",
              "format": "uri"
            },
            "niche_warming_instructions": {
              "type": "string",
              "maxLength": 2000
            },
            "advanced_warming_terms": {
              "type": "array",
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
      "openWorldHint": false
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
      "openWorldHint": false
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
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_list_bundle_videos",
    "operationId": "listBundleVideos",
    "description": "List bundle video slots.",
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
    "description": "Get video slot configuration.",
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
    "description": "Configure a video slot. Configure a slot as a video, carousel, or story. A story (TikTok/Instagram only) is a single video OR a single image (provide exactly one of video_url or story_image_url), has no description, and is verified by an account-manager screenshot. The optional story_repost_url makes the story repost an existing post from the SAME platform and costs +1 credit. When this bundle resolves to a delivered saved account, the account must have active TokPortal Coverage or be permanently grandfathered. A due active period can renew automatically at the account's stored rate immediately before execution. If Coverage cannot renew, no task or media mutation starts.",
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
              "description": "YYYY-MM-DD. Max 3 videos per day per bundle — a 4th video on the same day is rejected with VIDEOS_PER_DAY_EXCEEDED."
            },
            "name": {
              "type": "string",
              "maxLength": 200
            },
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
              "format": "uri"
            },
            "volume_original_sound": {
              "type": [
                "integer",
                "null"
              ],
              "minimum": 0,
              "maximum": 200
            },
            "volume_added_sound": {
              "type": [
                "integer",
                "null"
              ],
              "minimum": 0,
              "maximum": 200
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
              ]
            },
            "instagram_location": {
              "type": "string",
              "maxLength": 200
            },
            "instagram_collaborators": {
              "type": "array",
              "maxItems": 5,
              "items": {
                "type": "string"
              }
            },
            "instagram_audio_name": {
              "type": "string",
              "maxLength": 200
            },
            "instagram_add_to_story": {
              "type": "boolean"
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
              "maxLength": 200
            },
            "youtube_tags": {
              "type": "array",
              "maxItems": 30,
              "items": {
                "type": "string"
              }
            },
            "youtube_category": {
              "type": "string",
              "maxLength": 100
            },
            "youtube_visibility": {
              "type": "string",
              "enum": [
                "public",
                "unlisted",
                "private"
              ]
            },
            "youtube_sound_url": {
              "type": "string",
              "format": "uri"
            },
            "auto_publish": {
              "type": "boolean",
              "default": false
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
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
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_patch_bundle_video",
    "operationId": "patchBundleVideo",
    "description": "Patch video metadata or schedule. When this bundle resolves to a delivered saved account, the account must have active TokPortal Coverage or be permanently grandfathered. A due active period can renew automatically at the account's stored rate immediately before execution. If Coverage cannot renew, no task or media mutation starts.",
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
              "description": "YYYY-MM-DD. Max 3 videos per day per bundle (VIDEOS_PER_DAY_EXCEEDED otherwise)."
            },
            "target_publish_start_date": {
              "type": [
                "string",
                "null"
              ],
              "format": "date-time"
            },
            "target_publish_end_date": {
              "type": [
                "string",
                "null"
              ],
              "format": "date-time"
            }
          },
          "minProperties": 1,
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
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
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_batch_configure_bundle_videos",
    "operationId": "batchConfigureBundleVideos",
    "description": "Configure video slots in bulk. Configures several slots after one account-level Coverage preflight. When this bundle resolves to a delivered saved account, the account must have active TokPortal Coverage or be permanently grandfathered. A due active period can renew automatically at the account's stored rate immediately before execution. If Coverage cannot renew, no task or media mutation starts.",
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
              "items": {
                "allOf": [
                  {
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
                        "description": "YYYY-MM-DD. Max 3 videos per day per bundle — a 4th video on the same day is rejected with VIDEOS_PER_DAY_EXCEEDED."
                      },
                      "name": {
                        "type": "string",
                        "maxLength": 200
                      },
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
                        "format": "uri"
                      },
                      "volume_original_sound": {
                        "type": [
                          "integer",
                          "null"
                        ],
                        "minimum": 0,
                        "maximum": 200
                      },
                      "volume_added_sound": {
                        "type": [
                          "integer",
                          "null"
                        ],
                        "minimum": 0,
                        "maximum": 200
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
                        ]
                      },
                      "instagram_location": {
                        "type": "string",
                        "maxLength": 200
                      },
                      "instagram_collaborators": {
                        "type": "array",
                        "maxItems": 5,
                        "items": {
                          "type": "string"
                        }
                      },
                      "instagram_audio_name": {
                        "type": "string",
                        "maxLength": 200
                      },
                      "instagram_add_to_story": {
                        "type": "boolean"
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
                        "maxLength": 200
                      },
                      "youtube_tags": {
                        "type": "array",
                        "maxItems": 30,
                        "items": {
                          "type": "string"
                        }
                      },
                      "youtube_category": {
                        "type": "string",
                        "maxLength": 100
                      },
                      "youtube_visibility": {
                        "type": "string",
                        "enum": [
                          "public",
                          "unlisted",
                          "private"
                        ]
                      },
                      "youtube_sound_url": {
                        "type": "string",
                        "format": "uri"
                      },
                      "auto_publish": {
                        "type": "boolean",
                        "default": false
                      }
                    },
                    "additionalProperties": false
                  },
                  {
                    "type": "object",
                    "required": [
                      "position"
                    ],
                    "properties": {
                      "position": {
                        "type": "integer",
                        "minimum": 1
                      }
                    }
                  }
                ]
              }
            },
            "auto_publish": {
              "type": "boolean",
              "default": false
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
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
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_publish_all_bundle_videos",
    "operationId": "publishAllBundleVideos",
    "description": "Publish all configured videos on an active bundle. When this bundle resolves to a delivered saved account, the account must have active TokPortal Coverage or be permanently grandfathered. A due active period can renew automatically at the account's stored rate immediately before execution. If Coverage cannot renew, no task or media mutation starts.",
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
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_import_bundle_videos_csv",
    "operationId": "importBundleVideosCsv",
    "description": "Import video slots from CSV. Uploads a CSV file, downloads referenced media, and configures available video slots. Coverage is checked before TokPortal fetches or stores referenced media. When this bundle resolves to a delivered saved account, the account must have active TokPortal Coverage or be permanently grandfathered. A due active period can renew automatically at the account's stored rate immediately before execution. If Coverage cannot renew, no task or media mutation starts.",
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
          "default": false
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
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_publish_bundle_video",
    "operationId": "publishBundleVideo",
    "description": "Publish one video slot. When this bundle resolves to a delivered saved account, the account must have active TokPortal Coverage or be permanently grandfathered. A due active period can renew automatically at the account's stored rate immediately before execution. If Coverage cannot renew, no task or media mutation starts.",
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
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_reset_bundle_video",
    "operationId": "resetBundleVideo",
    "description": "Reset one video slot. When this bundle resolves to a delivered saved account, the account must have active TokPortal Coverage or be permanently grandfathered. A due active period can renew automatically at the account's stored rate immediately before execution. If Coverage cannot renew, no task or media mutation starts.",
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
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_unschedule_bundle_video",
    "operationId": "unscheduleBundleVideo",
    "description": "Unschedule one video slot. When this bundle resolves to a delivered saved account, the account must have active TokPortal Coverage or be permanently grandfathered. A due active period can renew automatically at the account's stored rate immediately before execution. If Coverage cannot renew, no task or media mutation starts.",
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
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_finalize_bundle_video",
    "operationId": "finalizeBundleVideo",
    "description": "Finalize video review. When this bundle resolves to a delivered saved account, the account must have active TokPortal Coverage or be permanently grandfathered. A due active period can renew automatically at the account's stored rate immediately before execution. If Coverage cannot renew, no task or media mutation starts.",
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
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_request_bundle_video_corrections",
    "operationId": "requestBundleVideoCorrections",
    "description": "Request video corrections. When this bundle resolves to a delivered saved account, the account must have active TokPortal Coverage or be permanently grandfathered. A due active period can renew automatically at the account's stored rate immediately before execution. If Coverage cannot renew, no task or media mutation starts.",
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
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_fix_bundle_video_download",
    "operationId": "fixBundleVideoDownload",
    "description": "Fix a broken video download. Replaces a manager-flagged broken video or carousel download URL and clears the download issue flag. When this bundle resolves to a delivered saved account, the account must have active TokPortal Coverage or be permanently grandfathered. A due active period can renew automatically at the account's stored rate immediately before execution. If Coverage cannot renew, no task or media mutation starts.",
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
    "description": "List delivered accounts.",
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
    "description": "List ban reports and appeals. Pollable list of validated ban reports for the caller's delivered accounts, covering the whole lifecycle: appeal_pending (platform appeal filed, account unavailable but NOT yet banned), appeal_accepted (account survived), appeal_refused / no_appeal_banned (confirmed ban), and the staff commercial resolution (refund / remake / no_remake with a machine-readable reason_code such as tos_ban). This is the REST counterpart of the account.banned, account.ban_appeal.submitted, account.ban_appeal.resolved and account.ban_resolution.decided webhook events. Only staff/CM-validated bans appear here — detections from TokPortal's internal health scan are never listed. Poll with the since parameter (updated_at watermark) to pick up new reports and status changes.",
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
    "description": "Get a delivered account.",
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
    "name": "tokportal_update_account_commenting_profile",
    "operationId": "updateAccountCommentingProfile",
    "description": "Update account commenting profile. Updates client-owned commenting/autopilot profile fields for a delivered account. The account must belong to the API key owner and must have active TokPortal Coverage, unless it is permanently grandfathered. Revealed/detached, banned, paused, lapsed and unrecoverable accounts are read-only.",
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
    "description": "List bundles for a delivered account.",
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
      "destructiveHint": false,
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
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_can_refresh_account_analytics",
    "operationId": "canRefreshAccountAnalytics",
    "description": "Check analytics refresh availability.",
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
    "description": "Refresh account analytics. Backward-compatible account analytics refresh path. Supports forced refresh and post import options. Refresh is blocked for revealed/detached, banned or inactive-Coverage accounts; permanently grandfathered accounts remain eligible.",
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
              "default": false
            },
            "includePosts": {
              "type": "boolean",
              "default": true
            },
            "includeComments": {
              "type": "boolean",
              "default": false
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
    "description": "Get active account edit request.",
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
    "description": "Request profile edits for a delivered account. Requests profile changes and debits 8 credits. Active TokPortal Coverage and a routable active account manager are required. TokPortal uses the account's current active manager, then its still-active manager relationship, then eligible non-cancelled order history. Completed bundles remain eligible without a delivery-age limit; cancelled orders are never restored. Assignment, debit, and task creation are atomic, so an unavailable manager never costs credits. The task appears directly in that manager's calendar.",
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
              "maxLength": 24
            },
            "requested_visible_name": {
              "type": "string",
              "minLength": 1,
              "maxLength": 30
            },
            "requested_biography": {
              "type": "string",
              "maxLength": 150,
              "description": "150 for Instagram, 80 for other platforms."
            },
            "requested_profile_picture_url": {
              "type": "string"
            },
            "requested_link_in_bio": {
              "type": "string",
              "format": "uri"
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
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
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_rewarm_account",
    "operationId": "rewarmAccount",
    "description": "Order Advanced Niche Warming (rewarm) on a delivered account. Starts an Advanced Niche Warming session on a saved account: for each provided term the manager screen-records a session that opens on the account profile (handle visible), searches the term on the account's platform, watches videos from the results, engages with them (likes/saves) and leaves a comment. Every recording is verified before completion. The standard rate is 5 credits per term, charged per target and never per day (3-30 terms, multiples of 3). GET /credit-costs returns the effective rate; the announced legacy grace window closed on 2026-08-14T11:00:00Z. Requires active TokPortal Coverage, a routable active account manager backed by a non-cancelled support order, TikTok or Instagram, and no already-active warming session. A completed bundle remains eligible. Terms are split evenly over 3 calendar days in the manager's timezone; earlier-day tasks remain available until completed and sessions with tasks do not expire.",
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
              "description": "3-30 search terms (count must be a multiple of 3), each 2-50 characters. The standard rate is 5 credits per term (per target, never per day); GET /credit-costs returns the effective rate. For each term the manager screen-records a session that opens on the account profile, searches the term, watches videos from the results, engages with them (likes/saves) and leaves a comment. Every recording is verified before the manager is paid."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
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
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    }
  },
  {
    "name": "tokportal_configure_bundle_warming_terms",
    "operationId": "configureBundleWarmingTerms",
    "description": "Configure the niche targets of a count-only Advanced Niche Warming purchase. Sets the niche targets for a bundle created with advanced_warming_terms_count (deferred configuration). Must provide EXACTLY the purchased number of targets. One-shot: once configured the targets cannot be changed. Unlike PUT /bundles/{id}/account, this stays available at any account status after the manager accepted the mission or submitted the account, in which case the warming session starts immediately. When this bundle resolves to a delivered saved account, the account must have active TokPortal Coverage or be permanently grandfathered. A due active period can renew automatically at the account's stored rate immediately before execution. If Coverage cannot renew, no task or media mutation starts. A new account that has not produced a saved account yet remains configurable before delivery.",
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
    "description": "Generate Advanced Niche Warming search terms. Generates platform-appropriate Advanced Niche Warming search terms (niche targets) from a free-text niche description (max 1000 characters). This is free and no credits are charged. Pass the result to advanced_warming_terms (bundle creation or PUT /bundles/{id}/warming-terms deferred configuration) or search_terms (rewarm).",
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
    "description": "List webhook event catalog. Returns the supported webhook event types, delivery envelope, signature scheme, and example payloads. This endpoint is public so teams can inspect webhook contracts before creating an API key.",
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
    "description": "List webhook endpoints.",
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
    "description": "Create a webhook endpoint. Creates a webhook endpoint and returns its signing secret once. Store the secret to verify TokPortal webhook signatures. Do not send Idempotency-Key. The successful response contains a secret and is never stored in the replay ledger. A request with the header is rejected with IDEMPOTENCY_KEY_NOT_ALLOWED_FOR_SENSITIVE_RESPONSE (400) before any ledger claim or operation execution.",
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
    "description": "Get a webhook endpoint.",
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
    "description": "Update a webhook endpoint.",
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
    "description": "Delete a webhook endpoint.",
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
    "description": "List webhook deliveries.",
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
    "description": "Create a video upload URL. Returns a short-lived presigned upload capability. Do not send Idempotency-Key. The successful response contains a secret and is never stored in the replay ledger. A request with the header is rejected with IDEMPOTENCY_KEY_NOT_ALLOWED_FOR_SENSITIVE_RESPONSE (400) before any ledger claim or operation execution.",
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
    "description": "Upload a video file directly. Uploads multipart/form-data directly through TokPortal and returns the public video URL.",
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
    "description": "Create an image upload URL. Returns a short-lived signed upload URL and upload token. Do not send Idempotency-Key. The successful response contains a secret and is never stored in the replay ledger. A request with the header is rejected with IDEMPOTENCY_KEY_NOT_ALLOWED_FOR_SENSITIVE_RESPONSE (400) before any ledger claim or operation execution.",
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
              "maxLength": 200
            },
            "content_type": {
              "type": "string",
              "pattern": "^image/(jpeg|jpg|png|webp|gif)$",
              "description": "Allowed image MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif."
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
    "description": "Upload an image file directly. Uploads multipart/form-data directly through TokPortal and returns storage details. HEIF/HEIC may be converted to JPEG.",
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
    "description": "Import an image from URL. Fetches a public direct image URL and stores it permanently in TokPortal storage.",
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
    "description": "Get analytics dashboard.",
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
    "description": "Export analytics videos CSV.",
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
    "description": "Create analytics web report. Creates a shareable Analytics v2 web report and returns its bearer-like access token and URL. Do not send Idempotency-Key. The successful response contains a secret and is never stored in the replay ledger. A request with the header is rejected with IDEMPOTENCY_KEY_NOT_ALLOWED_FOR_SENSITIVE_RESPONSE (400) before any ledger claim or operation execution.",
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
              "maxLength": 200
            },
            "template": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 100
            },
            "brandName": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 100
            },
            "brandAccent": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 40
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
              "maxLength": 200
            },
            "from": {
              "type": [
                "string",
                "null"
              ],
              "format": "date"
            },
            "to": {
              "type": [
                "string",
                "null"
              ],
              "format": "date"
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
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
    "description": "Export analytics report HTML. Creates a standalone downloadable HTML analytics report.",
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
              "maxLength": 200
            },
            "template": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 100
            },
            "brandName": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 100
            },
            "brandAccent": {
              "type": [
                "string",
                "null"
              ],
              "maxLength": 40
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
              "maxLength": 200
            },
            "from": {
              "type": [
                "string",
                "null"
              ],
              "format": "date"
            },
            "to": {
              "type": [
                "string",
                "null"
              ],
              "format": "date"
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
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
    "description": "Get analytics time series.",
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
    "name": "tokportal_get_analytics_account",
    "operationId": "getAnalyticsAccount",
    "description": "Get account analytics drilldown.",
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
    "description": "Refresh analytics account. Refreshes an owner-scoped account through Analytics v2. Refresh is blocked for revealed/detached, banned or inactive-Coverage accounts; permanently grandfathered accounts remain eligible.",
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
              "default": false
            },
            "includePosts": {
              "type": "boolean",
              "default": true
            },
            "includeComments": {
              "type": "boolean",
              "default": false
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
    "description": "Get account analytics compatibility view.",
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
    "description": "List post analytics for an account.",
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
    "description": "Get single video analytics.",
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
    "description": "Request an ad code (TikTok Spark Code / Instagram Partner Code) for a finalized video. Requests an ad code (TikTok Spark Code or Instagram Partner Code) for one finalized video and debits 7 credits. The video must be finalized on TikTok or Instagram with a live post link. Active TokPortal Coverage and a routable active account manager are required. TokPortal uses the account's current active manager, then its still-active manager relationship, then eligible non-cancelled order history. Completed bundles remain eligible without a delivery-age limit; cancelled orders are never restored. Assignment, debit, and task creation are atomic. Only one open request per video is allowed. Poll the GET endpoint to retrieve the code once the manager submits it.",
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
            },
            "platform": {
              "type": "string",
              "enum": [
                "tiktok",
                "instagram"
              ],
              "description": "Optional. Defaults to the video's platform. TikTok and Instagram are supported."
            }
          },
          "additionalProperties": false,
          "description": "JSON request body."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
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
      "destructiveHint": false,
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
    "description": "Get comment pulse analytics.",
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
    "description": "List comments for an account post.",
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
    "description": "Create comment tasks. Creates one comment task or a partial-success batch of up to 200. Each accepted task costs 1 credit. The saved account must be client-owned, manager-assigned, and allowed to execute tasks by TokPortal Coverage, unless it is permanently grandfathered. TokPortal locks and revalidates the account and Coverage before the accepted-task debit and all accepted inserts commit in one transaction. Rejected rows are never charged. Read credits_charged instead of calculating it from the request. Send an Idempotency-Key and reuse the same key, method, path, and body after an uncertain transport result so the completed response is replayed without a second charge.",
    "method": "POST",
    "path": "/comments",
    "requestContentType": "application/json",
    "multipartFields": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "Idempotency-Key": {
          "type": "string",
          "minLength": 1,
          "maxLength": 255,
          "description": "Strongly recommended for this credit or workflow mutation. Use one unique key per logical request and reuse the same key only with the same method, path, query, and body after an uncertain result. Maximum 255 characters."
        },
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
                  "description": "Required when target_type is 'video' (or omitted). TikTok/Instagram video URL."
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
                  "description": "Exact text to post. The effective limit is 150 characters for TikTok and 2,200 for Instagram."
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
                        "description": "Required when target_type is 'video' (or omitted). TikTok/Instagram video URL."
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
                        "description": "Exact text to post. The effective limit is 150 characters for TikTok and 2,200 for Instagram."
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
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
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
        "Idempotency-Key": {
          "type": "string",
          "minLength": 1,
          "maxLength": 255,
          "description": "Strongly recommended for this credit or workflow mutation. Use one unique key per logical request and reuse the same key only with the same method, path, query, and body after an uncertain result. Maximum 255 characters."
        },
        "idempotency_key": {
          "type": "string",
          "description": "Optional Idempotency-Key header for safe retries."
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
      "openWorldHint": false
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
  }
];
