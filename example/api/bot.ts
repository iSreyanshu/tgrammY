import { createBot, handleVercel, InlineKeyboard } from "https://raw.githubusercontent.com/iSreyanshu/tgrammY/app/edge.ts";

const token = "12345:xxxxxxx";
const bot = createBot(token);

bot.command("start", (ctx) => {
  const kb = new InlineKeyboard().url("Developer", "https://github.com/iSreyanshu");
  return ctx.reply("Welcome! Bot is running Vercel Edge!", { reply_markup: kb });
});

bot.on("message:text", (ctx) => ctx.reply(`You sent: ${ctx.message.text}`));

export default handleVercel(bot);
