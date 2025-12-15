
const {
  Client,
  GatewayIntentBits,
  Partials,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const fs = require("fs");
const express = require("express");
const config = require("./config");

const app = express();
app.get("/", (_, res) => res.send("Bot is alive"));
app.listen(8080);

const DB_PATH = "./reactionRoles.json";
const loadDB = () => JSON.parse(fs.readFileSync(DB_PATH));
const saveDB = (data) =>
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const commands = [
  new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("ตั้งค่ากดอิโมจิรับยศ (เจ้าของเซิฟเท่านั้น)")
    .addStringOption(o =>
      o.setName("message_id").setDescription("ไอดีข้อความ").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("emoji").setDescription("อิโมจิ").setRequired(true)
    )
    .addRoleOption(o =>
      o.setName("role").setDescription("ยศ").setRequired(true)
    )
];

const rest = new REST({ version: "10" }).setToken(config.TOKEN);

client.once("ready", async () => {
  await rest.put(
    Routes.applicationCommands(config.CLIENT_ID),
    { body: commands }
  );
  console.log("Bot ready");
});

client.on("interactionCreate", async (i) => {
  if (!i.isChatInputCommand()) return;
  if (i.commandName !== "reactionrole") return;

  if (i.guild.ownerId !== i.user.id) {
    return i.reply({ content: "❌ ใช้ได้เฉพาะเจ้าของเซิฟ", ephemeral: true });
  }

  const msgId = i.options.getString("message_id");
  const emoji = i.options.getString("emoji");
  const role = i.options.getRole("role");

  const msg = await i.channel.messages.fetch(msgId).catch(() => null);
  if (!msg) return i.reply({ content: "❌ ไม่เจอข้อความ", ephemeral: true });

  const db = loadDB();
  if (!db[msgId]) {
    db[msgId] = { roles: {}, users: {}, roleOwners: {} };
  }

  db[msgId].roles[emoji] = role.id;
  saveDB(db);

  await msg.react(emoji);

  let text = "**🎭 กดอิโมจิรับยศ (1 คน / 1 ยศ)**\n";
  for (const [em, r] of Object.entries(db[msgId].roles)) {
    text += `${em} ➜ <@&${r}>\n`;
  }

  await msg.edit(text);
  await i.reply({ content: "✅ เพิ่มเรียบร้อย", ephemeral: true });
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const db = loadDB();
  const data = db[reaction.message.id];
  if (!data) return;

  const emojiKey = reaction.emoji.toString();
  const roleId = data.roles[emojiKey];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);

  if (data.users[user.id]) {
    reaction.users.remove(user.id).catch(() => {});
    user.send("❌ คุณมียศอยู่แล้ว ถอนก่อนถึงเลือกใหม่ได้")
      .then(m => setTimeout(() => m.delete().catch(() => {}), 10000))
      .catch(() => {});
    return;
  }

  if (data.roleOwners[roleId]) {
    reaction.users.remove(user.id).catch(() => {});
    user.send("❌ ยศนี้มีคนเลือกไปแล้ว")
      .then(m => setTimeout(() => m.delete().catch(() => {}), 10000))
      .catch(() => {});
    return;
  }

  await member.roles.add(roleId).catch(() => {});
  data.users[user.id] = roleId;
  data.roleOwners[roleId] = user.id;
  saveDB(db);
});

client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const db = loadDB();
  const data = db[reaction.message.id];
  if (!data) return;

  const emojiKey = reaction.emoji.toString();
  const roleId = data.roles[emojiKey];
  if (!roleId) return;

  if (data.users[user.id] !== roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.remove(roleId).catch(() => {});

  delete data.users[user.id];
  delete data.roleOwners[roleId];
  saveDB(db);
});

client.login(config.TOKEN);
