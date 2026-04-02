const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const pino = require("pino")

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: true // 🔥 ده المهم
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "close") {
      console.log("❌ الاتصال اتقفل، بيحاول تاني...")
      startBot()
    } else if (connection === "open") {
      console.log("✅ البوت اشتغل!")
    }
  })

  sock.ev.on("messages.upsert", async (msg) => {
    const m = msg.messages[0]
    if (!m.message) return

    const text = m.message.conversation || ""

    if (text === "hi") {
      await sock.sendMessage(m.key.remoteJid, { text: "أهلا 🔥" })
    }
  })
}

startBot()
