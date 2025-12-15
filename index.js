const {
  Client,
  GatewayIntentBits,
  Partials,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ActivityType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");
const express = require("express");
const config = require("./config");

// ================== BASIC ==================
const SERVER_NAME = "xSwift Hub";
const SERVER_INVITE = "https://discord.gg/AYby9ypmyy";
const DB_PATH = "./reactionRoles.json";

// ================== KEEP ALIVE ==================
const app = express();
app.get("/", (_, res) => res.send("Bot alive"));
app.listen(8080);

// ================== DB ==================
const loadDB = () =>
  fs.existsSync(DB_PATH)
    ? JSON.parse(fs.readFileSync(DB_PATH, "utf8"))
    : {};

const saveDB = (data) =>
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// ================== TIME ==================
const tz = config.TIMEZONE || "Asia/Bangkok";

const thaiDate = d =>
  new Intl.DateTimeFormat("th-TH", {
    timeZone: tz,
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(d);

const thaiTime = d =>
  new Intl.DateTimeFormat("th-TH", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(d);

// ================== RR EMBED ==================
function buildRRMessage(data) {
  let desc =
` # 🎭 กดอิโมจิรับยศ (1 คน / 1 ยศ)
> - <a:emoji_10:1449150901628440767> คุณเลือกได้ 1 ยศ เท่านั้น
> - <a:emoji_19:1449151254189314150> จะเลือกยศใหม่ กดอิโมจิเดิมก่อนนะคะ
> - <a:emoji_34:1450185126901321892> เลือกรับยศใหม่ได้เลย
> - <a:emoji_35:1450185285613650020> กดเกิน 1 อัน บอทจะ DM แจ้งเตือน
# ╭┈ ✧ : รับยศตกแต่ง ˗ˏˋ꒰ <a:emoji_2:1449148118690959440> ꒱
`;
  for (const [emoji, roleId] of Object.entries(data.roles)) {
    desc += ` | ${emoji}・<@&${roleId}>\n`;
  }
  desc +=
`# ╰ ┈ ✧ : รับยศตกแต่งฟรี 🐼 ┆ • ➵ BY Zemon Źx`;

  return new EmbedBuilder()
    .setColor(0xffc0cb)
    .setDescription(desc);
}

// ================== CLIENT ==================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ================== COMMANDS ==================
const commands = [
  new SlashCommandBuilder()
    .setName("rr")
    .setDescription("Reaction Role System")
    .addSubcommand(s =>
      s.setName("add")
        .setDescription("เพิ่มอิโมจิ + ยศ")
        .addStringOption(o =>
          o.setName("emoji").setDescription("อิโมจิ").setRequired(true)
        )
        .addRoleOption(o =>
          o.setName("role").setDescription("ยศ").setRequired(true)
        )
    )
    .addSubcommand(s =>
      s.setName("remove")
        .setDescription("ลบอิโมจิ + ยศ")
        .addStringOption(o =>
          o.setName("emoji").setDescription("อิโมจิ").setRequired(true)
        )
        .addRoleOption(o =>
          o.setName("role").setDescription("ยศ").setRequired(true)
        )
    )
    .addSubcommand(s =>
      s.setName("list")
        .setDescription("เปิด Panel รายชื่อสมาชิกที่ถือยศ")
    )
];

const rest = new REST({ version: "10" }).setToken(config.TOKEN);

// ================== STATUS ==================
const statuses = [
  "🕵️ ทำงานให้ ซีม่อน อยู่ คะ",
  "💔 เหงาจับใจ",
  "💖 รัก ซีม่อน",
  "🥺 มีแค่เธอนะ เบบี๋",
  "👻 เรากลัวผีนะ",
  "🦋 ผีเสื้อราตรี",
  "🌧️ โรคกลัวฝน",
  "🟢 ออนไลน์ 24/7"
];
let statusIndex = 0;

// ================== READY ==================
client.once("ready", async () => {
  await rest.put(
    Routes.applicationCommands(config.CLIENT_ID),
    { body: commands }
  );

  setInterval(() => {
    client.user.setPresence({
      activities: [{ name: statuses[statusIndex], type: ActivityType.Custom }],
      status: "online"
    });
    statusIndex = (statusIndex + 1) % statuses.length;
  }, 2500);

  console.log("Bot ready");
});

// ================== INTERACTION ==================
client.on("interactionCreate", async (i) => {
  if (!i.isChatInputCommand()) return;
  if (i.commandName !== "rr") return;

  const db = loadDB();
  const sub = i.options.getSubcommand();

  if (sub === "add") {
    await i.deferReply({ ephemeral: true });

    const emoji = i.options.getString("emoji");
    const role = i.options.getRole("role");

    let data = Object.values(db).find(d => d.channelId === i.channel.id);
    let msg;

    if (!data) {
      msg = await i.channel.send({ embeds: [buildRRMessage({ roles: {} })] });
      data = { channelId: i.channel.id, messageId: msg.id, roles: {}, users: {} };
      db[msg.id] = data;
    } else {
      msg = await i.channel.messages.fetch(data.messageId);
    }

    data.roles[emoji] = role.id;
    saveDB(db);

    await msg.react(emoji).catch(() => {});
    await msg.edit({ embeds: [buildRRMessage(data)] });

    return i.editReply("✅ เพิ่มเรียบร้อย");
  }

  if (sub === "remove") {
    await i.deferReply({ ephemeral: true });

    const emoji = i.options.getString("emoji");
    const role = i.options.getRole("role");

    const data = Object.values(db).find(d => d.channelId === i.channel.id);
    if (!data || data.roles[emoji] !== role.id) {
      return i.editReply("❌ อิโมจิหรือยศไม่ตรง");
    }

    delete data.roles[emoji];
    saveDB(db);

    const msg = await i.channel.messages.fetch(data.messageId);
    await msg.edit({ embeds: [buildRRMessage(data)] });

    const react = msg.reactions.cache.find(r => r.emoji.toString() === emoji);
    if (react) await react.remove().catch(() => {});

    return i.editReply("🗑️ ลบเรียบร้อย");
  }

  if (sub === "list") {
    const members = await i.guild.members.fetch();
    const embed = new EmbedBuilder()
      .setColor(0x87cefa)
      .setTitle("# 📋 Panel : รายชื่อสมาชิกที่มียศตกแต่ง");

    members.forEach(m => {
      if (m.user.bot) return;

      let info;
      for (const d of Object.values(db)) {
        if (d.users?.[m.id]) info = d.users[m.id];
      }

      if (!info) {
        embed.addFields({
          name: `> - 🧑‍🧒‍🧒 ผู้ใช้ : <@${m.id}>`,
          value: " > - 🎐 ยศตกแต่ง : ยังไม่มียศ",
          inline: false
        });
      } else {
        const d = new Date(info.time);
        embed.addFields({
          name: `> - 🧑‍🧒‍🧒 ผู้ใช้ : <@${m.id}>`,
          value:
`> - 🎐 ยศตกแต่ง : ${info.emoji} ➜ <@&${info.roleId}>
> - 📅 วันที่ : ${thaiDate(d)}
> - ⏰ เวลา : ${thaiTime(d)}`,
          inline: false
        });
      }
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("rr_refresh")
        .setEmoji("<a:emoji_34:1450185227577196780>")
        .setLabel("รีเฟรช")
        .setStyle(ButtonStyle.Primary)
    );

    return i.reply({ embeds: [embed], components: [row] });
  }
});

// ================== BUTTON ==================
client.on("interactionCreate", async (i) => {
  if (!i.isButton()) return;
  if (i.customId !== "rr_refresh") return;

  const db = loadDB();
  const members = await i.guild.members.fetch();

  const embed = new EmbedBuilder()
    .setColor(0x87cefa)
    .setTitle(" # 📋 Panel : รายชื่อสมาชิกที่มียศตกแต่ง (อัปเดต)");

  members.forEach(m => {
    if (m.user.bot) return;

    let info;
    for (const d of Object.values(db)) {
      if (d.users?.[m.id]) info = d.users[m.id];
    }

    if (!info) {
      embed.addFields({
        name: ` > - 🧑‍🧒‍🧒 ผู้ใช้ : <@${m.id}>`,
        value: " > - 🎐 ยศตกแต่ง : ยังไม่มียศ",
        inline: false
      });
    } else {
      const d = new Date(info.time);
      embed.addFields({
        name: ` > - 🧑‍🧒‍🧒 ผู้ใช้ : <@${m.id}>`,
        value:
` > - 🎐 ยศตกแต่ง : ${info.emoji} ➜ <@&${info.roleId}>
> - 📅 วันที่ : ${thaiDate(d)}
> - ⏰ เวลา : ${thaiTime(d)}`,
        inline: false
      });
    }
  });

  await i.update({ embeds: [embed] });
});

// ================== REACTION ADD (LOCK) ==================
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const db = loadDB();
  const data = db[reaction.message.id];
  if (!data) return;

  const emoji = reaction.emoji.toString();

  if (!data.roles[emoji]) {
    await reaction.users.remove(user.id).catch(() => {});
    return;
  }

  const roleId = data.roles[emoji];
  const member = await reaction.message.guild.members.fetch(user.id);

  if (data.users[user.id]) {
    await reaction.users.remove(user.id).catch(() => {});
    await user.send(
`💌 แจ้งเตือนจาก ${SERVER_NAME}
${SERVER_INVITE}

> - คุณต้องกดอิโมจิเดิมเพื่อลบยศก่อน
> - แล้วค่อยเลือกยศใหม่ได้นะคะ 💖`
    ).catch(() => {});
    return;
  }

  await member.roles.add(roleId).catch(() => {});
  data.users[user.id] = {
    userId: user.id,
    roleId,
    emoji,
    time: Date.now()
  };
  saveDB(db);
});

// ================== REACTION REMOVE ==================
client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const db = loadDB();
  const data = db[reaction.message.id];
  if (!data || !data.users[user.id]) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.remove(data.users[user.id].roleId).catch(() => {});
  delete data.users[user.id];
  saveDB(db);
});

client.login(config.TOKEN);
