const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const pino = require("pino")
const qrcode = require("qrcode")

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", async (update) => {
    const { connection, qr } = update

    if (qr) {
      console.log("📱 افتح اللينك ده عشان تعمل Scan:")
      const url = await qrcode.toDataURL(qr)
      console.log(url) // 🔥 ده هيطلعلك QR كصورة
    }

    if (connection === "open") {
      console.log("✅ البوت اشتغل!")
    }

    if (connection === "close") {
      console.log("❌ فصل... بيحاول تاني")
      startBot()
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
