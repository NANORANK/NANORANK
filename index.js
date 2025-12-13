const {
  Client, GatewayIntentBits, Partials,
  SlashCommandBuilder, REST, Routes,
  PermissionsBitField
} = require("discord.js");
const fs = require("fs");
const config = require("./config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const STORE = "./role_store.json";
let store = fs.existsSync(STORE) ? JSON.parse(fs.readFileSync(STORE)) : {};

const save = () => fs.writeFileSync(STORE, JSON.stringify(store, null, 2));

/* ---------- Slash Command ---------- */
const cmd = new SlashCommandBuilder()
  .setName("addrole")
  .setDescription("เพิ่ม reaction role (admin only)")
  .addStringOption(o => o.setName("message_id").setDescription("ไอดีข้อความ").setRequired(true))
  .addStringOption(o => o.setName("emoji").setDescription("อิโมจิ").setRequired(true))
  .addRoleOption(o => o.setName("role").setDescription("ยศ").setRequired(true));

/* ---------- Ready ---------- */
client.once("ready", async () => {
  console.log("Bot online:", client.user.tag);

  const rest = new REST({ version: "10" }).setToken(config.token);
  await rest.put(
    Routes.applicationCommands(config.clientId),
    { body: [cmd.toJSON()] }
  );
});

/* ---------- Interaction ---------- */
client.on("interactionCreate", async i => {
  if (!i.isChatInputCommand()) return;

  if (!config.adminIds.includes(i.user.id)) {
    return i.reply({ content: "❌ คำสั่งนี้สำหรับแอดมินเท่านั้น", ephemeral: true });
  }

  const msgId = i.options.getString("message_id");
  const emoji = i.options.getString("emoji");
  const role = i.options.getRole("role");

  const channel = i.channel;
  const msg = await channel.messages.fetch(msgId).catch(() => null);
  if (!msg) return i.reply({ content: "❌ ไม่พบข้อความ", ephemeral: true });

  if (!store[msgId]) store[msgId] = {};
  store[msgId][emoji] = role.id;
  save();

  await msg.react(emoji).catch(()=>{});

  let desc = Object.entries(store[msgId])
    .map(([e, r]) => `${e} = <@&${r}>`)
    .join("\n");

  await msg.edit({ content: desc });
  return i.reply({ content: "✅ เพิ่ม Reaction Role เรียบร้อย", ephemeral: true });
});

/* ---------- Reaction Add ---------- */
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;
  const msgId = reaction.message.id;
  const emoji = reaction.emoji.name;
  if (!store[msgId] || !store[msgId][emoji]) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  const roleId = store[msgId][emoji];

  const hasAny = Object.values(store[msgId]).some(r => member.roles.cache.has(r));
  if (hasAny && !member.roles.cache.has(roleId)) {
    reaction.users.remove(user.id);
    return member.send("คุณสามารถรับได้แค่ 1 ยศเท่านั้น").then(m=>setTimeout(()=>m.delete(),10000));
  }

  if (member.roles.cache.has(roleId)) {
    await member.roles.remove(roleId);
    return member.send(`คุณได้ถอน <@&${roleId}> แล้ว`).then(m=>setTimeout(()=>m.delete(),10000));
  } else {
    await member.roles.add(roleId);
    return member.send(`คุณได้รับ <@&${roleId}> แล้ว`).then(m=>setTimeout(()=>m.delete(),10000));
  }
});

/* ---------- Login ---------- */
client.login(config.token);