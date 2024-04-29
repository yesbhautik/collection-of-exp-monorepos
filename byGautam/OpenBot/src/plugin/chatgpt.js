import dotenv from 'dotenv';
dotenv.config();
import OpenAI from "openai";
import { writeFile } from "fs/promises";
import fs from 'fs';
import path from 'path';

// Get the absolute path for the chat history file
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const chatHistoryFile = path.resolve(__dirname, '../chat_history.json');

// Load chat history from file
let chatHistory = readChatHistoryFromFile();

// Utility function to read chat history from file
function readChatHistoryFromFile() {
    try {
        const data = fs.readFileSync(chatHistoryFile, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
}

// Utility function to write chat history to file
function writeChatHistoryToFile() {
    fs.writeFileSync(chatHistoryFile, JSON.stringify(chatHistory, null, 2));
}

// Utility function to update chat history
function updateChatHistory(sender, message) {
    // If this is the first message from the sender, create a new array for the sender
    if (!chatHistory[sender]) {
        chatHistory[sender] = [];
    }
    // Add the message to the sender's chat history
    chatHistory[sender].push(message);
    // If the chat history exceeds the maximum length of 20 messages, remove the oldest message
    if (chatHistory[sender].length > 20) {
        chatHistory[sender].shift();
    }
}

// Utility function to delete user's chat history
function deleteChatHistory(userId) {
    delete chatHistory[userId];
    writeChatHistoryToFile(); // Save the updated chat history to file
}


const ai = async (m, Matrix) => {
    const text = m.body.toLowerCase();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_AI_API_KEY });
    
    if (text === "/forget") {
        // Delete the user's chat history
        deleteChatHistory(m.sender);
        await Matrix.sendMessage(m.from, { text: 'Conversession Deleted Sucsessfully' }, {quoted: m});
        // Return to exit the function
        return;
    }
    
    if (m.type === "imageMessage") {
      const command = m.body.split(' ')[0].toLowerCase();
      if (command == 'ai') {
      const thinkingMessage = await Matrix.sendMessage(m.from, { text: "Thinking..." }, { quoted: m });
      try {
    await m.React('⏳')
    const { key } = thinkingMessage;
    const buffer = await m.downloadFile(); // await to get the actual buffer
    const base64Image = buffer.toString('base64');
    const prompt = m.body.substring(command.length).trim() || 'Explain about this image';
      const response = await openai.chat.completions.create({
       model: "gpt-4-turbo",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  "url": `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      });
      await m.React('✅');
      if (process.env.MATRIX_TYPING == true) {
        await m.MatrixTypewriterEffect(response.choices[0].message.content, key);
      } else {
        await m.wait(response.choices[0].message.content, key)
      }
      } catch (err) {
        const { key } = thinkingMessage;
        await m.wait("Something Went Rong", key)
        console.log('Error: ', err)
      }}
      
    } else {
    
    const command = m.body.split(' ')[0].toLowerCase();
    const prompt = m.body.substring(command.length).trim();
    if (command == 'ai') {
    const thinkingMessage = await Matrix.sendMessage(m.from, { text: "Thinking..." }, { quoted: m });
    try {

    // If the sender has no chat history, create a new array for the sender
    if (!chatHistory[m.sender]) {
        chatHistory[m.sender] = [];
    }

    // Get chat history for the sender
    const senderChatHistory = chatHistory[m.sender];

    // Construct messages array with chat history and the incoming message
    const messages = [
        { role: "system", content: `You are ChatGPT, a large language model trained and developed by Goutam Kumar , to contact goutam "GitHub: MatrixCoder0101, Email: contact@matrixcoder.is-a.dev, WhatsApp: +91 99387 70375, Website: https://matrixcoder.tech". Follow the user's instructions carefully. Respond using markdown.` },
        ...senderChatHistory, // Previous chat history
        { role: "user", content: prompt } // Incoming message
    ];
    await m.React('⏳')
    const { key } = thinkingMessage;
    // Use OpenAI to generate a response based on the messages array
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-4",
    });

    // Add the incoming message and OpenAI-generated response to the sender's chat history
    updateChatHistory(m.sender, { role: "user", content: prompt });
    updateChatHistory(m.sender, { role: "assistant", content: completion.choices[0].message.content });

    // Save the updated chat history to file
    writeChatHistoryToFile();
    await m.React('✅');
    if (process.env.MATRIX_TYPING == true) {
      await m.MatrixTypewriterEffect(completion.choices[0].message.content, key);
    } else {
      await m.wait(completion.choices[0].message.content, key);
    }
    } catch (err) {
        const { key } = thinkingMessage;
        await m.wait("Something Went Rong", key);
        console.log('Error: ', err)
      }
    }}

}

export default ai;