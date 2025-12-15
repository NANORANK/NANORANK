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

// ===== Keep Alive =====
const app = express();
app.get("/", (_, res) => res.send("Bot is alive"));
app.listen(8080);

// ===== JSON DB =====
const DB_PATH = "./reactionRoles.json";
const loadDB = () => JSON.parse(fs.readFileSync(DB_PATH));
const saveDB = (data) =>
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// ===== Discord Client =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ===== Slash Command =====
const commands = [
  new SlashCommandBuilder()
    .setName("rr")
    .setDescription("Reaction Role System")
    .addSubcommand(s =>
      s.setName("create")
        .setDescription("เพิ่มอิโมจิรับยศ (บอทสร้างข้อความให้เอง)")
        .addStringOption(o =>
          o.setName("emoji").setDescription("อิโมจิ").setRequired(true)
        )
        .addRoleOption(o =>
          o.setName("role").setDescription("ยศ").setRequired(true)
        )
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

// ===== Command Logic =====
client.on("interactionCreate", async (i) => {
  if (!i.isChatInputCommand()) return;
  if (i.commandName !== "rr") return;

  if (i.guild.ownerId !== i.user.id) {
    return i.reply({ content: "❌ ใช้ได้เฉพาะเจ้าของเซิฟ", ephemeral: true });
  }

  if (i.options.getSubcommand() !== "create") return;

  const emoji = i.options.getString("emoji");
  const role = i.options.getRole("role");

  const db = loadDB();

  // 1 ห้อง = 1 ข้อความ reaction role
  let data = Object.values(db).find(
    d => d.channelId === i.channel.id
  );

  let message;

  // ถ้ายังไม่มี → สร้างใหม่
  if (!data) {
    message = await i.channel.send("🎭 กดอิโมจิรับยศ");
    data = {
      messageId: message.id,
      channelId: i.channel.id,
      roles: {},
      users: {},
      roleOwners: {}
    };
    db[message.id] = data;
  } else {
    message = await i.channel.messages.fetch(data.messageId);
  }

  data.roles[emoji] = role.id;
  saveDB(db);

  await message.react(emoji);

  let text = "**🎭 กดอิโมจิรับยศ (1 คน / 1 ยศ)**\n";
  for (const [em, r] of Object.entries(data.roles)) {
    text += `${em} ➜ <@&${r}>\n`;
  }

  await message.edit(text);

  await i.reply({ content: "✅ เพิ่ม Reaction Role แล้ว", ephemeral: true });
});

// ===== Reaction Add =====
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

  // มี role อยู่แล้ว
  if (data.users[user.id]) {
    reaction.users.remove(user.id).catch(() => {});
    user.send(
      `❌ คุณได้รับยศ <@&${data.users[user.id]}> แล้ว\n` +
      `กรุณาถอนยศเดิมก่อนเพื่อเลือกใหม่`
    ).then(m => setTimeout(() => m.delete().catch(() => {}), 10000))
     .catch(() => {});
    return;
  }

  // role ถูกครอบแล้ว
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

// ===== Reaction Remove =====
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
