const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")

  const sock = makeWASocket({
    auth: state
  })

  sock.ev.on("creds.update", saveCreds)

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
