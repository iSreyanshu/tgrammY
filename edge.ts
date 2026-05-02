/**
 * ╔══════════════════════════════════════════════════════╗
 * ║              tgrammY-edge  v2.0                      ║
 * ║   Run grammY Telegram bots on Vercel Edge (Deno)     ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * @module tgrammY-edge
 * @description A powerful, zero-config wrapper for deploying
 *              grammY Telegram bots on Vercel using the Deno runtime.
 *
 * ─── Using Extra Libraries ───────────────────────────────────────────────────
 *
 * The recommended pattern is a `deps.ts` file in your project root.
 * Import everything from there — keeps URLs in one place and makes
 * upgrades trivial.
 *
 * Example `deps.ts`:
 * ```ts
 * // ── tgrammY (re-exports all of grammY too) ──
 * export * from "https://raw.githubusercontent.com/iSreyanshu/tgrammY/app/edge.ts";
 *
 * // ── grammY plugins ──
 * export { session, type SessionFlavor }   from "https://deno.land/x/grammy/mod.ts";
 * export { hydrate, type HydrateApiFlavor } from "https://deno.land/x/grammy_hydrate/mod.ts";
 * export { limit }                          from "https://deno.land/x/grammy_ratelimiter/mod.ts";
 * export { autoQuote }                      from "https://deno.land/x/grammy_autoquote/mod.ts";
 *
 * // ── Validation ──
 * export { z } from "https://deno.land/x/zod/mod.ts";
 *
 * // ── HTTP client ──
 * export { default as axios } from "https://deno.land/x/axiod/mod.ts";
 *
 * // ── Utilities ──
 * export * as log from "https://deno.land/std/log/mod.ts";
 * export { load as loadEnv } from "https://deno.land/std/dotenv/mod.ts";
 * ```
 *
 * Then in `api/bot.ts`:
 * ```ts
 * import { createBotFromEnv, handleVercel, session, z, axios } from "../deps.ts";
 * ```
 *
 * ─── Popular Deno-compatible Libraries ───────────────────────────────────────
 *
 * | Library        | Deno URL                                              |
 * |----------------|-------------------------------------------------------|
 * | zod            | https://deno.land/x/zod/mod.ts                        |
 * | axiod (axios)  | https://deno.land/x/axiod/mod.ts                      |
 * | dotenv         | https://deno.land/std/dotenv/mod.ts                   |
 * | oak (HTTP)     | https://deno.land/x/oak/mod.ts                        |
 * | lodash         | https://deno.land/x/lodash/mod.ts                     |
 * | dayjs          | https://deno.land/x/deno_dayjs/mod.ts                 |
 * | std/log        | https://deno.land/std/log/mod.ts                      |
 * | grammY session | https://deno.land/x/grammy/mod.ts (built-in)          |
 * | grammY hydrate | https://deno.land/x/grammy_hydrate/mod.ts             |
 * | grammY limiter | https://deno.land/x/grammy_ratelimiter/mod.ts         |
 * | grammY i18n    | https://deno.land/x/grammy_i18n/mod.ts                |
 * | grammY menu    | https://deno.land/x/grammy_menu/mod.ts                |
 * | grammY files   | https://deno.land/x/grammy_files/mod.ts               |
 * | grammY parse   | https://deno.land/x/grammy_parse_mode/mod.ts          |
 * └────────────────┴───────────────────────────────────────────────────────┘
 */

// ─── Re-export everything from grammY ────────────────────────────────────────
export * from "https://deno.land/x/grammy/mod.ts";

// ─── Core imports ────────────────────────────────────────────────────────────
import {
  Bot,
  webhookCallback,
  type BotConfig,
  type Context,
} from "https://deno.land/x/grammy/mod.ts";

// ─── Types ───────────────────────────────────────────────────────────────────

/** Options for configuring the tgrammY edge handler */
export interface TgrammYOptions<C extends Context = Context> {
  /** grammY BotConfig to pass to the Bot constructor */
  botConfig?: BotConfig<C>;
  /**
   * Secret token to validate incoming Telegram webhook requests.
   * Set the same value in Telegram via setWebhook's `secret_token` param.
   */
  secretToken?: string;
  /** Custom JSON payload returned on GET health-check requests */
  healthPayload?: Record<string, unknown>;
  /** Called on any unhandled error inside the webhook handler */
  onError?: (error: unknown, req: Request) => Response | Promise<Response>;
}

/** Metadata returned by the health-check endpoint */
export interface HealthResponse {
  status: "online";
  engine: "tgrammY-edge";
  version: string;
  message: string;
  uptime: number;
  timestamp: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const VERSION = "2.0.0";

const DEFAULT_HEALTH: HealthResponse = {
  status: "online",
  engine: "tgrammY-edge",
  version: VERSION,
  message: "Function is warm and ready 🚀",
  uptime: 0,
  timestamp: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a JSON Response with proper headers.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Powered-By": "tgrammY-edge",
    },
  });
}

/**
 * Validate the `X-Telegram-Bot-Api-Secret-Token` header when a secret is set.
 * Returns `true` if valid (or no secret configured), `false` otherwise.
 */
function isValidSecret(req: Request, secret?: string): boolean {
  if (!secret) return true;
  const header = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
  return header === secret;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Create a grammY Bot instance with built-in token validation.
 *
 * @param token   - Your Telegram Bot token (from @BotFather)
 * @param config  - Optional grammY BotConfig
 *
 * @example
 * ```ts
 * const bot = createBot(Deno.env.get("BOT_TOKEN")!);
 * ```
 */
export function createBot<C extends Context = Context>(
  token: string,
  config?: BotConfig<C>,
): Bot<C> {
  if (!token || typeof token !== "string" || token.trim() === "") {
    throw new Error(
      "[tgrammY] CRITICAL: BOT_TOKEN is missing or invalid. " +
        "Pass it via Deno.env.get('BOT_TOKEN').",
    );
  }
  return new Bot<C>(token.trim(), config);
}

/**
 * Create a Vercel-compatible edge handler for your grammY bot.
 *
 * Handles:
 *  - **GET**  → health-check / keep-alive endpoint
 *  - **POST** → Telegram webhook (with optional secret validation)
 *  - **Other** → 405 Method Not Allowed
 *
 * @param bot     - A grammY Bot instance (from `createBot`)
 * @param options - Optional configuration
 *
 * @example
 * ```ts
 * export default handleVercel(bot, {
 *   secretToken: Deno.env.get("WEBHOOK_SECRET"),
 * });
 * ```
 */
export function handleVercel<C extends Context = Context>(
  bot: Bot<C>,
  options: TgrammYOptions<C> = {},
): (req: Request) => Promise<Response> {
  const { secretToken, healthPayload, onError } = options;

  // Build the grammY webhook callback once (not on every request)
  const webhookHandler = webhookCallback(bot, "std/http");

  return async (req: Request): Promise<Response> => {
    // ── GET: health-check ──────────────────────────────────────────────────
    if (req.method === "GET") {
      const health: HealthResponse = {
        ...DEFAULT_HEALTH,
        uptime: performance.now(),
        timestamp: new Date().toISOString(),
        ...(healthPayload ?? {}),
      };
      return jsonResponse(health, 200);
    }

    // ── POST: Telegram webhook ─────────────────────────────────────────────
    if (req.method === "POST") {
      // Secret token validation
      if (!isValidSecret(req, secretToken)) {
        return jsonResponse({ error: "Unauthorized: invalid secret token" }, 403);
      }

      try {
        return await webhookHandler(req);
      } catch (error) {
        console.error("[tgrammY] Webhook error:", error);

        if (onError) {
          try {
            return await onError(error, req);
          } catch {
            // fall through to default error response
          }
        }

        return jsonResponse(
          { error: "Internal Server Error", engine: "tgrammY-edge" },
          500,
        );
      }
    }

    // ── Other methods ──────────────────────────────────────────────────────
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET, POST" },
    });
  };
}

/**
 * Convenience helper: reads BOT_TOKEN from the environment and creates a bot.
 * Throws if the env variable is not set.
 *
 * @example
 * ```ts
 * const bot = createBotFromEnv(); // reads Deno.env.get("BOT_TOKEN")
 * ```
 */
export function createBotFromEnv<C extends Context = Context>(
  config?: BotConfig<C>,
): Bot<C> {
  const token = Deno.env.get("BOT_TOKEN");
  if (!token) {
    throw new Error(
      "[tgrammY] BOT_TOKEN environment variable is not set. " +
        "Add it to your Vercel project settings.",
    );
  }
  return createBot<C>(token, config);
}
