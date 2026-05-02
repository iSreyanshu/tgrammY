/**
 * deps.ts — Central dependency file
 *
 * ✅ Best practice for Deno projects:
 *    Keep ALL external URLs here and import from this file everywhere else.
 *    To upgrade a library, change the URL in ONE place.
 *
 * Usage in your bot:
 *   import { createBotFromEnv, handleVercel, session, z } from "../deps.ts";
 */

// ─── tgrammY (includes full grammY re-export) ────────────────────────────────
export * from "https://raw.githubusercontent.com/iSreyanshu/tgrammY/app/edge.ts";

// ─── grammY Plugins ──────────────────────────────────────────────────────────
// Uncomment what you need:

// Sessions (built-in grammY, free storage)
// export { session, type SessionFlavor } from "https://deno.land/x/grammy/mod.ts";

// Hydrate — makes message objects have helper methods
// export { hydrate, hydrateApi, type HydrateApiFlavor, type HydrateFlavor }
//   from "https://deno.land/x/grammy_hydrate/mod.ts";

// Rate limiter — prevent spam
// export { limit } from "https://deno.land/x/grammy_ratelimiter/mod.ts";

// Auto-quote — auto reply to the triggering message
// export { autoQuote } from "https://deno.land/x/grammy_autoquote/mod.ts";

// Interactive menus
// export { Menu } from "https://deno.land/x/grammy_menu/mod.ts";

// i18n / multi-language support
// export { I18n, type I18nFlavor } from "https://deno.land/x/grammy_i18n/mod.ts";

// File handling (upload/download helpers)
// export { FileFlavor, hydrateFiles } from "https://deno.land/x/grammy_files/mod.ts";

// Parse mode helpers (bold, italic shortcuts)
// export { bold, fmt, hydrateReply, type ParseModeFlavor }
//   from "https://deno.land/x/grammy_parse_mode/mod.ts";

// Conversations (multi-step flows)
// export { conversations, createConversation, type ConversationFlavor }
//   from "https://deno.land/x/grammy_conversations/mod.ts";

// ─── Validation ──────────────────────────────────────────────────────────────

// Zod — schema validation
// export { z } from "https://deno.land/x/zod/mod.ts";

// ─── HTTP Client ─────────────────────────────────────────────────────────────

// Axiod — axios-compatible HTTP client for Deno
// export { default as axios } from "https://deno.land/x/axiod/mod.ts";

// ─── Utilities ───────────────────────────────────────────────────────────────

// Deno standard library — logging
// export * as log from "https://deno.land/std/log/mod.ts";

// Deno standard library — dotenv (load .env file locally)
// export { load as loadEnv } from "https://deno.land/std/dotenv/mod.ts";

// Day.js — date/time manipulation
// export { default as dayjs } from "https://deno.land/x/deno_dayjs/mod.ts";

// Lodash — utility functions
// export { default as _ } from "https://deno.land/x/lodash/mod.ts";
