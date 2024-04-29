const ping = async (m, Matrix) => {
const cmd = m.body.toLowerCase();
if (cmd === ".ping") {

 const startTime = new Date();
 const { key } = await Matrix.sendMessage(m.from, { text: 'Pinging...' }, {quoted: m});
 await m.React('🍌')
 const text = `*Respond Speed: ${new Date() - startTime} ms*`
 await m.wait(text, key);
 await m.React('🍑')
}}

export default ping;