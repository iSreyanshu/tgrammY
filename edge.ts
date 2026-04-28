/**
 * tgrammY-edge: a custom wrapper for running grammY bots on Vercel via Deno.
 */

// exporting everything from grammY so users can access all features
export * from "https://deno.land/x/grammy/mod.ts";
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";

/**
 * @param token: Telegram BOT_Token
 */
export function createBot(token: string) {
  if (!token) throw new Error("CRITICAL_ERROR: BOT_TOKEN Is Missing!");
  return new Bot(token);
}

export function handleVercel(bot: Bot) {
  return async (req: Request) => {
    const url = new URL(req.url);
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "online",
          engine: "tgrammY-edge",
          message: "Function is warm and ready.",
          uptime: performance.now()
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    if (req.method === "POST") {
      try {
        const callback = webhookCallback(bot, "std/http");
        return await callback(req);
      } catch (error) {
        console.error("Webhook Error:", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    }

    return new Response("Method Not Allowed", { status: 405 });
  };
}
