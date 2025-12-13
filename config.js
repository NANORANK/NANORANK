module.exports = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  adminIds: (process.env.ADMIN_IDS || "").split(",").map(x => x.trim())
};
