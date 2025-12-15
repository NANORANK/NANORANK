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

// ================== TIME (TH) ==================
const tz = config.TIMEZONE || "Asia/Bangkok";

const thaiDate = (d) =>
  new Intl.DateTimeFormat("th-TH", {
    timeZone: tz,
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(d);

const thaiTime = (d) =>
  new Intl.DateTimeFormat("th-TH", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(d);

const thaiPeriod = (d) => {
  const h = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      hour12: false
    }).format(d)
  );
  if (h >= 6 && h < 12) return "☀️ ตอนเช้า";
  if (h >= 12 && h < 16) return "🌤️ ตอนกลางวัน";
  if (h >= 16 && h < 19) return "🌇 ตอนเย็น";
  return "🌙 ตอนมืด";
};

// ================== RR EMBED ==================
function buildRRMessage(data) {
  let desc =
` # 🎭 กดอิโมจิรับยศ (1 คน / 1 ยศ)
> - <a:emoji_10:1449150901628440767> คุณเลือกได้ 1 ยศ เท่านั้น
> - <a:emoji_19:1449151254189314150> จะเลือกยศใหม่ กดอิโมจิ เดิมก่อนนะคะ
> - <a:emoji_34:1450185126901321892> และเลือก กดอิโมจิ รับยศใหม่ๆได้เลยคะ
> - <a:emoji_35:1450185285613650020> กดอิโมจิเกิน 1 อันบอทจะ DM คุณไป อ่านด้วยนะคะ
╭┈ ✧ : รับยศตกแต่ง ˗ˏˋ꒰ <a:emoji_2:1449148118690959440> ꒱
`;
  for (const [emoji, roleId] of Object.entries(data.roles)) {
    desc += ` | ${emoji}・<@&${roleId}>\n`;
  }
  desc +=
`╰ ┈ ✧ : รับยศตกแต่งฟรี 🐼 ┆ • ➵ BY Zemon Źx`;

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

// ================== CUSTOM STATUS ==================
const statuses = [
  "🕵️ ทำงานให้ ซีม่อน อยู่ คะ",
  "💔 เหงาจับใจ",
  "💖 รัก ซีม่อน",
  "🥺 มีแค่เธอนะ เบบี๋",
  "👻 เรากลัวผีนะ",
  "🦋 ผีเสื้อราตรี",
  "🌧️ โรคกลัวฝน",
  "🟢 ออนไลน์ 24/7",
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

// ================== RR LIST (BUTTON) ==================
client.on("interactionCreate", async (i) => {
  if (!i.isChatInputCommand()) return;
  if (i.commandName !== "rr") return;

  const db = loadDB();

  if (i.options.getSubcommand() === "list") {
    const members = await i.guild.members.fetch();
    const embed = new EmbedBuilder()
      .setColor(0x87cefa)
      .setTitle("📋 Panel : รายชื่อสมาชิกที่มียศตกแต่ง");

    members.forEach(m => {
      if (m.user.bot) return;

      let info;
      for (const d of Object.values(db)) {
        if (d.users?.[m.id]) info = d.users[m.id];
      }

      if (!info) {
        embed.addFields({
          name: `🧑‍🧒‍🧒 ผู้ใช้ : <@${m.id}>`,
          value: "🎐 ยศตกแต่ง : ยังไม่มียศ",
          inline: false
        });
      } else {
        const d = new Date(info.time);
        embed.addFields({
          name: `🧑‍🧒‍🧒 ผู้ใช้ : <@${m.id}>`,
          value:
`🎐 ยศตกแต่ง : ${info.emoji} ➜ <@&${info.roleId}>
📅 วันที่ : ${thaiDate(d)}
⏰ เวลา : ${thaiTime(d)}
${thaiPeriod(d)}`,
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

client.login(config.TOKEN);
