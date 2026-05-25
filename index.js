const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Bot is running!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});
const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

client.once("ready", () => {
    console.log(`${client.user.tag} 起動完了`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith("!ai ")) return;

    const prompt = message.content.slice(4);

    try {
        await message.channel.sendTyping();

        const response =
            await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });

        let text =
            response.choices[0].message.content;

        if (!text)
            text = "応答がありませんでした";

        if (text.length <= 2000) {
            await message.reply(text);
        } else {
            for (
                let i = 0;
                i < text.length;
                i += 1900
            ) {
                await message.channel.send(
                    text.slice(i, i + 1900)
                );
            }
        }
    } catch (err) {
        console.error(err);

        await message.reply(
            "エラーが発生しました。"
        );
    }
});

client.login(process.env.DISCORD_TOKEN);
