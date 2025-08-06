const axios = require('axios');

// SIMSIMI API KEY (optional)
const SIMSIMI_KEY = '848362ba-ce7f-4eba-b90d-c5f5f6ce999f'; // যদি থাকে key বসাও

module.exports.config = {
  name: "baby",
  version: "7.0.0",
  credits: "dipto + SimSimi",
  cooldowns: 0,
  hasPermssion: 0,
  description: "chat with SimSimi",
  commandCategory: "chat",
  category: "chat",
  usePrefix: true,
  prefix: true,
  usages: `[message]`,
};

module.exports.run = async function ({ api, event, args }) {
  const text = args.join(" ");
  if (!text) {
    return api.sendMessage("😺 কিছু লিখো Baby!", event.threadID, event.messageID);
  }

  try {
    const res = await axios.post("https://api.simsimi.vn/v1/simtalk", new URLSearchParams({
      text,
      lc: 'bn', // ভাষা bn = Bangla, en = English
      key: SIMSIMI_KEY
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const reply = res.data.message;
    return api.sendMessage(reply, event.threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
      });
    }, event.messageID);

  } catch (err) {
    return api.sendMessage("😿 SimSimi Error: " + err.message, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  try {
    const text = event.body;
    const res = await axios.post("https://api.simsimi.vn/v1/simtalk", new URLSearchParams({
      text,
      lc: 'bn',
      key: SIMSIMI_KEY
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const reply = res.data.message;
    return api.sendMessage(reply, event.threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID
      });
    }, event.messageID);

  } catch (err) {
    return api.sendMessage("😿 SimSimi Error: " + err.message, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  const body = event.body?.toLowerCase() || "";
  if (body.startsWith("😺") || body.startsWith("bot") || body.startsWith("baby")) {
    const text = body.replace(/^\S+\s*/, "");

    if (!text) {
      return api.sendMessage("হ্যা বলো আমি আছি 😸", event.threadID, (err, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID
        });
      }, event.messageID);
    }

    try {
      const res = await axios.post("https://api.simsimi.vn/v1/simtalk", new URLSearchParams({
        text,
        lc: 'bn',
        key: SIMSIMI_KEY
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const reply = res.data.message;
      return api.sendMessage(reply, event.threadID, (err, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID
        });
      }, event.messageID);

    } catch (err) {
      return api.sendMessage("😿 SimSimi Error: " + err.message, event.threadID, event.messageID);
    }
  }
};
