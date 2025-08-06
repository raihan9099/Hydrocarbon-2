const axios = require("axios");

module.exports = {
 config: {
  name: 'sakura',
  version: '2.0',
  author: 'NIB | JARiF | Enhanced',
  countDown: 3,
  role: 0,
  shortDescription: 'Sakura AI Chat',
  longDescription: {
   vi: 'Chat với Sakura AI - trợ lý thông minh ♡',
   en: 'Chat with Sakura AI - your intelligent assistant ♡'
  },
  category: 'AI',
  guide: {
   vi: '{pn} [on | off]: bật/tắt sakura AI ♡\n{pn} <tin nhắn>: chat với sakura AI ♡\n{pn} clear: xóa lịch sử chat\nVí dụ: {pn} xin chào',
   en: '{pn} [on | off]: enable/disable sakura AI ♡\n{pn} <message>: chat with sakura AI ♡\n{pn} clear: clear chat history\nExample: {pn} hello'
  }
 },

 langs: {
  vi: {
   turnedOn: '✅ Đã bật Sakura AI thành công! ♡',
   turnedOff: '❌ Đã tắt Sakura AI thành công!',
   chatting: '💭 Sakura đang suy nghĩ...',
   error: '😔 Sakura đang bận, vui lòng thử lại sau nhé!',
   cleared: '🗑️ Đã xóa lịch sử chat với Sakura!',
   noMessage: '💬 Bạn muốn nói gì với Sakura?',
   thinking: '🌸 Sakura đang suy nghĩ...'
  },
  en: {
   turnedOn: '✅ Sakura AI enabled successfully! ♡',
   turnedOff: '❌ Sakura AI disabled successfully!',
   chatting: '💭 Sakura is thinking...',
   error: '😔 Sakura is busy right now, please try again later!',
   cleared: '🗑️ Chat history with Sakura cleared!',
   noMessage: '💬 What would you like to say to Sakura?',
   thinking: '🌸 Sakura is thinking...'
  }
 },

 onStart: async function ({ args, threadsData, message, event, getLang }) {
  if (args[0] === 'on' || args[0] === 'off') {
   await threadsData.set(event.threadID, args[0] === "on", "settings.sakura");
   return message.reply(args[0] === "on" ? getLang("turnedOn") : getLang("turnedOff"));
  }

  if (args[0] === 'clear') {
   if (!global.sakuraHistory) global.sakuraHistory = {};
   global.sakuraHistory[event.senderID] = [];
   return message.reply(getLang("cleared"));
  }

  if (args[0]) {
   const yourMessage = args.join(" ");
   const thinkingMsg = await message.reply(getLang("thinking"));

   try {
    const langCode = (await threadsData.get(event.threadID, "settings.lang")) || global.GoatBot.config.language;
    const responseMessage = await getMessage(yourMessage, langCode, event.senderID);
    message.unsend(thinkingMsg.messageID);
    return message.reply(`🌸 Sakura: ${responseMessage}`);
   } catch (err) {
    console.error("Sakura error:", err);
    message.unsend(thinkingMsg.messageID);
    return message.reply(getLang("error"));
   }
  } else {
   return message.reply(getLang("noMessage"));
  }
 },

 onChat: async ({ args, message, threadsData, event, isUserCallCommand, getLang }) => {
  if (args.length > 1 && !isUserCallCommand && (await threadsData.get(event.threadID, "settings.sakura"))) {
   try {
    const langCode = (await threadsData.get(event.threadID, "settings.lang")) || global.GoatBot.config.language;
    const responseMessage = await getMessage(args.join(" "), langCode, event.senderID);
    return message.reply(`🌸 ${responseMessage}`);
   } catch (err) {
    console.error("Sakura chat error:", err);
    return message.reply(getLang("error"));
   }
  }
 }
};

// Initialize chat history
if (!global.sakuraHistory) {
 global.sakuraHistory = {};
}

async function getMessage(yourMessage, langCode, senderID) {
 if (!global.sakuraHistory[senderID]) {
  global.sakuraHistory[senderID] = [];
 }

 try {
  const res = await axios.post(
   'https://api.simsimi.vn/v1/simtalk',
   new URLSearchParams({
    'text': yourMessage,
    'lc': langCode || 'en'
   }),
   {
    timeout: 10000,
    headers: {
     'Content-Type': 'application/x-www-form-urlencoded',
     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
   }
  );

  if (res.status === 200 && res.data && res.data.message) {
   global.sakuraHistory[senderID].push({
    user: yourMessage,
    sakura: res.data.message,
    timestamp: Date.now()
   });

   if (global.sakuraHistory[senderID].length > 10) {
    global.sakuraHistory[senderID] = global.sakuraHistory[senderID].slice(-10);
   }

   return res.data.message;
  } else {
   throw new Error("Invalid response from primary API");
  }
 } catch (error) {
  console.log("Primary API failed, trying fallback...");

  const fallbackResponses = {
   en: [
    "I'm sorry, I'm having trouble understanding right now. Could you try again?",
    "That's interesting! Tell me more about that.",
    "I'm processing what you said. Can you rephrase that?",
    "I appreciate you talking to me! What else would you like to discuss?",
    "I'm here to chat with you! What's on your mind?"
   ],
   vi: [
    "Xin lỗi, mình đang gặp chút khó khăn. Bạn có thể thử lại không?",
    "Thật thú vị! Kể cho mình nghe thêm về điều đó.",
    "Mình đang xử lý những gì bạn nói. Bạn có thể nói lại không?",
    "Cảm ơn bạn đã trò chuyện với mình! Bạn muốn nói về gì nữa?",
    "Mình ở đây để chat với bạn! Bạn đang nghĩ gì thế?"
   ]
  };

  const responses = fallbackResponses[langCode] || fallbackResponses.en;
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  return randomResponse;
 }
}
