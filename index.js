const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const pino = require("pino")

let codeRequested = false // 🔥 مهم

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state
  })

  sock.ev.on("creds.update", saveCreds)

  const number = "201034110524" // 👈 رقمك

  sock.ev.on("connection.update", async (update) => {
    const { connection } = update

    if (connection === "connecting") {
      console.log("⏳ جاري الاتصال...")

      if (!sock.authState.creds.registered && !codeRequested) {
        codeRequested = true // 🔥 يمنع التكرار
        const code = await sock.requestPairingCode(number)
        console.log("🔑 كود الربط:", code)
      }
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
