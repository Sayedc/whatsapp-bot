const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const P = require('pino');

const app = express();
const PORT = process.env.PORT || 3000;

// المصادر (حط IDs الجروبات بعدين)
const sources = ['120363123456789@g.us'];
const target = '120363987654321@g.us';
const sentMessages = new Set();

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: P({ level: 'silent' })
    });
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) console.log('QR:', qr);
        if (connection === 'open') console.log('✅ البوت شغال');
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.key.fromMe && msg.key.remoteJid && sources.includes(msg.key.remoteJid)) {
            const messageId = msg.key.id;
            if (sentMessages.has(messageId)) return;
            sentMessages.add(messageId);
            
            if (msg.message) {
                await sock.sendMessage(target, { forward: msg });
                console.log('✅ تم إعادة النشر');
            }
        }
    });
}

app.get('/', (req, res) => res.send('بوت واتساب شغال ✅'));
app.listen(PORT, () => console.log(`Server on ${PORT}`));
startBot();
