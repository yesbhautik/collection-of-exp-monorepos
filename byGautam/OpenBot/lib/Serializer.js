import {
    getContentType,
    jidDecode,
    downloadMediaMessage,
    downloadContentFromMessage
} from "@whiskeysockets/baileys";


function decodeJid(jid) {
    const { user, server } = jidDecode(jid) || {};
    return user && server ? `${user}@${server}`.trim() : jid;
}

const downloadMedia = async message => {
    let type = Object.keys(message)[0];
    let m = message[type];
    if (type === "buttonsMessage" || type === "viewOnceMessageV2") {
        if (type === "viewOnceMessageV2") {
            m = message.viewOnceMessageV2?.message;
            type = Object.keys(m || {})[0];
        } else type = Object.keys(m || {})[1];
        m = m[type];
    }
    const stream = await downloadContentFromMessage(
        m,
        type.replace("Message", "")
    );
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
};


function serialize(m, Matrix, logger) {
  // downloadFile function
async function downloadFile(m) {
  try {
    const buffer = await downloadMediaMessage(
      m,
      "buffer",
      {},
      { logger, reuploadRequest: Matrix.updateMediaMessage }
    );
    return buffer;
  } catch (error) {
    console.error('Error downloading media:', error);
    return null; // or throw the error if you want to propagate it
  }
}

// React function
async function React(emoji) {
      let reactm = {
        react: {
          text: emoji,
          key: m.key,
        },
      };
    await Matrix.sendMessage(m.from, reactm);
}

// Matrix Loading Effect
async function loading (str, key) {
var goutamload = [
`ㅤʟᴏᴀᴅɪɴɢ
《 █▒▒▒▒▒▒▒▒▒▒▒》10%`,
`ㅤʟᴏᴀᴅɪɴɢ
《 ████▒▒▒▒▒▒▒▒》30%`,
`ㅤʟᴏᴀᴅɪɴɢ
《 ███████▒▒▒▒▒》50%`,
`ㅤʟᴏᴀᴅɪɴɢ
《 ██████████▒▒》80%`,
`ㅤʟᴏᴀᴅɪɴɢ
《 ████████████》100%`,
`${str}`
];

for (let i = 0; i < goutamload.length; i++) {
//await delay(10)
    await Matrix.relayMessage(m.from, {
      protocolMessage: {
        key: key,
        type: 14,
        editedMessage: {
          conversation: goutamload[i]
        }
      }
    }, {});
}}  

// Matrix TypeWriter Effect
async function MatrixTypewriterEffect(text, key) {
// let { key } = await client.sendMessage(from, {text: 'Thinking...'}, {quoted: m})

  for (let i = 0; i < text.length; i++) {
    const noobText = text.slice(0, i + 1);
    await Matrix.relayMessage(m.from, {
      protocolMessage: {
        key: key,
        type: 14,
        editedMessage: {
          conversation: noobText
        }
      }
    }, {});
 //  await delay(100); // Adjust the delay time (in milliseconds) as needed
  }
}


async function wait(text, key) {
    await Matrix.relayMessage(m.from, {
      protocolMessage: {
        key: key,
        type: 14,
        editedMessage: {
          conversation: text
        }
      }
    }, {});
 //  await delay(100); // Adjust the delay time (in milliseconds) as needed
}

    if (m.key) {
        m.id = m.key.id;
        m.isSelf = m.key.fromMe;
        m.from = decodeJid(m.key.remoteJid);
        m.isGroup = m.from.endsWith("@g.us");
        m.sender = m.isGroup
            ? decodeJid(m.key.participant)
            : m.isSelf
            ? decodeJid(Matrix.user.id)
            : m.from;
    }
    if (m.message) {
        m.type = getContentType(m.message);
        if (m.type === "ephemeralMessage") {
            m.message = m.message[m.type].message;
            const tipe = Object.keys(m.message)[0];
            m.type = tipe;
            if (tipe === "viewOnceMessageV2") {
                m.message = m.message[m.type].message;
                m.type = getContentType(m.message);
            }
        }
        if (m.type === "viewOnceMessageV2") {
            m.message = m.message[m.type].message;
            m.type = getContentType(m.message);
        }
        m.messageTypes = type =>
            ["videoMessage", "imageMessage"].includes(type);
        try {
            const quoted = m.message[m.type]?.contextInfo;
            if (quoted.quotedMessage["ephemeralMessage"]) {
                const tipe = Object.keys(
                    quoted.quotedMessage.ephemeralMessage.message
                )[0];
                if (tipe === "viewOnceMessageV2") {
                    m.quoted = {
                        type: "view_once",
                        stanzaId: quoted.stanzaId,
                        participant: decodeJid(quoted.participant),
                        message:
                            quoted.quotedMessage.ephemeralMessage.message
                                .viewOnceMessage.message
                    };
                } else {
                    m.quoted = {
                        type: "ephemeral",
                        stanzaId: quoted.stanzaId,
                        participant: decodeJid(quoted.participant),
                        message: quoted.quotedMessage.ephemeralMessage.message
                    };
                }
            } else if (quoted.quotedMessage["viewOnceMessageV2"]) {
                m.quoted = {
                    type: "view_once",
                    stanzaId: quoted.stanzaId,
                    participant: decodeJid(quoted.participant),
                    message: quoted.quotedMessage.viewOnceMessage.message
                };
            } else {
                m.quoted = {
                    type: "normal",
                    stanzaId: quoted.stanzaId,
                    participant: decodeJid(quoted.participant),
                    message: quoted.quotedMessage
                };
            }
            m.quoted.isSelf =
                m.quoted.participant === decodeJid(Matrix.user.id);
            m.quoted.mtype = Object.keys(m.quoted.message).filter(
                v => v.includes("Message") || v.includes("conversation")
            )[0];
            m.quoted.text =
                m.quoted.message[m.quoted.mtype]?.text ||
                m.quoted.message[m.quoted.mtype]?.description ||
                m.quoted.message[m.quoted.mtype]?.caption ||
                m.quoted.message[m.quoted.mtype]?.hydratedTemplate
                    ?.hydratedContentText ||
                m.quoted.message[m.quoted.mtype] ||
                "";
            m.quoted.key = {
                id: m.quoted.stanzaId,
                fromMe: m.quoted.isSelf,
                remoteJid: m.from
            };
            m.quoted.download = () => downloadMedia(m.quoted.message);
        } catch {
            m.quoted = null;
        }
        m.body =
            m.message?.conversation ||
            m.message?.[m.type]?.text ||
            m.message?.[m.type]?.caption ||
            (m.type === "listResponseMessage" &&
                m.message?.[m.type]?.singleSelectReply?.selectedRowId) ||
            (m.type === "buttonsResponseMessage" &&
                m.message?.[m.type]?.selectedButtonId) ||
            (m.type === "templateButtonReplyMessage" &&
                m.message?.[m.type]?.selectedId) ||
            "";
        m.reply = text => Matrix.sendMessage(m.from, { text }, { quoted: m });
        m.mentions = [];
        if (m.quoted?.participant) m.mentions.push(m.quoted.participant);
        const array = m?.message?.[m.type]?.contextInfo?.mentionedJid || [];
        m.mentions.push(...array.filter(Boolean));
        m.download = () => downloadMedia(m.message);
        m.downloadFile = () => downloadFile(m);
        m.React = (emoji) => React(emoji);
        m.loading = (str, key) => loading (str, key);
        m.MatrixTypewriterEffect = (text, key) => MatrixTypewriterEffect(text, key);
        m.wait = (text, key) => wait(text, key);
    }
    return m;
}

export { decodeJid, serialize };