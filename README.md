<div align="center">

# grammY

**The fastest way to run [grammY](https://grammy.dev) Telegram bots on [Vercel](https://vercel.com) powered by Deno Edge.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Deno](https://img.shields.io/badge/Runtime-Deno-black?style=flat-square&logo=deno)](https://deno.land)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![grammY](https://img.shields.io/badge/Powered%20by-grammY-blue?style=flat-square)](https://grammy.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

</div>

---

## <img src="https://raw.githubusercontent.com/iSreyanshu/grammY/app/assets/turtle-banner.png" width="80" align="center" /> Quick Start

### 1. Project Structure

Set up your Vercel project like this:

```
your-bot/
├── api/
│   └── bot.ts        ← Your bot logic
└── vercel.json       ← Vercel config
```

### 2. `vercel.json`

```json
{
  "functions": {
    "api/*.ts": {
      "runtime": "vercel-deno@2.1.0"
    }
  },
  "rewrites": [
    { "source": "/(.*)", "destination": "/api/bot" }
  ]
}
```

### 3. `api/bot.ts`

```typescript
import {
  createBotFromEnv,
  handleVercel,
  InlineKeyboard,
} from "https://raw.githubusercontent.com/iSreyanshu/tgrammY/app/edge.ts";

const bot = createBotFromEnv(); // reads BOT_TOKEN from env

bot.command("start", async (ctx) => {
  const kb = new InlineKeyboard()
    .url("⭐ Star on GitHub", "https://github.com/iSreyanshu/tgrammY");

  await ctx.reply("👋 Hello from Vercel Edge!", { reply_markup: kb });
});

bot.on("message:text", (ctx) => ctx.reply(`You said: ${ctx.message.text}`));

export default handleVercel(bot, {
  secretToken: Deno.env.get("WEBHOOK_SECRET"), // optional but recommended
});
```

### 4. Set Environment Variables on Vercel

Go to your Vercel project → **Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `BOT_TOKEN` | Your token from [@BotFather](https://t.me/BotFather) |
| `WEBHOOK_SECRET` | Any random secret string *(optional)* |

### 5. Deploy & Set Webhook

After deploying, register your webhook with Telegram:

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://yourapp.vercel.app/
```

With secret token (recommended):

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://yourapp.vercel.app/&secret_token=<YOUR_WEBHOOK_SECRET>
```

---

## 📖 API Reference

### `createBot(token, config?)`

Creates a grammY `Bot` instance with built-in token validation.

```typescript
import { createBot } from "https://raw.githubusercontent.com/iSreyanshu/tgrammY/app/edge.ts";

const bot = createBot("123456:ABC-DEF...");
```

| Param | Type | Description |
|---|---|---|
| `token` | `string` | Telegram bot token |
| `config` | `BotConfig` *(optional)* | grammY bot config |

---

### `createBotFromEnv(config?)`

Reads `BOT_TOKEN` from `Deno.env` automatically. Throws if not set.

```typescript
const bot = createBotFromEnv();
```

---

### `handleVercel(bot, options?)`

Returns a Vercel-compatible edge handler function.

```typescript
export default handleVercel(bot, {
  secretToken: Deno.env.get("WEBHOOK_SECRET"),
  healthPayload: { region: "iad1" },
  onError: (err, req) => new Response("oops", { status: 500 }),
});
```

| Option | Type | Description |
|---|---|---|
| `secretToken` | `string` | Validates `X-Telegram-Bot-Api-Secret-Token` header |
| `healthPayload` | `object` | Extra fields merged into the GET health response |
| `onError` | `function` | Custom error handler for webhook failures |
| `botConfig` | `BotConfig` | grammY bot config (passed to constructor) |

**Handled routes:**

| Method | Behavior |
|---|---|
| `GET` | Returns JSON health-check (great for uptime monitors) |
| `POST` | Processes Telegram webhook update |
| Other | `405 Method Not Allowed` |

---

## 💡 Health Check Response

Hitting your deployment URL with a `GET` request returns:

```json
{
  "status": "online",
  "engine": "tgrammY-edge",
  "version": "2.0.0",
  "message": "Function is warm and ready 🚀",
  "uptime": 1234.56,
  "timestamp": "2026-05-02T10:00:00.000Z"
}
```

---

## ⏰ 24/7 Keep-Alive (Free)

Vercel serverless functions sleep after inactivity. Keep your bot always responsive:

1. Go to **[cron-job.org](https://cron-job.org)** (free)
2. Create a new cron job pointing to `https://yourapp.vercel.app/`
3. Set interval to **every 5 minutes**

The built-in `GET` handler responds with `200 OK` — keeping the function warm without triggering any Telegram errors.

---

## 🔐 Security: Secret Token

Protect your webhook from unauthorized requests:

**Step 1** — Set `WEBHOOK_SECRET` in Vercel env vars.

**Step 2** — Register webhook with the secret:

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://yourapp.vercel.app/&secret_token=<SECRET>
```

**Step 3** — Pass it to `handleVercel`:

```typescript
export default handleVercel(bot, {
  secretToken: Deno.env.get("WEBHOOK_SECRET"),
});
```

tgrammY will automatically reject any request that doesn't include the correct `X-Telegram-Bot-Api-Secret-Token` header with a `403 Forbidden`.

---

## 🧩 Full grammY Support

tgrammY re-exports **everything** from grammY, so you can use the full API:

```typescript
import {
  Bot,
  Context,
  InlineKeyboard,
  Keyboard,
  session,
  type SessionFlavor,
  GrammyError,
  HttpError,
} from "https://raw.githubusercontent.com/iSreyanshu/tgrammY/app/edge.ts";
```

---

## 📦 Using Extra Libraries

The cleanest way to add extra Deno libraries is the **`deps.ts` pattern** — one central file for all your imports.

### Project structure with deps.ts

```
your-bot/
├── api/
│   └── bot.ts        ← imports from ../deps.ts
├── deps.ts           ← ALL external URLs live here
└── vercel.json
```

### `deps.ts`

```typescript
// ── tgrammY (includes full grammY re-export) ──
export * from "https://raw.githubusercontent.com/iSreyanshu/tgrammY/app/edge.ts";

// ── grammY plugins ──
export { Menu }                          from "https://deno.land/x/grammy_menu/mod.ts";
export { conversations, createConversation, type ConversationFlavor }
                                         from "https://deno.land/x/grammy_conversations/mod.ts";
export { limit }                         from "https://deno.land/x/grammy_ratelimiter/mod.ts";

// ── Validation ──
export { z }                             from "https://deno.land/x/zod/mod.ts";

// ── HTTP client ──
export { default as axios }              from "https://deno.land/x/axiod/mod.ts";

// ── Utilities ──
export { default as dayjs }              from "https://deno.land/x/deno_dayjs/mod.ts";
```

### `api/bot.ts`

```typescript
// ✅ One import line — everything comes from deps.ts
import { createBotFromEnv, handleVercel, Menu, z, axios } from "../deps.ts";
```

**Why `deps.ts`?**
- URLs live in **one place** — upgrade a library by changing one line
- No duplicate URLs scattered across files
- Easy to audit what your project depends on

### Popular Deno-compatible Libraries

| Library | Deno URL |
|---|---|
| **zod** (validation) | `https://deno.land/x/zod/mod.ts` |
| **axiod** (axios-like HTTP) | `https://deno.land/x/axiod/mod.ts` |
| **dotenv** | `https://deno.land/std/dotenv/mod.ts` |
| **dayjs** (dates) | `https://deno.land/x/deno_dayjs/mod.ts` |
| **lodash** | `https://deno.land/x/lodash/mod.ts` |
| **std/log** | `https://deno.land/std/log/mod.ts` |
| **grammY menu** | `https://deno.land/x/grammy_menu/mod.ts` |
| **grammY conversations** | `https://deno.land/x/grammy_conversations/mod.ts` |
| **grammY rate limiter** | `https://deno.land/x/grammy_ratelimiter/mod.ts` |
| **grammY i18n** | `https://deno.land/x/grammy_i18n/mod.ts` |
| **grammY hydrate** | `https://deno.land/x/grammy_hydrate/mod.ts` |
| **grammY files** | `https://deno.land/x/grammy_files/mod.ts` |
| **grammY parse mode** | `https://deno.land/x/grammy_parse_mode/mod.ts` |

---

## 📁 Example Files

- [`example/deps.ts`](example/deps.ts) — Central dependency file (start here)
- [`example/api/bot.ts`](example/api/bot.ts) — Full example bot
- [`example/vercel.json`](example/vercel.json) — Vercel configuration

---

## 📜 License

[MIT](LICENSE) © [iSreyanshu](https://github.com/iSreyanshu)

---

<div align="center">

Made with ❤️ for the Telegram bot community

**[⭐ Star this repo](https://github.com/iSreyanshu/tgrammY)** if it helped you!

</div>
