export * from "https://deno.land/x/grammy/mod.ts";

import {
  Bot,
  webhookCallback,
  type BotConfig,
  type Context,
} from "https://deno.land/x/grammy/mod.ts";


export interface TgrammYOptions<C extends Context = Context> {
  botConfig?: BotConfig<C>;
  secretToken?: string;
  healthPayload?: Record<string, unknown>;
  onError?: (error: unknown, req: Request) => Response | Promise<Response>;
}

export interface HealthResponse {
  status: "online";
  engine: "tgrammY-edge";
  version: string;
  message: string;
  uptime: number;
  timestamp: string;
}

const VERSION = "0.2.0";
const DEFAULT_HEALTH: HealthResponse = {
  status: "online",
  engine: "tgrammY-edge",
  version: VERSION,
  message: "System ready!",
  uptime: 0,
  timestamp: "",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Powered-By": "tgrammY-edge",
    },
  });
}

function isValidSecret(req: Request, secret?: string): boolean {
  if (!secret) return true;
  const header = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
  return header === secret;
}

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

export function handleVercel<C extends Context = Context>(
  bot: Bot<C>,
  options: TgrammYOptions<C> = {},
): (req: Request) => Promise<Response> {
  const { secretToken, healthPayload, onError } = options;
  const webhookHandler = webhookCallback(bot, "std/http");

  return async (req: Request): Promise<Response> => {
    if (req.method === "GET") {
      const health: HealthResponse = {
        ...DEFAULT_HEALTH,
        uptime: performance.now(),
        timestamp: new Date().toISOString(),
        ...(healthPayload ?? {}),
      };
      return jsonResponse(health, 200);
    }

    if (req.method === "POST") {
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
          }
        }

        return jsonResponse(
          { error: "Internal Server Error", engine: "tgrammY-edge" },
          500,
        );
      }
    }

    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET, POST" },
    });
  };
}

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
