const {
  Client,
  GatewayIntentBits,
  Partials,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ActivityType
} = require("discord.js");

const { joinVoiceChannel } = require("@discordjs/voice");
const fs = require("fs");
const express = require("express");
const config = require("./config");

// ===== CONFIG =====
const AUTO_VOICE_CHANNEL_ID = "1449137022244491304";

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
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates
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

// ===== Ready =====
client.once("ready", async () => {
  await rest.put(
    Routes.applicationCommands(config.CLIENT_ID),
    { body: commands }
  );

  // Custom Status
  client.user.setPresence({
    activities: [
      {
        name: "ทำงานให้ หัวหน้า ซีม่อน <a:emoji_2:1449148118690959440>",
        type: ActivityType.Custom
      }
    ],
    status: "online"
  });

  // Auto join voice
  const channel = await client.channels.fetch(AUTO_VOICE_CHANNEL_ID).catch(() => null);
  if (channel) {
    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false
    });
  }

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

  let data = Object.values(db).find(d => d.channelId === i.channel.id);
  let message;

  if (!data) {
    const embed = new EmbedBuilder()
      .setColor(0xffc0cb)
      .setDescription("🎭 กดอิโมจิรับยศ (กำลังตั้งค่า...)");

    message = await i.channel.send({ embeds: [embed] });

    data = {
      messageId: message.id,
      channelId: i.channel.id,
      roles: {},
      users: {}
    };
    db[message.id] = data;
  } else {
    message = await i.channel.messages.fetch(data.messageId);
  }

  data.roles[emoji] = role.id;
  saveDB(db);

  await message.react(emoji);

  // ===== Build Embed =====
  let desc =
`🎭 กดอิโมจิรับยศ (1 คน / 1 ยศ)

╭┈ ✧ : รับยศตกแต่ง ˗ˏˋ꒰ 🍒 ꒱
`;

  for (const [em, r] of Object.entries(data.roles)) {
    desc += ` | ${em}・<@&${r}>\n`;
  }

  desc +=
`╰ ┈ ✧ : กดอิโมจิถอนยศก่อนนะคะ ┆ • ➵ BY Zemon Źx 🦄`;

  const embed = new EmbedBuilder()
    .setColor(0xffc0cb)
    .setDescription(desc);

  await message.edit({ embeds: [embed] });

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

  // ❌ มี role อยู่แล้ว
  if (data.users[user.id]) {
    await reaction.users.remove(user.id).catch(() => {});

    const warn = await reaction.message.channel.send(
      `<@${user.id}> คุณได้รับยศ <@&${data.users[user.id]}> ไปแล้ว\nกรุณากดอิโมจิเดิมเพื่อถอนยศ และเลือกใหม่คะ`
    );

    setTimeout(() => warn.delete().catch(() => {}), 5000);
    return;
  }

  // ✅ ให้ยศ
  await member.roles.add(roleId).catch(() => {});
  data.users[user.id] = roleId;
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
  saveDB(db);
});

client.login(config.TOKEN)
