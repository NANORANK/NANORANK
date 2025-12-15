require("dotenv").config();

module.exports = {
  TOKEN: process.env.TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  TIMEZONE: process.env.TIMEZONE || "Asia/Bangkok"
};
