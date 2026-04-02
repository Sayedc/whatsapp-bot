const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const pino = require("pino")

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state
  })

  sock.ev.on("creds.update", saveCreds)

  // 🔥 حط رقمك هنا
  const number = "201034110524"

  if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode(number)
    console.log("🔑 كود الربط:", code)
  }

  sock.ev.on("connection.update", (update) => {
    const { connection } = update

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
