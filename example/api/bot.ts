import { createBotFromEnv, handleVercel, InlineKeyboard } from "../deps.ts";

const bot = createBotFromEnv();

bot.command("start", async (ctx) => {
  const kb = new InlineKeyboard()
    .url("⭐ Star on GitHub", "https://github.com/iSreyanshu/tgrammY")
    .row()
    .url("👨‍💻 Developer", "https://github.com/iSreyanshu");

  await ctx.reply(
    `👋 *Welcome!* Bot is running on *Vercel* powered by *tgrammY*\n\nSend me any message and I'll echo it back.`,
    { parse_mode: "Markdown", reply_markup: kb },
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    `*Available Commands:*\n\n` +
      `/start - Welcome message\n` +
      `/help - Show this help message\n` +
      `/ping - Check bot latency`,
    { parse_mode: "Markdown" },
  );
});

bot.command("ping", async (ctx) => {
  const start = Date.now();
  const msg = await ctx.reply("🏓 Pinging...");
  const latency = Date.now() - start;
  await ctx.api.editMessageText(
    ctx.chat.id,
    msg.message_id,
    `🏓 Pong! Latency: *${latency}ms*`,
    { parse_mode: "Markdown" },
  );
});

bot.on("message:text", async (ctx) => {
  await ctx.reply(`📨 You said: *${ctx.message.text}*`, {
    parse_mode: "Markdown",
  });
});

export default handleVercel(bot, {
  secretToken: Deno.env.get("WEBHOOK_SECRET"),
});
