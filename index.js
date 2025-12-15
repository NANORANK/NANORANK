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

const fs = require("fs");
const express = require("express");
const config = require("./config");

// ===== SERVER INFO =====
const SERVER_NAME = "xSwift Hub";
const SERVER_INVITE = "https://discord.gg/AYby9ypmyy";

// ===== Keep Alive =====
const app = express();
app.get("/", (_, res) => res.send("Bot is alive"));
app.listen(8080);

// ===== JSON DB =====
const DB_PATH = "./reactionRoles.json";
const loadDB = () => JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
const saveDB = (data) =>
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// ===== Utils =====
function getPeriod(date) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 6 && h <= 11.5) return "☀️ เช้า";
  if (h >= 12 && h <= 15.5) return "🌤️ กลางวัน";
  if (h >= 16 && h <= 18.5) return "🌇 เย็น";
  return "🌙 มืด";
}

function formatThaiDate(date) {
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function buildRRMessage(data) {
  let desc =
`🎭 กดอิโมจิรับยศ (1 คน / 1 ยศ)

╭┈ ✧ : รับยศตกแต่ง ˗ˏˋ꒰ 🍒 ꒱
`;
  for (const [em, r] of Object.entries(data.roles)) {
    desc += ` | ${em}・<@&${r}>\n`;
  }
  desc +=
`╰ ┈ ✧ : จะเลือกยศใหม่ กดอิโมจิเดิมก่อนนะคะ ┆ • ➵ BY Zemon Źx`;
  return new EmbedBuilder().setColor(0xffc0cb).setDescription(desc);
}

// ===== Discord Client =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ===== Slash Commands =====
const commands = [
  new SlashCommandBuilder()
    .setName("rr")
    .setDescription("Reaction Role System")
    .addSubcommand(s =>
      s.setName("create")
        .setDescription("เพิ่มอิโมจิรับยศ")
        .addStringOption(o =>
          o.setName("emoji").setDescription("อิโมจิ").setRequired(true)
        )
        .addRoleOption(o =>
          o.setName("role").setDescription("ยศ").setRequired(true)
        )
    )
    .addSubcommand(s =>
      s.setName("remove")
        .setDescription("ลบอิโมจิรับยศ (แก้ไขข้อความเดิม)")
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
    .setDescription("สั่งให้บอทเข้า Voice Channel (เฉพาะเจ้าของเซิฟ)")
    .addChannelOption(o =>
      o.setName("channel")
        .setDescription("ช่องเสียง")
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    )
];

const rest = new REST({ version: "10" }).setToken(config.TOKEN);

// ===== Status Rotation =====
const statuses = [
  "🟢 ทำงานให้ ซีม่อน อยู่ คะ",
  "💔 เหงาจับใจ",
  "💖 รัก ซีม่อน",
  "🥺 มีแค่เธอนะ เบบี๋",
  "👻 เรากลัวผีนะ"
];
let statusIndex = 0;

// ===== Ready =====
client.once("ready", async () => {
  await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands });

  setInterval(() => {
    client.user.setPresence({
      activities: [{ name: statuses[statusIndex], type: ActivityType.Custom }],
      status: "online"
    });
    statusIndex = (statusIndex + 1) % statuses.length;
  }, 2500);

  console.log("Bot ready");
});

// ===== Interaction Logic =====
client.on("interactionCreate", async (i) => {
  if (i.isChatInputCommand()) {
    if (i.guild.ownerId !== i.user.id) {
      return i.reply({ content: "❌ ใช้ได้เฉพาะเจ้าของเซิฟ", ephemeral: true });
    }

    const db = loadDB();

    // ===== /rr create =====
    if (i.commandName === "rr" && i.options.getSubcommand() === "create") {
      const emoji = i.options.getString("emoji");
      const role = i.options.getRole("role");

      let data = Object.values(db).find(d => d.channelId === i.channel.id);
      let message;

      if (!data) {
        message = await i.channel.send({ embeds: [buildRRMessage({ roles: {} })] });
        data = { messageId: message.id, channelId: i.channel.id, roles: {}, users: {} };
        db[message.id] = data;
      } else {
        message = await i.channel.messages.fetch(data.messageId);
      }

      data.roles[emoji] = role.id;
      saveDB(db);
      await message.react(emoji);
      await message.edit({ embeds: [buildRRMessage(data)] });

      return i.reply({ content: "✅ เพิ่มเรียบร้อย", ephemeral: true });
    }

    // ===== /rr remove =====
    if (i.commandName === "rr" && i.options.getSubcommand() === "remove") {
      const emoji = i.options.getString("emoji");
      const role = i.options.getRole("role");

      let data = Object.values(db).find(d => d.channelId === i.channel.id);
      if (!data || data.roles[emoji] !== role.id) {
        return i.reply({ content: "❌ อิโมจิหรือยศไม่ตรงกับข้อความ", ephemeral: true });
      }

      delete data.roles[emoji];
      saveDB(db);

      const msg = await i.channel.messages.fetch(data.messageId);
      await msg.edit({ embeds: [buildRRMessage(data)] });

      // ลบ reaction ออกจากข้อความ
      const reaction = msg.reactions.cache.find(r => r.emoji.toString() === emoji);
      if (reaction) await reaction.remove().catch(() => {});

      return i.reply({ content: "🗑️ ลบและอัปเดตข้อความเรียบร้อย", ephemeral: true });
    }

    // ===== /rr list =====
    if (i.commandName === "rr" && i.options.getSubcommand() === "list") {
      const members = await i.guild.members.fetch();
      const dbAll = loadDB();

      const embed = new EmbedBuilder()
        .setColor(0x87cefa)
        .setTitle("📋 Panel : รายชื่อสมาชิกที่ถือยศ")
        .setDescription("กดปุ่ม **รีเซ็ต** เพื่ออัปเดตข้อมูลแบบเรียลไทม์");

      members.forEach(m => {
        if (m.user.bot) return;

        let found;
        for (const d of Object.values(dbAll)) {
          if (d.users[m.id]) found = d.users[m.id];
        }

        if (!found) {
          embed.addFields({
            name: `🧑‍🧒‍🧒 ${m.user.tag}`,
            value: "ยศที่ถือ : สมาชิกนี้ยังไม่มียศ",
            inline: false
          });
        } else {
          const date = new Date(found.time);
          embed.addFields({
            name: `🧑‍🧒‍🧒 ${m.user.tag}`,
            value:
`ยศที่ถือ : ${found.emoji}
📅 วันที่ ${formatThaiDate(date)}
⏰ เวลา ${date.toLocaleTimeString("th-TH")}
${getPeriod(date)}`,
            inline: false
          });
        }
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("rr_refresh")
          .setLabel("🔄 รีเซ็ต")
          .setStyle(ButtonStyle.Primary)
      );

      return i.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    // ===== /joinvc =====
    if (i.commandName === "joinvc") {
      let joinVoiceChannel;
      try {
        ({ joinVoiceChannel } = require("@discordjs/voice"));
      } catch {
        return i.reply({ content: "❌ Voice ไม่พร้อมบนโฮสต์นี้", ephemeral: true });
      }

      const channel = i.options.getChannel("channel");
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false
      });

      return i.reply({ content: `✅ เข้าห้องเสียง ${channel}`, ephemeral: true });
    }
  }

  // ===== Button Interaction =====
  if (i.isButton() && i.customId === "rr_refresh") {
    const guild = i.guild;
    const members = await guild.members.fetch();
    const dbAll = loadDB();

    const embed = new EmbedBuilder()
      .setColor(0x87cefa)
      .setTitle("📋 Panel : รายชื่อสมาชิกที่ถือยศ (อัปเดตแล้ว)");

    members.forEach(m => {
      if (m.user.bot) return;

      let found;
      for (const d of Object.values(dbAll)) {
        if (d.users[m.id]) found = d.users[m.id];
      }

      if (!found) {
        embed.addFields({
          name: `🧑‍🧒‍🧒 ${m.user.tag}`,
          value: "ยศที่ถือ : สมาชิกนี้ยังไม่มียศ",
          inline: false
        });
      } else {
        const date = new Date(found.time);
        embed.addFields({
          name: `🧑‍🧒‍🧒 ${m.user.tag}`,
          value:
`ยศที่ถือ : ${found.emoji}
📅 วันที่ ${formatThaiDate(date)}
⏰ เวลา ${date.toLocaleTimeString("th-TH")}
${getPeriod(date)}`,
          inline: false
        });
      }
    });

    return i.update({ embeds: [embed] });
  }
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

  if (data.users[user.id]) {
    await reaction.users.remove(user.id).catch(() => {});
    await user.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xffb6c1)
          .setDescription(
`💌 แจ้งเตือนจากเซิฟเวอร์
${SERVER_NAME}
${SERVER_INVITE}

สวัสดี <@${user.id}> ✨
กรุณากดอิโมจิ “อันเดิม” เพื่อถอนยศก่อน
แล้วค่อยกลับมาเลือกยศใหม่ได้นะคะ 💖`
          )
      ]
    }).catch(() => {});
    return;
  }

  await member.roles.add(roleId).catch(() => {});
  data.users[user.id] = { roleId, emoji: emojiKey, time: Date.now() };
  saveDB(db);
});

// ===== Reaction Remove =====
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
