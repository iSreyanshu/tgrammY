# 🚀 grammY-edge

The fastest and most efficient way to run **grammY** bots on **Vercel** using the **Deno** runtime. Designed for 24/7 availability and zero cold starts.

## ✨ Features
- **Zero Configuration**: No `package.json` or `node_modules` needed.
- **Full grammY Support**: Exporting 100% of grammY's features (A-Z).
- **Auto-Warmup**: Built-in GET handler to keep your serverless function "awake".
- **Edge Performance**: Powered by Deno for ultra-fast response times.

---

## 🛠 Project Structure (User Setup)
To use this library, your repository should look like this:
```text
├── api/
│   └── bot.ts       <-- Your bot logic
└── vercel.json      <-- Vercel configuration
```

🚀 Deployment Guide
1. Create your Bot (api/bot.ts)
Copy the code below. Replace the import URL with your raw GitHub link.

TypeScript
import { createBot, handleVercel, InlineKeyboard } from "[https://raw.githubusercontent.com/YOUR_USER/grammY-edge/master/mod.ts](https://raw.githubusercontent.com/YOUR_USER/grammY-edge/master/mod.ts)";

const token = Deno.env.get("BOT_TOKEN") || "";
const bot = createBot(token);

// Full grammY features are available here
bot.command("start", (ctx) => {
  const kb = new InlineKeyboard().url("Developer", "[https://github.com/YOUR_USER](https://github.com/YOUR_USER)");
  return ctx.reply("⚡ Bot is running 24/7 on Vercel Edge!", { reply_markup: kb });
});

bot.on("message", (ctx) => ctx.reply(`You sent: ${ctx.message.text}`));

// Export the handler for Vercel
export default handleVercel(bot);
2. Vercel Configuration (vercel.json)
This file tells Vercel to use the Deno runtime.

JSON
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
3. Environment Variables
In your Vercel Dashboard, go to Settings > Environment Variables and add:

BOT_TOKEN: Your Telegram Bot Token.

4. Set Webhook
Connect your bot to Vercel by visiting this URL in your browser:
https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-project.vercel.app/

⚡ The 24/7 Trick (Avoid Cold Starts)
Vercel functions usually go to sleep after inactivity. To keep your bot "warm" and responsive 24/7:

Use a free service like Cron-job.org or UptimeRobot.

Create a monitor that pings your Vercel URL (https://your-project.vercel.app/) every 5 minutes.

Since our library has a built-in GET handler, it will respond with a status code 200, keeping the instance active without triggering a Telegram error.
