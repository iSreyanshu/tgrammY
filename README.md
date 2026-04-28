# tgrammY-edge

The most efficient way to run **grammY** bots on **Vercel** using the **Deno** runtime. Designed for 24/7 availability and zero cold starts.

## ✨ Features
- **Zero Configuration**: No `package.json` or `node_modules` needed.
- **Full grammY Support**: Exporting all of grammY's features.
- **Auto-Warmup**: Built-in GET handler to keep your serverless function "awake".
- **Edge Performance**: Powered by Deno for ultra-fast response times.

---

## Project Structure (User Setup)
To use this your repository should look like this:
```text
├── api/
│   └── bot.ts       <-- Bot Logic
└── vercel.json      <-- Vercel Configuration
```
example: [api/bot.ts](https://github.com/iSreyanshu/tgrammY/blob/app/example/api/bot.ts), [vercel.json](https://github.com/iSreyanshu/tgrammY/blob/app/example/vercel.json)

## Setup Webhook
Connect your bot to Vercel by visiting this URL in your browser:
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://yourapp.vercel.app/

## The 24/7 Trick
Vercel functions usually go to sleep after inactivity. To keep your bot "warm" and responsive 24/7:

Use a free service like Cron-job.org

Create a monitor that pings your Vercel URL (https://yourapp.vercel.app/) every 5 minutes.

Since our library has a built-in GET handler, it will respond with a status code 200, keeping the instance active without triggering a Telegram error.
