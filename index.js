const {
  Client,
  GatewayIntentBits,
  Partials,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ActivityType,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { joinVoiceChannel } = require("@discordjs/voice");
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
  if (h >= 6 && h < 12) return "☀️ เช้า";
  if (h >= 12 && h < 16) return "🌤️ กลางวัน";
  if (h >= 16 && h < 19) return "🌇 เย็น";
  return "🌙 มืด";
};

// ================== RR EMBED ==================
function buildRRMessage(data) {
  let desc =
`🎭 กดอิโมจิรับยศ (1 คน / 1 ยศ)

╭┈ ✧ : รับยศตกแต่ง ˗ˏˋ꒰ 🍒 ꒱
`;

  for (const [emoji, roleId] of Object.entries(data.roles)) {
    desc += ` | ${emoji}・<@&${roleId}>\n`;
  }

  desc +=
`╰ ┈ ✧ : จะเลือกยศใหม่ กดอิโมจิเดิมก่อนนะคะ ┆ • ➵ BY Zemon Źx`;

  return new EmbedBuilder()
    .setColor(0xffc0cb)
    .setDescription(desc);
}

// ================== CLIENT ==================
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

// ================== COMMANDS ==================
const commands = [
  new SlashCommandBuilder()
    .setName("rr")
    .setDescription("Reaction Role System")
    .addSubcommand(s =>
      s.setName("add")
        .setDescription("เพิ่มอิโมจิ + ยศ (อัปเดตข้อความเดิม)")
        .addStringOption(o =>
          o.setName("emoji").setDescription("อิโมจิ").setRequired(true)
        )
        .addRoleOption(o =>
          o.setName("role").setDescription("ยศ").setRequired(true)
        )
    )
    .addSubcommand(s =>
      s.setName("remove")
        .setDescription("ลบอิโมจิ + ยศ (แก้ข้อความเดิม)")
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
    ),

  new SlashCommandBuilder()
    .setName("joinvc")
    .setDescription("ให้บอทเข้าห้องเสียง")
    .addChannelOption(o =>
      o.setName("channel")
        .setDescription("ช่องเสียง")
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    )
];

const rest = new REST({ version: "10" }).setToken(config.TOKEN);

// ================== READY ==================
client.once("ready", async () => {
  await rest.put(
    Routes.applicationCommands(config.CLIENT_ID),
    { body: commands }
  );
  console.log("Bot ready");
});

// ================== INTERACTION ==================
client.on("interactionCreate", async (i) => {
  if (!i.isChatInputCommand()) return;

  // owner only
  if (i.guild.ownerId !== i.user.id) {
    return i.reply({ content: "❌ เฉพาะเจ้าของเซิฟนะค้าบ", ephemeral: true });
  }

  const db = loadDB();

  // ===== RR ADD =====
  if (i.commandName === "rr" && i.options.getSubcommand() === "add") {
    const emoji = i.options.getString("emoji");
    const role = i.options.getRole("role");

    let data = Object.values(db).find(d => d.channelId === i.channel.id);
    let msg;

    if (!data) {
      msg = await i.channel.send({ embeds: [buildRRMessage({ roles: {} })] });
      data = {
        channelId: i.channel.id,
        messageId: msg.id,
        roles: {},
        users: {}
      };
      db[msg.id] = data;
    } else {
      msg = await i.channel.messages.fetch(data.messageId);
    }

    data.roles[emoji] = role.id;
    saveDB(db);

    await msg.react(emoji).catch(() => {});
    await msg.edit({ embeds: [buildRRMessage(data)] });

    return i.reply({ content: "✅ เพิ่มและอัปเดตข้อความเรียบร้อย", ephemeral: true });
  }

  // ===== RR REMOVE =====
  if (i.commandName === "rr" && i.options.getSubcommand() === "remove") {
    const emoji = i.options.getString("emoji");
    const role = i.options.getRole("role");

    let data = Object.values(db).find(d => d.channelId === i.channel.id);
    if (!data || data.roles[emoji] !== role.id) {
      return i.reply({ content: "❌ อิโมจิหรือยศไม่ตรง", ephemeral: true });
    }

    delete data.roles[emoji];
    saveDB(db);

    const msg = await i.channel.messages.fetch(data.messageId);
    await msg.edit({ embeds: [buildRRMessage(data)] });

    const react = msg.reactions.cache.find(r => r.emoji.toString() === emoji);
    if (react) await react.remove().catch(() => {});

    return i.reply({ content: "🗑️ ลบและอัปเดตข้อความแล้ว", ephemeral: true });
  }

  // ===== RR LIST =====
  if (i.commandName === "rr" && i.options.getSubcommand() === "list") {
    const members = await i.guild.members.fetch();
    const embed = new EmbedBuilder()
      .setColor(0x87cefa)
      .setTitle("📋 Panel : รายชื่อสมาชิกที่ถือยศ");

    members.forEach(m => {
      if (m.user.bot) return;

      let info;
      for (const d of Object.values(db)) {
        if (d.users?.[m.id]) info = d.users[m.id];
      }

      if (!info) {
        embed.addFields({
          name: `🧑‍🧒‍🧒 <@${m.id}>`,
          value: "ยศที่ถือ : ยังไม่มียศ",
          inline: false
        });
      } else {
        const d = new Date(info.time);
        embed.addFields({
          name: `🧑‍🧒‍🧒 <@${m.id}>`,
          value:
`ยศที่ถือ : ${info.emoji} ➜ <@&${info.roleId}>
📅 ${thaiDate(d)}
⏰ ${thaiTime(d)}
${thaiPeriod(d)}`,
          inline: false
        });
      }
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("rr_refresh")
        .setLabel("🔄 รีเฟรช")
        .setStyle(ButtonStyle.Primary)
    );

    return i.reply({ embeds: [embed], components: [row] });
  }

  // ===== JOIN VC =====
  if (i.commandName === "joinvc") {
    const channel = i.options.getChannel("channel");

    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    return i.reply({ content: `🎧 บอทเข้าห้อง ${channel} แล้วค้าบ` });
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
    .setTitle("📋 Panel : รายชื่อสมาชิกที่ถือยศ (อัปเดต)");

  members.forEach(m => {
    if (m.user.bot) return;

    let info;
    for (const d of Object.values(db)) {
      if (d.users?.[m.id]) info = d.users[m.id];
    }

    if (!info) {
      embed.addFields({
        name: `🧑‍🧒‍🧒 <@${m.id}>`,
        value: "ยศที่ถือ : ยังไม่มียศ",
        inline: false
      });
    } else {
      const d = new Date(info.time);
      embed.addFields({
        name: `🧑‍🧒‍🧒 <@${m.id}>`,
        value:
`ยศที่ถือ : ${info.emoji} ➜ <@&${info.roleId}>
📅 ${thaiDate(d)}
⏰ ${thaiTime(d)}
${thaiPeriod(d)}`,
        inline: false
      });
    }
  });

  await i.update({ embeds: [embed] });
});

// ================== REACTION ADD ==================
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const db = loadDB();
  const data = db[reaction.message.id];
  if (!data) return;

  const emoji = reaction.emoji.toString();
  const roleId = data.roles[emoji];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);

  // already has role
  if (data.users[user.id]) {
    await reaction.users.remove(user.id).catch(() => {});
    await user.send(
`💌 แจ้งเตือนจาก ${SERVER_NAME}
${SERVER_INVITE}

คุณต้องกดอิโมจิเดิมเพื่อลบยศก่อน
แล้วค่อยเลือกยศใหม่ได้นะคะ 💖`
    ).catch(() => {});
    return;
  }

  await member.roles.add(roleId).catch(() => {});
  data.users[user.id] = {
    userId: user.id,
    roleId,
    emoji,
    channelId: reaction.message.channel.id,
    messageId: reaction.message.id,
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
