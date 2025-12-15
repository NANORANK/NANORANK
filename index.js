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

const fs = require("fs");
const express = require("express");
const config = require("./config");

// ===== Keep Alive =====
const app = express();
app.get("/", (_, res) => res.send("Bot is alive"));
app.listen(8080);

// ===== JSON DB =====
const DB_PATH = "./reactionRoles.json";
const loadDB = () => JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
const saveDB = (data) =>
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// ===== Discord Client =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages
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
        .setDescription("ลบอิโมจิรับยศ")
        .addStringOption(o =>
          o.setName("emoji").setDescription("อิโมจิ").setRequired(true)
        )
        .addRoleOption(o =>
          o.setName("role").setDescription("ยศ").setRequired(true)
        )
    )
    .addSubcommand(s =>
      s.setName("list")
        .setDescription("ดูรายชื่อคนที่ถือยศ (เจ้าของเซิฟเท่านั้น)")
    )
];

const rest = new REST({ version: "10" }).setToken(config.TOKEN);

// ===== Status Rotation =====
const statuses = [
  ":green_cycle: ทำงานให้ ซีม่อน อยู่ คะ",
  ":CM_63: เหงาจับใจ",
  ":a025IBO862454328816435210: รัก ซีม่อน",
  ":UNV34: มีแค่เธอนะ เบบี๋",
  ":ghostface1: เรากลัวผีนะ"
];

let statusIndex = 0;

// ===== Ready =====
client.once("ready", async () => {
  await rest.put(
    Routes.applicationCommands(config.CLIENT_ID),
    { body: commands }
  );

  setInterval(() => {
    client.user.setPresence({
      activities: [
        {
          name: statuses[statusIndex],
          type: ActivityType.Custom
        }
      ],
      status: "online"
    });
    statusIndex = (statusIndex + 1) % statuses.length;
  }, 2500);

  console.log("Bot ready");
});

// ===== Interaction Logic =====
client.on("interactionCreate", async (i) => {
  if (!i.isChatInputCommand()) return;

  // Owner only
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
      message = await i.channel.send({
        embeds: [new EmbedBuilder().setColor(0xffc0cb).setDescription("🎭 กดอิโมจิรับยศ")]
      });

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

    let desc =
`🎭 กดอิโมจิรับยศ (1 คน / 1 ยศ)

╭┈ ✧ : รับยศตกแต่ง ˗ˏˋ꒰ 🍒 ꒱
`;

    for (const [em, r] of Object.entries(data.roles)) {
      desc += ` | ${em}・<@&${r}>\n`;
    }

    desc +=
`╰ ┈ ✧ : จะเลือกยศใหม่ กดอิโมจิเดิมก่อนนะคะ ┆ • ➵ BY Zemon Źx`;

    await message.edit({
      embeds: [new EmbedBuilder().setColor(0xffc0cb).setDescription(desc)]
    });

    return i.reply({ content: "✅ เพิ่มเรียบร้อย", ephemeral: true });
  }

  // ===== /rr remove =====
  if (i.commandName === "rr" && i.options.getSubcommand() === "remove") {
    const emoji = i.options.getString("emoji");
    const role = i.options.getRole("role");

    let data = Object.values(db).find(d => d.channelId === i.channel.id);
    if (!data || data.roles[emoji] !== role.id) {
      await i.user.send(
        `⚠️ แจ้งเตือน\nไม่พบอิโมจิ ${emoji} กับยศ ${role}\nกรุณาตรวจสอบอีกครั้งนะคะ`
      );
      return i.reply({ content: "❌ ข้อมูลไม่ตรง (ส่ง DM แล้ว)", ephemeral: true });
    }

    delete data.roles[emoji];
    saveDB(db);
    return i.reply({ content: "✅ ลบเรียบร้อย", ephemeral: true });
  }

  // ===== /rr list =====
  if (i.commandName === "rr" && i.options.getSubcommand() === "list") {
    let text = "📋 **รายชื่อสมาชิกที่ถือยศ**\n\n";

    for (const data of Object.values(db)) {
      for (const [userId, info] of Object.entries(data.users)) {
        const date = new Date(info.time);
        text +=
`👤 <@${userId}>
🎭 ${info.emoji} → <@&${info.roleId}>
🕒 ${date.toLocaleString("th-TH")}

`;
      }
    }

    if (text === "📋 **รายชื่อสมาชิกที่ถือยศ**\n\n") {
      text += "ยังไม่มีใครถือยศเลยนะคะ";
    }

    return i.reply({
      embeds: [new EmbedBuilder().setColor(0x90ee90).setDescription(text)],
      ephemeral: true
    });
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

คุณได้รับยศ <@&${data.users[user.id].roleId}> ไปแล้วนะคะ ✨
กรุณากดอิโมจิเดิมเพื่อถอนยศ แล้วเลือกใหม่ได้เลย 💖`
          )
      ]
    }).catch(() => {});
    return;
  }

  await member.roles.add(roleId).catch(() => {});
  data.users[user.id] = {
    roleId,
    emoji: emojiKey,
    time: Date.now()
  };
  saveDB(db);
});

// ===== Reaction Remove =====
client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const db = loadDB();
  const data = db[reaction.message.id];
  if (!data) return;

  if (!data.users[user.id]) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.remove(data.users[user.id].roleId).catch(() => {});
  delete data.users[user.id];
  saveDB(db);
});

client.login(config.TOKEN);
