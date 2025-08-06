const axios = require("axios");

module.exports.config = {
  name: "sim",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Raihan",
  description: "Chat with Sakura AI using Simsimi API",
  commandCategory: "ai",
  usages: "[text/on/off/clear]",
  cooldowns: 2
};

let sakuraStatus = {};
let sakuraHistory = {};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (!sakuraStatus[threadID]) sakuraStatus[threadID] = true;
  if (!sakuraHistory[senderID]) sakuraHistory[senderID] = [];

  const input = args.join(" ");

  if (args[0] === "on") {
    sakuraStatus[threadID] = true;
    return api.sendMessage("✅ Sakura AI is now ON.", threadID, messageID);
  }

  if (args[0] === "off") {
    sakuraStatus[threadID] = false;
    return api.sendMessage("❌ Sakura AI has been turned OFF.", threadID, messageID);
  }

  if (args[0] === "clear") {
    sakuraHistory[senderID] = [];
    return api.sendMessage("🗑️ Sakura chat history cleared.", threadID, messageID);
  }

  if (!sakuraStatus[threadID]) {
    return api.sendMessage("⚠️ Sakura AI is currently OFF. Use 'sakura on' to turn it on.", threadID, messageID);
  }

  if (!input) {
    return api.sendMessage("💬 What would you like to say to Sakura?", threadID, messageID);
  }

  const waiting = await api.sendMessage("🌸 Sakura is thinking...", threadID);

  try {
    const res = await axios.post(
      "https://api.simsimi.vn/v1/simtalk",
      new URLSearchParams({ text: input, lc: "en" }),
      {
        timeout: 10000,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    if (res.data && res.data.message) {
      sakuraHistory[senderID].push({ user: input, sakura: res.data.message, time: Date.now() });

      if (sakuraHistory[senderID].length > 10) {
        sakuraHistory[senderID] = sakuraHistory[senderID].slice(-10);
      }

      return api.sendMessage(`🌸 Sakura: ${res.data.message}`, threadID, messageID);
    } else {
      throw new Error("No valid response");
    }
  } catch (err) {
    console.log("❗ Sakura API Error:", err.message);
    const fallback = [
      "I'm still learning... Try again?",
      "That's interesting! Tell me more!",
      "Sorry, I didn’t get that.",
      "Let's talk about something else!"
    ];
    const random = fallback[Math.floor(Math.random() * fallback.length)];
    return api.sendMessage(`🌸 Sakura: ${random}`, threadID, messageID);
  }
};
