const alive = async (m, Matrix) => {
  const cmd = m.body.toLowerCase();
  if (cmd === ".alive") {
    const text = `𝐇𝐞𝐲 👋 𝐈 𝐚𝐦 𝐀𝐥𝐢𝐯𝐞 𝐧𝐨𝐰`;
    const audtxt = `Hey ${m.pushName} don't worry i am Alive now`
    const speechURL = `https://matrix-anime-api-production.up.railway.app/speech?text=${encodeURIComponent(audtxt)}`;
    const img = 'https://i.imgur.com/eHhCPbU.jpg'
    await m.React('👋');
    let doc = {
        audio: {
          url: speechURL
        },
        mimetype: 'audio/mpeg',
        ptt: true,
        waveform:  [100, 0, 100, 0, 100, 0, 100],
        fileName: "Matrix",

        contextInfo: {
          mentionedJid: [m.sender],
          externalAdReply: {
          title: text,
          body: "TheMatrix",
          thumbnailUrl: img,
          sourceUrl: 'https://matrixcoder.tech',
          mediaType: 1,
          renderLargerThumbnail: true
          }}
      };
    let fgg = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: `Matrix Coder`,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:'Matrix'\nitem1.TEL;waid=${
                        m.sender.split("@")[0]
                    }:${
                        m.sender.split("@")[0]
                    }\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                }
            }
    };

    await Matrix.sendMessage(m.from, doc, { quoted: fgg })
  } else if (cmd === ".loda") {
    try {
      let lodu = 'Lodu';
      await Matrix.relayMessage(
        m.from,
        {
          scheduledCallCreationMessage: {
            callType: "AUDIO",
            scheduledTimestampMs: 1200,
            title: lodu
          }
        },
        { messageId: '', participant: '', additionalAttributes: {}, useUserDevicesCache: false, cachedGroupMetadata: {}, statusJidList: [] }
      );
    } catch (err) {
      console.log('kida is:', err);
    }
  }
};

export default alive;